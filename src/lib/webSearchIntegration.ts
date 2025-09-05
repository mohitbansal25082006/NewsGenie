// E:\newsgenie\src\lib\webSearchIntegration.ts
import { searchWeb, formatWebSearchResults, searchRecentNews } from './webSearch';

/**
 * Perform web search for chat integration
 */
export async function performWebSearchForChat(
  query: string,
  options: {
    type?: 'news' | 'comprehensive';
    location?: string;
    language?: string;
    numResults?: number;
  } = {}
): Promise<{
  results: string[];
  sources: string[];
}> {
  try {
    const results = await searchWeb(query, options);
    const formattedResults = formatWebSearchResults(results);
    
    // Extract unique sources
    const sources = [...new Set(results.map(r => r.link))];
    
    return {
      results: formattedResults,
      sources
    };
  } catch (error) {
    console.error('Error performing web search for chat:', error);
    return {
      results: [],
      sources: []
    };
  }
}

/**
 * Get recent news for chat integration
 */
export async function getRecentNewsForChat(
  topic: string,
  options: {
    hours?: number;
    location?: string;
    language?: string;
    numResults?: number;
  } = {}
): Promise<{
  results: string[];
  sources: string[];
}> {
  try {
    const results = await searchRecentNews(topic, options);
    const formattedResults = formatWebSearchResults(results);
    
    // Extract unique sources
    const sources = [...new Set(results.map(r => r.link))];
    
    return {
      results: formattedResults,
      sources
    };
  } catch (error) {
    console.error('Error getting recent news for chat:', error);
    return {
      results: [],
      sources: []
    };
  }
}