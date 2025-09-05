// E:\newsgenie\src\lib\openai.ts
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function summarizeArticle(content: string): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a professional news summarizer. Create concise, informative summaries of news articles in 2-3 sentences. Focus on the key facts and main points."
        },
        {
          role: "user",
          content: `Please summarize this news article:\n\n${content}`
        }
      ],
      max_tokens: 150,
      temperature: 0.3,
    });
    return response.choices[0]?.message?.content || "Summary not available.";
  } catch (error) {
    console.error('OpenAI summarization error:', error);
    return "Summary not available.";
  }
}

export async function analyzeSentiment(text: string): Promise<'positive' | 'negative' | 'neutral'> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "Analyze the sentiment of the given text. Respond with only one word: 'positive', 'negative', or 'neutral'."
        },
        {
          role: "user",
          content: text
        }
      ],
      max_tokens: 10,
      temperature: 0,
    });
    const sentiment = response.choices[0]?.message?.content?.toLowerCase().trim();
    return sentiment === 'positive' || sentiment === 'negative' ? sentiment : 'neutral';
  } catch (error) {
    console.error('OpenAI sentiment analysis error:', error);
    return 'neutral';
  }
}

export async function extractKeywords(text: string): Promise<string[]> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "Extract 3-5 key keywords or phrases from the given text. Return them as a comma-separated list."
        },
        {
          role: "user",
          content: text
        }
      ],
      max_tokens: 50,
      temperature: 0.3,
    });
    const keywords = response.choices[0]?.message?.content;
    return keywords ? keywords.split(',').map(k => k.trim()) : [];
  } catch (error) {
    console.error('OpenAI keyword extraction error:', error);
    return [];
  }
}

// New conversational AI functions
export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export async function generateChatResponse(
  messages: ChatMessage[],
  articleContext?: string[]
): Promise<string> {
  try {
    // Build system message based on context
    let systemMessage = "You are NewsGenie, an AI assistant that helps users understand news and current events. Be helpful, informative, and concise.";
    
    if (articleContext && articleContext.length > 0) {
      systemMessage += `\n\nYou have access to the following articles for context:\n${articleContext.join('\n\n')}`;
    }
    
    // Add system message to the beginning of messages array
    const apiMessages: ChatMessage[] = [
      { role: 'system', content: systemMessage },
      ...messages.filter(msg => msg.role !== 'system') // Filter out any existing system messages
    ];
    
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: apiMessages,
      max_tokens: 1000,
      temperature: 0.7,
    });
    
    return response.choices[0]?.message?.content || "I'm sorry, I couldn't generate a response.";
  } catch (error) {
    console.error('OpenAI chat error:', error);
    return "I'm experiencing technical difficulties. Please try again later.";
  }
}

export async function answerQuestionAboutArticle(
  question: string,
  articleContent: string
): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are an AI assistant that answers questions about news articles. Base your answers only on the information provided in the article. If the information is not in the article, say so. Be comprehensive and provide detailed answers when possible."
        },
        {
          role: "user",
          content: `Article content:\n${articleContent}\n\nQuestion: ${question}`
        }
      ],
      max_tokens: 800,
      temperature: 0.3,
    });
    
    return response.choices[0]?.message?.content || "I couldn't answer that question based on the article content.";
  } catch (error) {
    console.error('OpenAI article Q&A error:', error);
    return "I'm experiencing technical difficulties. Please try again later.";
  }
}

// Enhanced function to answer questions using web scraping
export async function answerQuestionAboutArticleWithWebScraping(
  question: string,
  articleContent: string,
  articleUrl?: string
): Promise<{
    answer: string;
    sources: string[];
  }> {
  try {
    let systemMessage = "You are an AI assistant that answers questions about news articles. Base your answers primarily on the information provided in the article. If the information is not in the article, say so. Be comprehensive and provide detailed answers when possible.";
    
    if (articleUrl) {
      systemMessage += ` The user has also provided the original article URL: ${articleUrl}. You can mention this as a source of information if relevant.`;
    }
    
    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo", // Using a more capable model for better web-aware responses
      messages: [
        {
          role: "system",
          content: systemMessage
        },
        {
          role: "user",
          content: `Article content:\n${articleContent}\n\nQuestion: ${question}`
        }
      ],
      max_tokens: 1000,
      temperature: 0.3,
    });
    
    const answer = response.choices[0]?.message?.content || "I couldn't answer that question based on the article content.";
    
    // Extract sources mentioned in the response
    const sources: string[] = [];
    if (articleUrl) {
      sources.push(articleUrl);
    }
    
    // Look for any URLs mentioned in the response
    const urlRegex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/g;
    const urlsInResponse = answer.match(urlRegex);
    if (urlsInResponse) {
      urlsInResponse.forEach(url => {
        if (!sources.includes(url)) {
          sources.push(url);
        }
      });
    }
    
    return {
      answer,
      sources
    };
  } catch (error) {
    console.error('OpenAI article Q&A with web scraping error:', error);
    return {
      answer: "I'm experiencing technical difficulties. Please try again later.",
      sources: []
    };
  }
}

