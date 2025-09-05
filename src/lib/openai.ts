// E:\newsgenie\src\lib\openai.ts
import OpenAI from 'openai';
import { JSDOM } from 'jsdom';
import { Readability } from '@mozilla/readability';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';
// Make the model configurable via env. Default to a reliable production model you have access to.
const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-4o';

// instantiate client
const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
});

/* -------------------------
   Basic utilities & types
   ------------------------- */

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

/* -------------------------
   Simple article functions
   ------------------------- */

/**
 * Summarize an article into 2-3 factual sentences.
 */
export async function summarizeArticle(content: string): Promise<string> {
  try {
    const system = `You are a professional news summarizer. Produce a concise factual summary in 2-3 sentences that covers the main facts: who, what, when, where, and why/impact if available. Do not hallucinate; if information is missing, say "Not stated in the article."`;
    const response = await openai.chat.completions.create({
      model: OPENAI_MODEL,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: `Article:\n\n${content}` },
      ],
      max_tokens: 220,
      temperature: 0.15,
    });

    return (
      response.choices?.[0]?.message?.content?.trim() ??
      'Summary not available.'
    );
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('OpenAI summarization error:', error.message);
    } else {
      console.error('OpenAI summarization unknown error:', error);
    }
    return 'Summary not available.';
  }
}

/**
 * Return one of: 'positive' | 'negative' | 'neutral'.
 */
export async function analyzeSentiment(
  text: string
): Promise<'positive' | 'negative' | 'neutral'> {
  try {
    const response = await openai.chat.completions.create({
      model: OPENAI_MODEL,
      messages: [
        {
          role: 'system',
          content:
            "You will analyze the sentiment of the provided text. Reply with exactly one word: positive, negative, or neutral.",
        },
        { role: 'user', content: text },
      ],
      max_tokens: 6,
      temperature: 0,
    });

    const raw = response.choices?.[0]?.message?.content?.toLowerCase().trim();
    if (raw === 'positive' || raw === 'negative') return raw;
    return 'neutral';
  } catch (error: unknown) {
    if (error instanceof Error) console.error('OpenAI sentiment error:', error.message);
    else console.error('OpenAI sentiment unknown error:', error);
    return 'neutral';
  }
}

/**
 * Extract 3-6 keywords/phrases from text as an array.
 */
export async function extractKeywords(text: string): Promise<string[]> {
  try {
    const response = await openai.chat.completions.create({
      model: OPENAI_MODEL,
      messages: [
        {
          role: 'system',
          content:
            'Extract 3 to 6 concise keywords or short phrases that capture the main topics of the text. Return them as a single comma-separated line.',
        },
        { role: 'user', content: text },
      ],
      max_tokens: 80,
      temperature: 0.2,
    });

    const content = response.choices?.[0]?.message?.content ?? '';
    return content
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 6);
  } catch (error: unknown) {
    if (error instanceof Error) console.error('OpenAI keywords error:', error.message);
    else console.error('OpenAI keywords unknown error:', error);
    return [];
  }
}

/* -------------------------
   Conversational/chat APIs
   ------------------------- */

/**
 * Generate a chat response given messages and optional article context.
 * articleContext: array of short strings like "1) Title — Source (date) — snippet — url"
 */
export async function generateChatResponse(
  messages: ChatMessage[],
  articleContext?: string[]
): Promise<string> {
  try {
    let systemMessage =
      'You are NewsGenie, an expert news assistant. Provide clear, accurate, and well-sourced answers. Avoid hallucination. When provided with news context, prefer facts from that context and cite sources inline (Source, date). If something is not supported by provided context, clearly state that.';

    if (articleContext && articleContext.length > 0) {
      // Keep context compact to fit tokens
      const ctx = articleContext.slice(0, 6).join('\n');
      systemMessage += `\n\nContext (use when relevant):\n${ctx}`;
    }

    const payloadMessages: ChatMessage[] = [
      { role: 'system', content: systemMessage },
      ...messages.filter((m) => m.role !== 'system'),
    ];

    const response = await openai.chat.completions.create({
      model: OPENAI_MODEL,
      messages: payloadMessages,
      max_tokens: 1100,
      temperature: 0.25,
    });

    return response.choices?.[0]?.message?.content ?? "I'm sorry, I couldn't generate a response.";
  } catch (error: unknown) {
    if (error instanceof Error) console.error('OpenAI chat error:', error.message);
    else console.error('OpenAI chat unknown error:', error);
    return "I'm experiencing technical difficulties. Please try again later.";
  }
}

