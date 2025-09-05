// E:\newsgenie\src\lib\chat.ts
import { prisma } from './db';
import {
  generateChatResponse,
  answerQuestionAboutArticle,
  exploreTopic,
  generatePersonalizedBriefing,
} from './openai';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: Date;
  articleIds?: string[];
}

export interface Conversation {
  id: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
  messages: ChatMessage[];
}

/**
 * Create a new conversation for a user
 */
export async function createConversation(userId: string, title?: string): Promise<Conversation> {
  try {
    const conversation = await prisma.conversation.create({
      data: {
        userId,
        title: title || 'New Conversation',
      },
      include: {
        messages: {
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    });

    // cast Prisma result to local Conversation interface
    return conversation as unknown as Conversation;
  } catch (error) {
    console.error('Error creating conversation:', error);
    throw error;
  }
}

/**
 * Get recent conversations for a user (preview)
 */
export async function getUserConversations(userId: string): Promise<Conversation[]> {
  try {
    const conversations = await prisma.conversation.findMany({
      where: {
        userId,
      },
      orderBy: {
        updatedAt: 'desc',
      },
      include: {
        messages: {
          orderBy: {
            createdAt: 'asc',
          },
          take: 1,
        },
      },
    });

    return conversations as unknown as Conversation[];
  } catch (error) {
    console.error('Error getting conversations:', error);
    throw error;
  }
}

/**
 * Get one full conversation with messages
 */
export async function getConversation(
  conversationId: string,
  userId: string
): Promise<Conversation | null> {
  try {
    const conversation = await prisma.conversation.findFirst({
      where: {
        id: conversationId,
        userId,
      },
      include: {
        messages: {
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    });

    return (conversation as unknown as Conversation) ?? null;
  } catch (error) {
    console.error('Error getting conversation:', error);
    throw error;
  }
}

/**
 * Add a message to a conversation
 */
export async function addMessage(
  conversationId: string,
  role: 'user' | 'assistant',
  content: string,
  articleIds: string[] = []
): Promise<ChatMessage> {
  try {
    const message = await prisma.message.create({
      data: {
        conversationId,
        role,
        content,
        articleIds,
      },
    });

    await prisma.conversation.update({
      where: {
        id: conversationId,
      },
      data: {
        updatedAt: new Date(),
      },
    });

    return message as unknown as ChatMessage;
  } catch (error) {
    console.error('Error adding message:', error);
    throw error;
  }
}

/**
 * Generate AI response for a conversation and save both messages.
 * Important: normalize DB role (string) -> OpenAI allowed role union.
 */
export async function generateAndSaveResponse(
  conversationId: string,
  userMessage: string,
  userId: string,
  articleIds: string[] = []
): Promise<{ response: string; messageId: string }> {
  try {
    // Get conversation history
    const conversation = await getConversation(conversationId, userId);
    if (!conversation) {
      throw new Error('Conversation not found');
    }

    // Normalize DB roles (which may be `string`) into the literal union OpenAI expects.
    // Accept only 'system' | 'user' | 'assistant'; fallback to 'user'.
    const normalizeRole = (r: unknown): 'system' | 'user' | 'assistant' => {
      if (r === 'system') return 'system';
      if (r === 'assistant') return 'assistant';
      if (r === 'user') return 'user';
      return 'user';
    };

    // Map existing conversation messages to OpenAI-friendly shape
    const chatMessages: { role: 'system' | 'user' | 'assistant'; content: string }[] =
      conversation.messages.map((msg) => ({
        // msg.role may be a string at runtime; normalizeRole will handle it
        role: normalizeRole((msg as unknown as { role?: string }).role),
        content: msg.content ?? '',
      }));

    // Append the incoming user message as the latest 'user' message that the model should respond to.
    chatMessages.push({ role: 'user', content: userMessage });

    // Fetch article contexts if provided
    let articleContext: string[] = [];
    if (articleIds.length > 0) {
      const articles = await prisma.article.findMany({
        where: {
          id: { in: articleIds },
        },
      });

      articleContext = articles.map(
        (article) =>
          `Title: ${article.title}\nContent: ${article.content ?? article.description ?? ''}`
      );
    }

    // Call OpenAI helper to generate response
    const responseContent = await generateChatResponse(chatMessages, articleContext);

    // Persist user message & assistant response
    await addMessage(conversationId, 'user', userMessage, articleIds);
    const assistantMessage = await addMessage(conversationId, 'assistant', responseContent);

    // If this was the first exchange, update the conversation title
    if (conversation.messages.length === 0) {
      const title = userMessage.length > 30 ? `${userMessage.substring(0, 30)}...` : userMessage;
      await prisma.conversation.update({
        where: { id: conversationId },
        data: { title },
      });
    }

    return {
      response: responseContent,
      messageId: assistantMessage.id,
    };
  } catch (error) {
    console.error('Error generating response:', error);
    throw error;
  }
}

/**
 * Ask a question about a single article
 */
export async function answerArticleQuestion(
  articleId: string,
  question: string
): Promise<{ answer: string; articleTitle: string }> {
  try {
    const article = await prisma.article.findUnique({
      where: { id: articleId },
    });

    if (!article) {
      throw new Error('Article not found');
    }

    const sourceText = article.content ?? article.description ?? article.title ?? '';
    const answer = await answerQuestionAboutArticle(question, sourceText);

    return {
      answer,
      articleTitle: article.title,
    };
  } catch (error) {
    console.error('Error answering article question:', error);
    throw error;
  }
}

/**
 * Explore a topic, using optional user preferences
 *
 * Note: `exploreTopic` comes from your openai helpers and may return a complex object.
 * Use `unknown` here to avoid implicit `any` while still passing the value through.
 */
export async function exploreNewsTopic(userId: string, topic: string): Promise<unknown> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { userPreference: true },
    });

    const preferences = user?.userPreference
      ? {
          interests: user.userPreference.interests,
          country: user.userPreference.country,
          language: user.userPreference.language,
        }
      : undefined;

    const exploration: unknown = await exploreTopic(topic, preferences);

    return exploration;
  } catch (error) {
    console.error('Error exploring topic:', error);
    throw error;
  }
}

/**
 * Create a personalized briefing for a user based on preferences and recent articles
 */
export async function createPersonalizedBriefing(userId: string): Promise<{
  briefing: string;
  articlesCount: number;
}> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { userPreference: true },
    });

    if (!user || !user.userPreference) {
      throw new Error('User preferences not found');
    }

    const interests =
      user.userPreference.interests && user.userPreference.interests.length > 0
        ? user.userPreference.interests
        : ['general', 'business', 'technology'];

    const recentArticles = await prisma.article.findMany({
      where: {
        category: { in: interests },
        country: user.userPreference.country,
        language: user.userPreference.language,
      },
      orderBy: { publishedAt: 'desc' },
      take: 10,
    });

    const articleSummaries = recentArticles.map((article) => ({
      title: article.title,
      summary: article.summary ?? article.description ?? '',
      category: article.category,
      // publishedAt may be string or Date, ensure ISO string
      publishedAt: new Date(article.publishedAt).toISOString(),
    }));

    const briefing = await generatePersonalizedBriefing(
      {
        interests: user.userPreference.interests,
        country: user.userPreference.country,
        language: user.userPreference.language,
      },
      articleSummaries
    );

    return {
      briefing,
      articlesCount: recentArticles.length,
    };
  } catch (error) {
    console.error('Error creating personalized briefing:', error);
    throw error;
  }
}
