import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface AIAnalysis {
  summary: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  keywords: string[];
  topics: string[];
  importance: number;
}

export async function analyzeArticle(
  title: string,
  description: string,
  content?: string
): Promise<AIAnalysis> {
  try {
    const text = `Title: ${title}\nDescription: ${description}${content ? `\nContent: ${content.substring(0, 1000)}` : ''}`;
    
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are an AI news analyst. Analyze the given news article and return a JSON response with:
          - summary: A concise 2-sentence summary
          - sentiment: "positive", "negative", or "neutral"
          - keywords: Array of 5-10 important keywords
          - topics: Array of 2-5 main topics/themes
          - importance: A score from 0.0 to 1.0 indicating how important/newsworthy this article is
          
          Return only valid JSON, no additional text.`
        },
        {
          role: "user",
          content: text
        }
      ],
      temperature: 0.3,
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new Error('No response from OpenAI');
    }

    return JSON.parse(response);
  } catch (error) {
    console.error('AI Analysis Error:', error);
    // Return fallback analysis
    return {
      summary: description || title,
      sentiment: 'neutral',
      keywords: [title.split(' ')[0] || 'news'],
      topics: ['general'],
      importance: 0.5,
    };
  }
}

export async function analyzeTrendingTopics(articles: any[]): Promise<any[]> {
  try {
    const articlesText = articles.map(article => 
      `${article.title} - ${article.description || ''}`
    ).join('\n\n').substring(0, 3000);

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `Analyze these news articles and identify trending topics. Return a JSON array of trending topics with:
          - topic: The trending topic name
          - score: Relevance score (0.0 to 1.0)
          - category: News category ("business", "technology", "sports", etc.)
          - sentiment: Overall sentiment for this topic
          - mentions: Estimated number of articles mentioning this topic
          
          Return only the JSON array, no additional text.`
        },
        {
          role: "user",
          content: articlesText
        }
      ],
      temperature: 0.4,
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new Error('No response from OpenAI');
    }

    return JSON.parse(response);
  } catch (error) {
    console.error('Trending Analysis Error:', error);
    return [];
  }
}

export async function generateRecommendations(
  userPreferences: any,
  readArticles: any[],
  availableArticles: any[]
): Promise<any[]> {
  try {
    const userContext = `
    User preferences: Categories: ${userPreferences.categories?.join(', ')}, 
    Sources: ${userPreferences.sources?.join(', ')},
    Keywords: ${userPreferences.keywords?.join(', ')}
    
    Recently read: ${readArticles.slice(0, 5).map(a => a.article.title).join(', ')}
    `;

    const articlesText = availableArticles.slice(0, 20).map(article => 
      `ID: ${article.id} - ${article.title} - Categories: ${article.category} - Topics: ${article.topics?.join(', ')}`
    ).join('\n');

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `Based on user preferences and reading history, recommend articles from the available list. 
          Return a JSON array of article IDs in order of recommendation priority. 
          Consider user interests, diversity of content, and article importance.
          Return only the JSON array of article IDs, no additional text.`
        },
        {
          role: "user",
          content: `${userContext}\n\nAvailable articles:\n${articlesText}`
        }
      ],
      temperature: 0.5,
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new Error('No response from OpenAI');
    }

    return JSON.parse(response);
  } catch (error) {
    console.error('Recommendation Error:', error);
    return availableArticles.slice(0, 10).map(a => a.id);
  }
}