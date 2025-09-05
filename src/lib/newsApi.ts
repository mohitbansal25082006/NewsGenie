const NEWS_API_BASE_URL = 'https://newsapi.org/v2';

export interface NewsArticle {
  title: string;
  description: string;
  content: string;
  url: string;
  urlToImage: string;
  publishedAt: string;
  source: {
    id: string;
    name: string;
  };
  author: string;
}

export interface NewsResponse {
  status: string;
  totalResults: number;
  articles: NewsArticle[];
}

export class NewsAPI {
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.NEWS_API_KEY || '';
  }

  async getTopHeadlines(params: {
    country?: string;
    category?: string;
    sources?: string;
    q?: string;
    pageSize?: number;
    page?: number;
  } = {}): Promise<NewsResponse> {
    const searchParams = new URLSearchParams();
    
    // Add parameters
    Object.entries(params).forEach(([key, value]) => {
      if (value) {
        searchParams.append(key, value.toString());
      }
    });

    searchParams.append('apiKey', this.apiKey);
    
    const response = await fetch(
      `${NEWS_API_BASE_URL}/top-headlines?${searchParams.toString()}`
    );

    if (!response.ok) {
      throw new Error(`News API error: ${response.status}`);
    }

    return response.json();
  }

  async getEverything(params: {
    q?: string;
    sources?: string;
    domains?: string;
    from?: string;
    to?: string;
    language?: string;
    sortBy?: 'relevancy' | 'popularity' | 'publishedAt';
    pageSize?: number;
    page?: number;
  } = {}): Promise<NewsResponse> {
    const searchParams = new URLSearchParams();
    
    // Add parameters
    Object.entries(params).forEach(([key, value]) => {
      if (value) {
        searchParams.append(key, value.toString());
      }
    });

    searchParams.append('apiKey', this.apiKey);
    
    const response = await fetch(
      `${NEWS_API_BASE_URL}/everything?${searchParams.toString()}`
    );

    if (!response.ok) {
      throw new Error(`News API error: ${response.status}`);
    }

    return response.json();
  }

  async getSources(params: {
    category?: string;
    language?: string;
    country?: string;
  } = {}) {
    const searchParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value) {
        searchParams.append(key, value);
      }
    });

    searchParams.append('apiKey', this.apiKey);
    
    const response = await fetch(
      `${NEWS_API_BASE_URL}/sources?${searchParams.toString()}`
    );

    if (!response.ok) {
      throw new Error(`News API error: ${response.status}`);
    }

    return response.json();
  }
}