/**
 * Compatibility wrapper intended to be used by your chat layer (e.g., generateAndSaveResponse in /lib/chat).
 * If you already have a generateAndSaveResponse implementation, call generateChatResponse directly there.
 */
export async function generateAndSaveResponse(
  conversationId: string,
  userMessage: string,
  userId: string,
  articleContext?: string[]
): Promise<{ reply: string; saved?: boolean }> {
  try {
    const reply = await generateChatResponse([{ role: 'user', content: userMessage }], articleContext);
    // NOTE: This wrapper does not save to DB — your '@/lib/chat' should handle DB persistence.
    return { reply, saved: false };
  } catch (error: unknown) {
    if (error instanceof Error) console.error('generateAndSaveResponse error:', error.message);
    else console.error('generateAndSaveResponse unknown error:', error);
    return { reply: "I'm experiencing technical difficulties. Please try again later.", saved: false };
  }
}

/* -------------------------
   Article Q&A + scraping-aware
   ------------------------- */

/**
 * Answer a question strictly using the provided article content. If answer is not present, say "Not stated in the article."
 */
export async function answerQuestionAboutArticle(
  question: string,
  articleContent: string
): Promise<string> {
  try {
    const system = 'You answer questions strictly from the provided article text. If the answer is not present, respond: "Not stated in the article." Provide detail when available.';
    const response = await openai.chat.completions.create({
      model: OPENAI_MODEL,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: `Article:\n${articleContent}\n\nQuestion: ${question}` },
      ],
      max_tokens: 800,
      temperature: 0.15,
    });

    return response.choices?.[0]?.message?.content ?? "I couldn't answer that question based on the article content.";
  } catch (error: unknown) {
    if (error instanceof Error) console.error('OpenAI QA error:', error.message);
    else console.error('OpenAI QA unknown error:', error);
    return "I'm experiencing technical difficulties. Please try again later.";
  }
}

/**
 * Answer a question with optional reference to the original URL.
 * Returns both answer text and any sources (URLs) the model mentions or the provided articleUrl.
 */
export async function answerQuestionAboutArticleWithWebScraping(
  question: string,
  articleContent: string,
  articleUrl?: string
): Promise<{ answer: string; sources: string[] }> {
  try {
    let system = 'You are an AI assistant that answers questions about news articles. Base answers primarily on the provided article content. If the required information is not in the article, say so. Be comprehensive when possible.';
    if (articleUrl) {
      system += ` The original article URL: ${articleUrl}. You may refer to it when citing sources.`;
    }

    const response = await openai.chat.completions.create({
      model: OPENAI_MODEL,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: `Article content:\n${articleContent}\n\nQuestion: ${question}` },
      ],
      max_tokens: 1000,
      temperature: 0.2,
    });

    const answer = response.choices?.[0]?.message?.content ?? "I couldn't answer that question based on the article content.";

    // collect sources: include articleUrl and any URLs mentioned by the model
    const sources: string[] = [];
    if (articleUrl) sources.push(articleUrl);

    const urlRegex = /https?:\/\/[^\s)]+/g;
    const found = answer.match(urlRegex) ?? [];
    for (const u of found) {
      if (!sources.includes(u)) sources.push(u);
    }

    return { answer, sources };
  } catch (error: unknown) {
    if (error instanceof Error) console.error('OpenAI QA+scrape error:', error.message);
    else console.error('OpenAI QA+scrape unknown error:', error);
    return { answer: "I'm experiencing technical difficulties. Please try again later.", sources: [] };
  }
}

