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
 * Enhanced to provide better formatted responses with citations.
 */
export async function generateChatResponse(
  messages: ChatMessage[],
  articleContext?: string[],
  options?: {
    temperature?: number;
    maxTokens?: number;
    includeSources?: boolean;
  }
): Promise<string> {
  try {
    const temperature = options?.temperature ?? 0.25;
    const maxTokens = options?.maxTokens ?? 1500;
    const includeSources = options?.includeSources ?? true;
    
    let systemMessage =
      'You are NewsGenie, an expert news assistant. Provide clear, accurate, and well-sourced answers. Avoid hallucination. When provided with news context, prefer facts from that context and cite sources inline (Source, date). If something is not supported by provided context, clearly state that.';
    if (articleContext && articleContext.length > 0) {
      // Keep context compact to fit tokens
      const ctx = articleContext.slice(0, 6).join('\n');
      systemMessage += `\n\nContext (use when relevant):\n${ctx}`;
    }
    systemMessage += '\n\nFormat your response with clear headings, bullet points, and structured text for readability. Use markdown formatting when appropriate.';
    const payloadMessages: ChatMessage[] = [
      { role: 'system', content: systemMessage },
      ...messages.filter((m) => m.role !== 'system'),
    ];
    const response = await openai.chat.completions.create({
      model: OPENAI_MODEL,
      messages: payloadMessages,
      max_tokens: maxTokens,
      temperature: temperature,
    });
    return response.choices?.[0]?.message?.content ?? "I'm sorry, I couldn't generate a response.";
  } catch (error: unknown) {
    if (error instanceof Error) console.error('OpenAI chat error:', error.message);
    else console.error('OpenAI chat unknown error:', error);
    return "I'm experiencing technical difficulties. Please try again later.";
  }
}

/**
 * Generate a chat response with web search capabilities
 * Enhanced to provide comprehensive answers using the latest information
 */
export async function generateEnhancedChatResponse(
  messages: ChatMessage[],
  webSearchResults?: string[],
  newsContext?: string[],
  options?: {
    temperature?: number;
    maxTokens?: number;
    includeSources?: boolean;
    searchMode?: 'news' | 'comprehensive';
  }
): Promise<{ response: string; sources: string[] }> {
  try {
    const temperature = options?.temperature ?? 0.25;
    const maxTokens = options?.maxTokens ?? 2000;
    const includeSources = options?.includeSources ?? true;
    const searchMode = options?.searchMode ?? 'news';
    
    let systemMessage = `You are NewsGenie, an advanced AI news assistant with access to the latest information from across the internet. 
    Provide comprehensive, well-structured answers with proper citations. 
    When responding:
    1. Use clear headings and subheadings to organize your response
    2. Use bullet points for lists and key information
    3. Include relevant quotes or statistics when available
    4. Always cite your sources inline with the source name and date
    5. If information is conflicting or uncertain, acknowledge it
    6. For time-sensitive topics, prioritize the most recent information
    7. Use markdown formatting for better readability`;

    // Add context based on available information
    let contextSections = [];
    
    if (webSearchResults && webSearchResults.length > 0) {
      contextSections.push(`WEB SEARCH RESULTS:\n${webSearchResults.join('\n')}`);
    }
    
    if (newsContext && newsContext.length > 0) {
      contextSections.push(`NEWS CONTEXT:\n${newsContext.join('\n')}`);
    }
    
    if (contextSections.length > 0) {
      systemMessage += `\n\n${contextSections.join('\n\n')}`;
    }

    systemMessage += `\n\nBased on the ${searchMode === 'comprehensive' ? 'web search results and news context' : 'news context'} above, provide a comprehensive answer to the user's question. If the context doesn't contain sufficient information, you may use your general knowledge but clearly indicate when you're doing so.`;

    const payloadMessages: ChatMessage[] = [
      { role: 'system', content: systemMessage },
      ...messages.filter((m) => m.role !== 'system'),
    ];

    const response = await openai.chat.completions.create({
      model: OPENAI_MODEL,
      messages: payloadMessages,
      max_tokens: maxTokens,
      temperature: temperature,
    });

    const content = response.choices?.[0]?.message?.content ?? "I'm sorry, I couldn't generate a response.";
    
    // Extract sources from the response
    const sources = includeSources ? extractSources(content) : [];
    
    return { response: content, sources };
  } catch (error: unknown) {
    if (error instanceof Error) console.error('OpenAI enhanced chat error:', error.message);
    else console.error('OpenAI enhanced chat unknown error:', error);
    return { 
      response: "I'm experiencing technical difficulties. Please try again later.", 
      sources: [] 
    };
  }
}