// Function to extract article content from URL (placeholder implementation)
export async function extractArticleContentFromUrl(url: string): Promise<{
  title: string;
  content: string;
  author?: string;
  publishDate?: string;
}> {
  try {
    // In a real implementation, you would use a web scraping service or library
    // For this example, we'll return a placeholder response
    
    console.log(`Would extract content from URL: ${url}`);
    
    // This is where you would implement actual web scraping
    // You could use services like:
    // - Apify
    // - ScrapingBee
    // - Cheerio with a proxy service
    // - Custom Puppeteer/Playwright implementation
    
    // For now, return placeholder data
    return {
      title: "Article title would be extracted here",
      content: "Full article content would be extracted from the web page here. This would include the main text of the article, potentially more comprehensive than what's stored in the database.",
      author: "Author would be extracted here",
      publishDate: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error extracting article content from URL:', error);
    return {
      title: "",
      content: "",
    };
  }
}

export async function exploreTopic(
  topic: string,
  userPreferences?: {
    interests: string[];
    country: string;
    language: string;
  }
): Promise<{
  explanation: string;
  relatedTopics: string[];
  suggestedQuestions: string[];
}> {
  try {
    const preferencesText = userPreferences 
      ? `\n\nUser preferences:\n- Interests: ${userPreferences.interests.join(', ')}\n- Country: ${userPreferences.country}\n- Language: ${userPreferences.language}`
      : '';
    
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are an AI assistant that helps users explore news topics. Provide a concise explanation of the topic, suggest related topics, and propose questions the user might want to ask.${preferencesText}`
        },
        {
          role: "user",
          content: `I want to learn about: ${topic}`
        }
      ],
      max_tokens: 800,
      temperature: 0.7,
    });
    
    const content = response.choices[0]?.message?.content || "";
    
    // Fixed regex patterns by replacing the 's' flag with [\s\S] pattern
    const explanationMatch = content.match(/Explanation:([\s\S]*?)(?=Related Topics:|$)/);
    const relatedTopicsMatch = content.match(/Related Topics:([\s\S]*?)(?=Suggested Questions:|$)/);
    const suggestedQuestionsMatch = content.match(/Suggested Questions:([\s\S]*?)$/);
    
    const explanation = explanationMatch ? explanationMatch[1].trim() : content;
    const relatedTopics = relatedTopicsMatch 
      ? relatedTopicsMatch[1].split(',').map(t => t.trim()).filter(t => t)
      : [];
    const suggestedQuestions = suggestedQuestionsMatch 
      ? suggestedQuestionsMatch[1].split('\n').map(q => q.replace(/^-\s*/, '').trim()).filter(q => q)
      : [];
    
    return {
      explanation,
      relatedTopics,
      suggestedQuestions
    };
  } catch (error) {
    console.error('OpenAI topic exploration error:', error);
    return {
      explanation: "I'm experiencing technical difficulties. Please try again later.",
      relatedTopics: [],
      suggestedQuestions: []
    };
  }
}

export async function generatePersonalizedBriefing(
  userPreferences: {
    interests: string[];
    country: string;
    language: string;
  },
  recentArticles: {
    title: string;
    summary: string;
    category: string;
    publishedAt: string;
  }[]
): Promise<string> {
  try {
    // Format articles for the AI
    const articlesText = recentArticles.map(article => 
      `- ${article.title} (${article.category}): ${article.summary}`
    ).join('\n');
    
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are NewsGenie, an AI assistant that creates personalized news briefings. Create a concise, informative briefing for the user based on their interests and the recent articles provided. The briefing should be organized by topic and highlight the most important information. Keep it under 500 words.`
        },
        {
          role: "user",
          content: `User preferences:\n- Interests: ${userPreferences.interests.join(', ')}\n- Country: ${userPreferences.country}\n- Language: ${userPreferences.language}\n\nRecent articles:\n${articlesText}`
        }
      ],
      max_tokens: 600,
      temperature: 0.5,
    });
    
    return response.choices[0]?.message?.content || "I couldn't generate a briefing at this time.";
  } catch (error) {
    console.error('OpenAI briefing generation error:', error);
    return "I'm experiencing technical difficulties. Please try again later.";
  }
}

// Function to analyze article sentiment with more detail
export async function detailedSentimentAnalysis(text: string): Promise<{
  sentiment: 'positive' | 'negative' | 'neutral';
  confidence: number;
  explanation: string;
}> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "Analyze the sentiment of the given text. Respond with a JSON object containing: 1) sentiment (positive, negative, or neutral), 2) confidence (a number between 0 and 1), and 3) a brief explanation of your analysis."
        },
        {
          role: "user",
          content: text
        }
      ],
      max_tokens: 150,
      temperature: 0.3,
      response_format: { type: "json_object" }
    });
    
    const content = response.choices[0]?.message?.content || '{"sentiment": "neutral", "confidence": 0.5, "explanation": "Unable to analyze sentiment."}';
    
    try {
      const parsed = JSON.parse(content);
      return {
        sentiment: parsed.sentiment || 'neutral',
        confidence: parsed.confidence || 0.5,
        explanation: parsed.explanation || "No explanation provided."
      };
    } catch (parseError) {
      console.error('Error parsing sentiment analysis response:', parseError);
      return {
        sentiment: 'neutral',
        confidence: 0.5,
        explanation: "Error analyzing sentiment."
      };
    }
  } catch (error) {
    console.error('OpenAI detailed sentiment analysis error:', error);
    return {
      sentiment: 'neutral',
      confidence: 0.5,
      explanation: "Error analyzing sentiment."
    };
  }
}

// Function to generate article tags/categories
export async function generateArticleTags(title: string, content: string): Promise<string[]> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "Generate 5-10 relevant tags or categories for the given article. Return them as a comma-separated list."
        },
        {
          role: "user",
          content: `Title: ${title}\n\nContent: ${content}`
        }
      ],
      max_tokens: 50,
      temperature: 0.3,
    });
    
    const tags = response.choices[0]?.message?.content || "";
    return tags ? tags.split(',').map(tag => tag.trim()) : [];
  } catch (error) {
    console.error('OpenAI tag generation error:', error);
    return [];
  }
}