/* -------------------------
   Article helpers & advanced utils
   ------------------------- */

/**
 * Extract article content from URL using Readability.js
 */
export async function extractArticleContentFromUrl(url: string): Promise<{
  title: string;
  content: string;
  author?: string;
  publishDate?: string;
}> {
  try {
    console.log(`Extracting content from URL: ${url}`);
    
    // Fetch the HTML content
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch article: ${response.status} ${response.statusText}`);
    }
    
    const html = await response.text();
    
    // Parse the HTML
    const dom = new JSDOM(html, { url });
    
    // Use Readability to extract the article content
    const reader = new Readability(dom.window.document);
    const article = reader.parse();
    
    if (!article) {
      throw new Error('Failed to parse article content');
    }
    
    // Clean up the content
    let cleanContent = article.content
      ? article.content
          .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '') // Remove scripts
          .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '') // Remove styles
          .replace(/<[^>]+>/g, '') // Remove HTML tags
          .replace(/\s+/g, ' ') // Replace multiple spaces with single space
          .trim()
      : '';
    
    // If content is too short, try alternative extraction
    if (cleanContent.length < 200) {
      // Try to get text from paragraphs
      const paragraphs = Array.from(dom.window.document.querySelectorAll('p'));
      cleanContent = paragraphs
        .map(p => (p as HTMLElement).textContent?.trim())
        .filter((text): text is string => text !== undefined && text.length > 20)
        .join('\n\n');
    }
    
    return {
      title: article.title || '',
      content: cleanContent,
      author: article.byline || undefined,
      publishDate: article.publishedTime || undefined
    };
  } catch (error) {
    console.error('Error extracting article content:', error);
    return {
      title: '',
      content: '',
      author: undefined,
      publishDate: undefined
    };
  }
}

/**
 * Explore topic: explanation, related topics, suggested questions
 */
export async function exploreTopic(
  topic: string,
  userPreferences?: { interests: string[]; country: string; language: string }
): Promise<{ explanation: string; relatedTopics: string[]; suggestedQuestions: string[] }> {
  try {
    const prefText = userPreferences
      ? `User preferences:\n- Interests: ${userPreferences.interests.join(', ')}\n- Country: ${userPreferences.country}\n- Language: ${userPreferences.language}`
      : '';

    const response = await openai.chat.completions.create({
      model: OPENAI_MODEL,
      messages: [
        {
          role: 'system',
          content:
            'You are an AI assistant that helps users explore news topics. Provide a concise explanation, suggest 4-6 related topics, and 6 suggested questions the user might ask to learn more. Format clearly.',
        },
        { role: 'user', content: `Topic: ${topic}\n\n${prefText}` },
      ],
      max_tokens: 800,
      temperature: 0.6,
    });

    const text = response.choices?.[0]?.message?.content ?? '';

    // Try to parse out sections heuristically
    const explanationMatch = text.match(/Explanation:([\s\S]*?)(?=Related Topics:|Suggested Questions:|$)/i);
    const relatedMatch = text.match(/Related Topics:([\s\S]*?)(?=Suggested Questions:|$)/i);
    const suggestedMatch = text.match(/Suggested Questions:([\s\S]*?)$/i);

    const explanation = explanationMatch ? explanationMatch[1].trim() : text.trim();
    const relatedTopics = relatedMatch
      ? relatedMatch[1].split(/,|\n/).map((s) => s.replace(/^-?\s*/, '').trim()).filter(Boolean)
      : [];
    const suggestedQuestions = suggestedMatch
      ? suggestedMatch[1].split(/\n/).map((s) => s.replace(/^-?\s*/, '').trim()).filter(Boolean)
      : [];

    return { explanation, relatedTopics, suggestedQuestions };
  } catch (error: unknown) {
    if (error instanceof Error) console.error('OpenAI exploreTopic error:', error.message);
    else console.error('OpenAI exploreTopic unknown error:', error);
    return {
      explanation: "I'm experiencing technical difficulties. Please try again later.",
      relatedTopics: [],
      suggestedQuestions: [],
    };
  }
}

/**
 * Generate a personalized briefing based on recent articles (title + summary).
 */
export async function generatePersonalizedBriefing(
  userPreferences: { interests: string[]; country: string; language: string },
  recentArticles: { title: string; summary: string; category: string; publishedAt: string }[]
): Promise<string> {
  try {
    const prefText = `Interests: ${userPreferences.interests.join(', ')}\nCountry: ${userPreferences.country}\nLanguage: ${userPreferences.language}`;
    const articlesText = recentArticles
      .slice(0, 12)
      .map((a) => `- ${a.title} (${a.category}, ${a.publishedAt}): ${a.summary}`)
      .join('\n');

    const system = 'You are NewsGenie. Create a concise personalized briefing organized by topic. Highlight the most important items. Keep it under ~500 words.';
    const response = await openai.chat.completions.create({
      model: OPENAI_MODEL,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: `User preferences:\n${prefText}\n\nRecent articles:\n${articlesText}` },
      ],
      max_tokens: 700,
      temperature: 0.35,
    });

    return response.choices?.[0]?.message?.content ?? "I couldn't generate a briefing at this time.";
  } catch (error: unknown) {
    if (error instanceof Error) console.error('OpenAI briefing error:', error.message);
    else console.error('OpenAI briefing unknown error:', error);
    return "I'm experiencing technical difficulties. Please try again later.";
  }
}

/* -------------------------
   Other utilities
   ------------------------- */

/**
 * A more detailed sentiment analysis that returns JSON-like structure.
 */
export async function detailedSentimentAnalysis(text: string): Promise<{
  sentiment: 'positive' | 'negative' | 'neutral';
  confidence: number;
  explanation: string;
}> {
  try {
    const system = 'Analyze the sentiment and respond ONLY with a JSON object: { "sentiment": "positive|negative|neutral", "confidence": number (0-1), "explanation": "short explanation" }';
    const response = await openai.chat.completions.create({
      model: OPENAI_MODEL,
      messages: [{ role: 'system', content: system }, { role: 'user', content: text }],
      max_tokens: 160,
      temperature: 0.2,
    });

    const content = response.choices?.[0]?.message?.content ?? '';
    // Try strict JSON parse, otherwise try to extract JSON substring
    try {
      return JSON.parse(content);
    } catch {
      const m = content.match(/\{[\s\S]*\}/);
      if (m) {
        try {
          return JSON.parse(m[0]);
        } catch {
          // fall through to default
        }
      }
      return { sentiment: 'neutral', confidence: 0.5, explanation: 'Unable to parse model output.' };
    }
  } catch (error: unknown) {
    if (error instanceof Error) console.error('OpenAI detailed sentiment error:', error.message);
    else console.error('OpenAI detailed sentiment unknown error:', error);
    return { sentiment: 'neutral', confidence: 0.5, explanation: 'Error analyzing sentiment.' };
  }
}

/**
 * Generate 5-10 tags for an article as an array.
 */
export async function generateArticleTags(title: string, content: string): Promise<string[]> {
  try {
    const response = await openai.chat.completions.create({
      model: OPENAI_MODEL,
      messages: [
        { role: 'system', content: 'Generate 5-10 concise tags for the article. Return a comma-separated list.' },
        { role: 'user', content: `Title: ${title}\n\nContent: ${content}` },
      ],
      max_tokens: 80,
      temperature: 0.25,
    });

    const out = response.choices?.[0]?.message?.content ?? '';
    return out.split(',').map((s) => s.trim()).filter(Boolean).slice(0, 10);
  } catch (error: unknown) {
    if (error instanceof Error) console.error('OpenAI tag generation error:', error.message);
    else console.error('OpenAI tag generation unknown error:', error);
    return [];
  }
}