/**
 * Compatibility wrapper intended to be used by your chat layer (e.g., generateAndSaveResponse in /lib/chat).
 * Enhanced to support regeneration and source extraction.
 */
export async function generateAndSaveResponse(
  conversationId: string,
  userMessage: string,
  userId: string,
  options?: {
    articleContext?: string[];
    webSearchContext?: string[];
    regenerate?: boolean;
    sources?: string[];
  }
): Promise<{ reply: string; saved?: boolean; sources?: string[] }> {
  try {
    const { articleContext, webSearchContext, regenerate, sources } = options || {};
    
    // If web search context is available, use enhanced response
    if (webSearchContext && webSearchContext.length > 0) {
      const { response, sources: extractedSources } = await generateEnhancedChatResponse(
        [{ role: 'user', content: userMessage }],
        webSearchContext,
        articleContext,
        {
          includeSources: true,
          maxTokens: regenerate ? 2500 : 2000,
          temperature: regenerate ? 0.3 : 0.25
        }
      );
      
      return { 
        reply: response, 
        saved: false, 
        sources: extractedSources 
      };
    }
    
    // Otherwise, use standard response
    const reply = await generateChatResponse(
      [{ role: 'user', content: userMessage }], 
      articleContext,
      {
        includeSources: true,
        maxTokens: regenerate ? 1800 : 1500,
        temperature: regenerate ? 0.3 : 0.25
      }
    );
    
    // Extract sources from the reply
    const extractedSources = extractSources(reply);
    
    return { 
      reply, 
      saved: false, 
      sources: extractedSources 
    };
  } catch (error: unknown) {
    if (error instanceof Error) console.error('generateAndSaveResponse error:', error.message);
    else console.error('generateAndSaveResponse unknown error:', error);
    return { 
      reply: "I'm experiencing technical difficulties. Please try again later.", 
      saved: false,
      sources: []
    };
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
 * Enhanced to provide more comprehensive results
 */
export async function exploreTopic(
  topic: string,
  userPreferences?: { interests: string[]; country: string; language: string },
  webSearchResults?: string[]
): Promise<{ explanation: string; relatedTopics: string[]; suggestedQuestions: string[] }> {
  try {
    const prefText = userPreferences
      ? `User preferences:\n- Interests: ${userPreferences.interests.join(', ')}\n- Country: ${userPreferences.country}\n- Language: ${userPreferences.language}`
      : '';
      
    const searchContext = webSearchResults && webSearchResults.length > 0
      ? `\n\nWeb Search Results:\n${webSearchResults.join('\n')}`
      : '';
      
    const response = await openai.chat.completions.create({
      model: OPENAI_MODEL,
      messages: [
        {
          role: 'system',
          content:
            'You are an AI assistant that helps users explore news topics. Provide a comprehensive explanation, suggest 4-6 related topics, and 6 suggested questions the user might ask to learn more. Use the web search results if available to provide the most current information. Format your response clearly with appropriate headings.',
        },
        { role: 'user', content: `Topic: ${topic}\n\n${prefText}${searchContext}` },
      ],
      max_tokens: 1200,
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
 * Enhanced to provide more comprehensive and personalized briefings
 */
export async function generatePersonalizedBriefing(
  userPreferences: { interests: string[]; country: string; language: string },
  recentArticles: { title: string; summary: string; category: string; publishedAt: string }[],
  webSearchResults?: string[]
): Promise<string> {
  try {
    const prefText = `Interests: ${userPreferences.interests.join(', ')}\nCountry: ${userPreferences.country}\nLanguage: ${userPreferences.language}`;
    
    const articlesText = recentArticles
      .slice(0, 12)
      .map((a) => `- ${a.title} (${a.category}, ${a.publishedAt}): ${a.summary}`)
      .join('\n');
      
    const searchContext = webSearchResults && webSearchResults.length > 0
      ? `\n\nAdditional Web Search Results:\n${webSearchResults.join('\n')}`
      : '';
      
    const system = 'You are NewsGenie. Create a comprehensive personalized briefing organized by topic. Highlight the most important items and provide context. Use markdown formatting for readability. Include a brief summary at the beginning and organize content by themes. Keep it under ~800 words.';
    
    const response = await openai.chat.completions.create({
      model: OPENAI_MODEL,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: `User preferences:\n${prefText}\n\nRecent articles:\n${articlesText}${searchContext}` },
      ],
      max_tokens: 1000,
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

/**
 * Extract sources from text content
 */
function extractSources(text: string): string[] {
  const sources: string[] = [];
  
  // Extract URLs
  const urlRegex = /https?:\/\/[^\s)]+/g;
  const urls = text.match(urlRegex) || [];
  urls.forEach(url => {
    if (!sources.includes(url)) sources.push(url);
  });
  
  // Extract source names in parentheses
  const sourceRegex = /\(([A-Za-z0-9\s&.-]+,\s*\d{1,2}\/\d{1,2}\/\d{2,4})\)/g;
  const sourceMatches = text.match(sourceRegex) || [];
  sourceMatches.forEach(match => {
    const cleanMatch = match.replace(/[()]/g, '');
    if (!sources.includes(cleanMatch)) sources.push(cleanMatch);
  });
  
  return sources.slice(0, 10); // Limit to 10 sources
}

/**
 * Generate a comprehensive news analysis
 */
export async function generateNewsAnalysis(
  topic: string,
  newsArticles: { title: string; content: string; source: string; publishedAt: string }[],
  webSearchResults?: string[]
): Promise<{
  summary: string;
  keyPoints: string[];
  timeline: { date: string; event: string }[];
  sources: string[];
}> {
  try {
    const articlesText = newsArticles
      .map((a, i) => `Article ${i+1}:\nTitle: ${a.title}\nSource: ${a.source}\nDate: ${a.publishedAt}\nContent: ${a.content.substring(0, 500)}...`)
      .join('\n\n');
      
    const searchContext = webSearchResults && webSearchResults.length > 0
      ? `\n\nWeb Search Results:\n${webSearchResults.join('\n')}`
      : '';
      
    const system = `You are an expert news analyst. Analyze the provided news articles and web search results about "${topic}".
    Provide:
    1. A comprehensive summary of the situation
    2. Key points and developments
    3. A timeline of events in chronological order
    Format your response as a JSON object with the following structure:
    {
      "summary": "Comprehensive summary",
      "keyPoints": ["Point 1", "Point 2", ...],
      "timeline": [{"date": "YYYY-MM-DD", "event": "Event description"}, ...],
      "sources": ["Source 1", "Source 2", ...]
    }`;
    
    const response = await openai.chat.completions.create({
      model: OPENAI_MODEL,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: `Topic: ${topic}\n\n${articlesText}${searchContext}` },
      ],
      max_tokens: 1500,
      temperature: 0.3,
    });
    
    const content = response.choices?.[0]?.message?.content ?? '';
    
    // Try to parse JSON response
    try {
      return JSON.parse(content);
    } catch (e) {
      // Fallback if JSON parsing fails
      return {
        summary: content,
        keyPoints: [],
        timeline: [],
        sources: extractSources(content)
      };
    }
  } catch (error: unknown) {
    if (error instanceof Error) console.error('OpenAI news analysis error:', error.message);
    else console.error('OpenAI news analysis unknown error:', error);
    return {
      summary: "I'm experiencing technical difficulties. Please try again later.",
      keyPoints: [],
      timeline: [],
      sources: []
    };
  }
}