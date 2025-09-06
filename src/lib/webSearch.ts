// E:\newsgenie\src\lib\webSearch.ts
import { load } from 'cheerio';

export interface WebSearchResult {
  title: string;
  link: string;
  snippet: string;
  displayedLink?: string;
  date?: string;
  source?: string;
}

export interface SearchParams {
  [key: string]: string | number | boolean | undefined;
}

export interface SerpApiResponse {
  organic_results?: Array<Record<string, unknown>>;
  news_results?: Array<Record<string, unknown>>;
  [key: string]: unknown;
}

// Properly typed SerpAPI class reference
type SerpApiConstructor = new (apiKey: string) => {
  json: (
    params: SearchParams,
    cb?: (data: SerpApiResponse) => void
  ) => Promise<SerpApiResponse> | void;
};

// Cache SerpAPI constructor
let SerpApiClass: SerpApiConstructor | null = null;

/**
 * Safely call SerpAPI's json method (supports both callback-style and promise-style implementations)
 */
function callSerpApiJson(
  instance: { json: (params: SearchParams, cb?: (data: SerpApiResponse) => void) => Promise<SerpApiResponse> | void },
  params: SearchParams
): Promise<SerpApiResponse> {
  return new Promise((resolve, reject) => {
    try {
      let called = false;
      const maybe = instance.json(params, (data: SerpApiResponse) => {
        called = true;
        resolve(data);
      });

      if (!called && maybe && typeof (maybe as Promise<SerpApiResponse>).then === 'function') {
        (maybe as Promise<SerpApiResponse>).then(resolve).catch(reject);
      } else if (!called && maybe === undefined) {
        resolve({}); // FIX: don’t cast void → SerpApiResponse
      }
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Initialize SerpApi class dynamically. Handles different export shapes.
 */
async function initializeSerpApi(): Promise<SerpApiConstructor> {
  if (SerpApiClass) return SerpApiClass;

  if (!process.env.SERPAPI_KEY) {
    throw new Error('SerpAPI key is missing. Please add SERPAPI_KEY to your environment variables.');
  }

  try {
    const serpApiModule: Record<string, unknown> = await import('google-search-results-nodejs');

    if (typeof serpApiModule.default === 'function') {
      SerpApiClass = serpApiModule.default as SerpApiConstructor;
    } else if (typeof serpApiModule['GoogleSearch'] === 'function') {
      SerpApiClass = serpApiModule['GoogleSearch'] as SerpApiConstructor;
    } else if (typeof serpApiModule['SerpApi'] === 'function') {
      SerpApiClass = serpApiModule['SerpApi'] as SerpApiConstructor;
    } else {
      for (const key in serpApiModule) {
        if (key === '__esModule') continue;
        if (typeof serpApiModule[key] === 'function') {
          SerpApiClass = serpApiModule[key] as SerpApiConstructor;
          break;
        }
      }
    }

    if (!SerpApiClass) {
      throw new Error('Unable to locate a SerpAPI constructor in the google-search-results-nodejs module.');
    }

    return SerpApiClass;
  } catch (error) {
    console.error('Failed to import google-search-results-nodejs:', error);
    throw error;
  }
}

/**
 * Normalize location shorthand codes to readable location names SerpAPI understands
 */
function normalizeLocation(location: string | undefined): string | undefined {
  if (!location) return undefined;

  const locationMap: Record<string, string> = {
    us: 'United States',
    gb: 'United Kingdom',
    uk: 'United Kingdom',
    ca: 'Canada',
    au: 'Australia',
    de: 'Germany',
    fr: 'France',
    jp: 'Japan',
    in: 'India',
    br: 'Brazil',
    cn: 'China',
    ru: 'Russia',
    es: 'Spain',
    it: 'Italy',
    mx: 'Mexico',
    kr: 'South Korea',
    nl: 'Netherlands',
    se: 'Sweden',
    no: 'Norway',
    pl: 'Poland',
    tr: 'Turkey',
    sa: 'Saudi Arabia',
    za: 'South Africa',
    ar: 'Argentina',
    eg: 'Egypt',
    ng: 'Nigeria',
    ke: 'Kenya',
    my: 'Malaysia',
    ph: 'Philippines',
    sg: 'Singapore',
    th: 'Thailand',
    vn: 'Vietnam',
    id: 'Indonesia',
    pk: 'Pakistan',
    bd: 'Bangladesh',
    lk: 'Sri Lanka',
    np: 'Nepal',
    mm: 'Myanmar',
    kh: 'Cambodia',
    la: 'Laos'
  };

  const key = location.toLowerCase();
  return locationMap[key] || location;
}

/**
 * Main public function: perform web search (comprehensive or news)
 */
export async function searchWeb(
  query: string,
  options: {
    type?: 'news' | 'comprehensive';
    location?: string;
    language?: string;
    numResults?: number;
    timeRange?: 'today' | 'week' | 'month' | 'year';
  } = {}
): Promise<WebSearchResult[]> {
  const {
    type = 'comprehensive',
    location = 'us',
    language = 'en',
    numResults = 10,
    timeRange
  } = options;

  try {
    let SerpApiConstructor: SerpApiConstructor;
    try {
      SerpApiConstructor = await initializeSerpApi();
    } catch (error) {
      console.warn('SerpAPI not available, returning mock results.', error);
      return getMockSearchResults(query, type, numResults);
    }

    const searchParams: SearchParams = {
      q: query,
      num: numResults
    };

    const normalizedLocation = normalizeLocation(location);
    if (normalizedLocation) {
      searchParams.location = normalizedLocation;
    }

    if (language && language.length === 2) {
      searchParams.hl = language;
    }

    if (timeRange) {
      const qdr = timeRange === 'today' ? 'd' : timeRange === 'week' ? 'w' : timeRange === 'month' ? 'm' : 'y';
      searchParams.tbs = `qdr:${qdr}`;
    }

    const serpApiInstance = new SerpApiConstructor(process.env.SERPAPI_KEY as string);

    let results: WebSearchResult[] = [];

    if (type === 'news') {
      results = await searchGoogleNews(serpApiInstance, query, searchParams);
    } else {
      const webPromise = searchGoogleWeb(serpApiInstance, query, searchParams);
      const newsParams = { ...searchParams, num: Math.floor(numResults / 2) || 1 };
      const newsPromise = searchGoogleNews(serpApiInstance, query, newsParams);

      const [webResults, newsResults] = await Promise.all([webPromise, newsPromise]);

      const combined = [...webResults, ...newsResults];
      const deduped: WebSearchResult[] = combined.filter((r, i, arr) => {
        return arr.findIndex(x => x.link === r.link) === i;
      }).slice(0, numResults);

      results = deduped;
    }

    const enhanced = await Promise.all(results.map(async (r) => {
      try {
        if ((!r.snippet || r.snippet.length < 100) && r.link) {
          const content = await extractPageContent(r.link);
          if (content) r.snippet = content;
        }
      } catch {
        // ignore enhancement errors
      }
      return r;
    }));

    return enhanced;
  } catch (error) {
    console.error('searchWeb error:', error);
    return getMockSearchResults(query, options.type || 'comprehensive', options.numResults || 10);
  }
}

/**
 * Fallback mock search results
 */
function getMockSearchResults(query: string, type: 'news' | 'comprehensive', numResults: number): WebSearchResult[] {
  console.warn('Using mock search results for:', query);
  const results: WebSearchResult[] = [];
  const q = query.toLowerCase();

  const make = (
    title: string,
    link: string,
    snippet: string,
    source: string,
    date: string
  ): WebSearchResult => ({
    title,
    link,
    snippet,
    source: source || undefined, // FIX: use undefined not null
    date
  });

  if (q.includes('stock market') || q.includes('stocks')) {
    results.push(
      make(
        "Global Stock Markets Rally as Inflation Data Shows Signs of Cooling",
        "https://www.reuters.com/markets/global-markets-rally-inflation-cooling-2023",
        "Major stock indices around the world climbed today as new inflation data suggests that price increases may be slowing, giving investors hope that central banks might ease interest rate hikes.",
        "Reuters",
        new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
      ),
      make(
        "Tech Stocks Lead Gains as AI Companies Report Strong Earnings",
        "https://www.bloomberg.com/tech-stocks-ai-earnings-2023",
        "Technology stocks surged today, with companies in the artificial intelligence sector leading the way after several reported better-than-expected quarterly earnings results.",
        "Bloomberg",
        new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
      )
    );
  } else if (q.includes('science') || q.includes('scientific')) {
    results.push(
      make(
        "Breakthrough in Quantum Computing Announced by Research Team",
        "https://www.nature.com/articles/quantum-computing-breakthrough-2023",
        "Scientists have achieved a major breakthrough in quantum computing, developing a new type of qubit that maintains coherence for significantly longer periods.",
        "Nature",
        new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
      )
    );
  } else if (q.includes('politics') || q.includes('election')) {
    results.push(
      make(
        "Congress Reaches Last-Minute Deal to Avoid Government Shutdown",
        "https://www.nytimes.com/2023/10/15/us/politics/government-shutdown-deal.html",
        "Lawmakers in Congress reached a bipartisan agreement on a temporary funding bill just hours before a potential government shutdown.",
        "The New York Times",
        new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString()
      )
    );
  } else {
    results.push(
      make(
        `${query} - Latest Updates and Analysis`,
        `https://www.bbc.com/news/${query.toLowerCase().replace(/\s+/g, '-')}`,
        `Comprehensive coverage of the latest developments related to ${query}.`,
        "BBC News",
        new Date().toISOString()
      ),
      make(
        `Breaking News: ${query}`,
        `https://www.cnn.com/${query.toLowerCase().replace(/\s+/g, '-')}`,
        `The latest breaking news on ${query}.`,
        "CNN",
        new Date(Date.now() - 60 * 60 * 1000).toISOString()
      )
    );
  }

  while (results.length < numResults) {
    results.push(
      make(
        `${query} - Additional Information`,
        `https://example.com/news/${query.toLowerCase().replace(/\s+/g, '-')}-${results.length + 1}`,
        `More information about ${query} from a comprehensive news coverage.`,
        "News Source",
        new Date(Date.now() - results.length * 60 * 60 * 1000).toISOString()
      )
    );
  }

  return results.slice(0, numResults);
}

/**
 * Search Google Web (organic)
 */
async function searchGoogleWeb(
  serpApi: { json: (params: SearchParams, cb?: (data: SerpApiResponse) => void) => Promise<SerpApiResponse> | void },
  query: string,
  params: SearchParams
): Promise<WebSearchResult[]> {
  try {
    const response = await callSerpApiJson(serpApi, {
      engine: 'google',
      ...params
    });

    const organic = (response?.organic_results ?? []) as Array<Record<string, unknown>>;
    return organic.map((r) => ({
      title: (r.title as string) || '',
      link: (r.link as string) || '',
      snippet: (r.snippet as string) || '',
      displayedLink: (r.displayed_link as string) || undefined,
      date: (r.date as string) || undefined,
      source: extractSourceFromLink(r.link as string) ?? extractSourceFromDisplayedLink(r.displayed_link as string) ?? undefined
    }));
  } catch (error) {
    console.error('Error searching Google Web:', error);
    return [];
  }
}

/**
 * Search Google News
 */
async function searchGoogleNews(
  serpApi: { json: (params: SearchParams, cb?: (data: SerpApiResponse) => void) => Promise<SerpApiResponse> | void },
  query: string,
  params: SearchParams
): Promise<WebSearchResult[]> {
  try {
    const response = await callSerpApiJson(serpApi, {
      engine: 'google_news',
      ...params
    });

    const newsResults = (response?.news_results ?? []) as Array<Record<string, unknown>>;
    return newsResults.map((r) => ({
      title: (r.title as string) || '',
      link: (r.link as string) || '',
      snippet: (r.snippet as string) || '',
      displayedLink: (r.source as string) || (r.displayed_link as string) || undefined,
      date: (r.date as string) || undefined,
      source: (r.source as string) || extractSourceFromLink(r.link as string) || undefined
    }));
  } catch (error) {
    console.error('Error searching Google News:', error);
    return [];
  }
}

/**
 * Extract page content
 */
async function extractPageContent(url: string): Promise<string | null> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    if (!response.ok) return null;
    const html = await response.text();
    const $ = load(html);
    $('script, style, noscript').remove();

    let content = '';
    const article = $('article, .article, .post, .content').first();
    if (article.length) {
      content = article.text();
    } else {
      content = $('body').text();
    }

    content = content.replace(/\s+/g, ' ').trim().substring(0, 500);
    return content || null;
  } catch (error) {
    console.error(`Error extracting content from ${url}:`, error);
    return null;
  }
}

function extractSourceFromLink(url: string): string | undefined {
  try {
    if (!url) return undefined;
    const u = new URL(url);
    const hostname = u.hostname.replace(/^www\./i, '');
    const parts = hostname.split('.');
    if (parts.length > 1) return parts[0];
    return hostname;
  } catch {
    return undefined;
  }
}

function extractSourceFromDisplayedLink(displayedLink: string): string | undefined {
  try {
    if (!displayedLink) return undefined;
    const m = displayedLink.match(/^(?:https?:\/\/)?(?:www\.)?([^\/]+)/i);
    if (m && m[1]) {
      const hostname = m[1];
      const parts = hostname.split('.');
      if (parts.length > 1) return parts[0];
      return hostname;
    }
    return undefined;
  } catch {
    return undefined;
  }
}

/**
 * Search recent news
 */
export async function searchRecentNews(
  topic: string,
  options: {
    hours?: number;
    location?: string;
    language?: string;
    numResults?: number;
  } = {}
): Promise<WebSearchResult[]> {
  const { hours = 24, location = 'us', language = 'en', numResults = 10 } = options;
  const timeRange = hours <= 24 ? 'today' : hours <= 168 ? 'week' : 'month';

  return searchWeb(topic, {
    type: 'news',
    location,
    language,
    numResults,
    timeRange
  });
}

/**
 * Format search results into text lines
 */
export function formatWebSearchResults(results: WebSearchResult[]): string[] {
  return results.map((result, index) => {
    const dateStr = result.date ? ` (${formatDate(result.date)})` : '';
    const sourceStr = result.source ? ` [Source: ${result.source}]` : '';
    return `${index + 1}. ${result.title}${dateStr} - ${result.link}${sourceStr}\n   ${result.snippet}`;
  });
}

function formatDate(dateString: string): string {
  try {
    const d = new Date(dateString);
    const diffMs = Date.now() - d.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    return d.toLocaleDateString();
  } catch {
    return dateString;
  }
}

/**
 * Get page meta information
 */
export async function getUrlInfo(url: string): Promise<{
  title: string;
  description: string;
  image?: string;
  author?: string;
  publishDate?: string;
}> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch URL: ${response.status}`);
    }

    const html = await response.text();
    const $ = load(html);

    const title =
      $('title').text().trim() ||
      $('meta[property="og:title"]').attr('content') ||
      $('meta[name="title"]').attr('content') ||
      '';

    const description =
      $('meta[name="description"]').attr('content') ||
      $('meta[property="og:description"]').attr('content') ||
      $('meta[name="twitter:description"]').attr('content') ||
      '';

    const image =
      $('meta[property="og:image"]').attr('content') ||
      $('meta[name="twitter:image"]').attr('content') ||
      $('meta[name="image"]').attr('content') ||
      undefined;

    const author =
      $('meta[name="author"]').attr('content') ||
      $('meta[property="article:author"]').attr('content') ||
      undefined;

    const publishDate =
      $('meta[property="article:published_time"]').attr('content') ||
      $('meta[name="date"]').attr('content') ||
      $('time[datetime]').attr('datetime') ||
      undefined;

    return {
      title,
      description,
      image,
      author,
      publishDate
    };
  } catch (error) {
    console.error(`Error getting URL info for ${url}:`, error);
    return {
      title: '',
      description: ''
    };
  }
}
