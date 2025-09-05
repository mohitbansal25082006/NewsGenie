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

interface WebSearchOptions {
  query: string;
  type?: 'search' | 'news' | 'images' | 'videos';
  location?: string;
  language?: string;
  num?: number;
  timeRange?: 'today' | 'week' | 'month' | 'year';
}

// Cache the SerpApi class to avoid repeated import resolution
let SerpApiClass: any = null;

/**
 * Safely call SerpAPI's json method (supports both callback-style and promise-style implementations)
 */
function callSerpApiJson(instance: any, params: any): Promise<any> {
  return new Promise((resolve, reject) => {
    try {
      // If instance.json supports callback-style: instance.json(params, callback)
      let called = false;
      const maybe = instance.json(params, (data: any) => {
        called = true;
        resolve(data);
      });

      // If instance.json returned a Promise-like object
      if (!called && maybe && typeof maybe.then === 'function') {
        maybe.then(resolve).catch(reject);
      } else if (!called && maybe === undefined) {
        // Some versions may only use callback and we've already handled it above.
        // If callback wasn't used (because implementation is sync), resolve with maybe.
        // (edge case)
        resolve(maybe);
      }
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * Initialize SerpApi class dynamically. Handles different export shapes.
 */
async function initializeSerpApi(): Promise<any> {
  if (SerpApiClass) return SerpApiClass;

  // Ensure env key exists early
  if (!process.env.SERPAPI_KEY) {
    throw new Error('SerpAPI key is missing. Please add SERPAPI_KEY to your environment variables.');
  }

  try {
    // Use 'any' to avoid TS complaining about shapes of the imported module
    const serpApiModule: any = await import('google-search-results-nodejs');

    // Common export shapes:
    // 1) module.default -> class
    // 2) module.GoogleSearch -> constructor function
    // 3) module.SerpApi -> constructor
    if (serpApiModule.default && typeof serpApiModule.default === 'function') {
      SerpApiClass = serpApiModule.default;
    } else if (serpApiModule.GoogleSearch && typeof serpApiModule.GoogleSearch === 'function') {
      SerpApiClass = serpApiModule.GoogleSearch;
    } else if (serpApiModule.SerpApi && typeof serpApiModule.SerpApi === 'function') {
      SerpApiClass = serpApiModule.SerpApi;
    } else {
      // As a fallback, try to find the first function export (excluding __esModule)
      for (const key in serpApiModule) {
        if (key === '__esModule') continue;
        if (typeof serpApiModule[key] === 'function') {
          SerpApiClass = serpApiModule[key];
          break;
        }
      }
    }

    if (!SerpApiClass) {
      throw new Error('Unable to locate a SerpAPI constructor in the google-search-results-nodejs module.');
    }

    return SerpApiClass;
  } catch (err) {
    console.error('Failed to import google-search-results-nodejs:', err);
    throw err;
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
    let SerpApiConstructor: any;
    try {
      SerpApiConstructor = await initializeSerpApi();
    } catch (err) {
      console.warn('SerpAPI not available, returning mock results.', err);
      return getMockSearchResults(query, type, numResults);
    }

    const searchParams: any = {
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
      // SerpAPI expects qdr:d/w/m/y shorthand
      const qdr = timeRange === 'today' ? 'd' : timeRange === 'week' ? 'w' : timeRange === 'month' ? 'm' : 'y';
      searchParams.tbs = `qdr:${qdr}`;
    }

    // instantiate
    const serpApiInstance = new SerpApiConstructor(process.env.SERPAPI_KEY);

    let results: WebSearchResult[] = [];

    if (type === 'news') {
      results = await searchGoogleNews(serpApiInstance, query, searchParams);
    } else {
      const webPromise = searchGoogleWeb(serpApiInstance, query, searchParams);
      // for news combine smaller number
      const newsParams = { ...searchParams, num: Math.floor(numResults / 2) || 1 };
      const newsPromise = searchGoogleNews(serpApiInstance, query, newsParams);

      const [webResults, newsResults] = await Promise.all([webPromise, newsPromise]);

      // combine, dedupe and limit
      const combined = [...webResults, ...newsResults];
      const deduped: WebSearchResult[] = combined.filter((r, i, arr) => {
        return arr.findIndex(x => x.link === r.link) === i;
      }).slice(0, numResults);

      results = deduped;
    }

    // Enhance snippets by trying to fetch page content if snippet short
    const enhanced = await Promise.all(results.map(async (r) => {
      try {
        if ((!r.snippet || r.snippet.length < 100) && r.link) {
          const content = await extractPageContent(r.link);
          if (content) r.snippet = content;
        }
      } catch (err) {
        // ignore enhancement errors
      }
      return r;
    }));

    return enhanced;
  } catch (err) {
    console.error('searchWeb error:', err);
    return getMockSearchResults(query, options.type || 'comprehensive', options.numResults || 10);
  }
}

/**
 * Fallback mock search results used when SerpAPI is not available (or for dev)
 */
function getMockSearchResults(query: string, type: 'news' | 'comprehensive', numResults: number): WebSearchResult[] {
  console.warn('Using mock search results for:', query);
  const results: WebSearchResult[] = [];
  const q = query.toLowerCase();

  if (q.includes('stock market') || q.includes('stocks')) {
    results.push(
      {
        title: "Global Stock Markets Rally as Inflation Data Shows Signs of Cooling",
        link: "https://www.reuters.com/markets/global-markets-rally-inflation-cooling-2023",
        snippet: "Major stock indices around the world climbed today as new inflation data suggests that price increases may be slowing, giving investors hope that central banks might ease interest rate hikes.",
        source: "Reuters",
        date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
      },
      {
        title: "Tech Stocks Lead Gains as AI Companies Report Strong Earnings",
        link: "https://www.bloomberg.com/tech-stocks-ai-earnings-2023",
        snippet: "Technology stocks surged today, with companies in the artificial intelligence sector leading the way after several reported better-than-expected quarterly earnings results.",
        source: "Bloomberg",
        date: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
      }
    );
  } else if (q.includes('science') || q.includes('scientific')) {
    results.push(
      {
        title: "Breakthrough in Quantum Computing Announced by Research Team",
        link: "https://www.nature.com/articles/quantum-computing-breakthrough-2023",
        snippet: "Scientists have achieved a major breakthrough in quantum computing, developing a new type of qubit that maintains coherence for significantly longer periods.",
        source: "Nature",
        date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
      }
    );
  } else if (q.includes('politics') || q.includes('election')) {
    results.push(
      {
        title: "Congress Reaches Last-Minute Deal to Avoid Government Shutdown",
        link: "https://www.nytimes.com/2023/10/15/us/politics/government-shutdown-deal.html",
        snippet: "Lawmakers in Congress reached a bipartisan agreement on a temporary funding bill just hours before a potential government shutdown.",
        source: "The New York Times",
        date: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString()
      }
    );
  } else {
    results.push(
      {
        title: `${query} - Latest Updates and Analysis`,
        link: `https://www.bbc.com/news/${query.toLowerCase().replace(/\s+/g, '-')}`,
        snippet: `Comprehensive coverage of the latest developments related to ${query}.`,
        source: "BBC News",
        date: new Date().toISOString()
      },
      {
        title: `Breaking News: ${query}`,
        link: `https://www.cnn.com/${query.toLowerCase().replace(/\s+/g, '-')}`,
        snippet: `The latest breaking news on ${query}.`,
        source: "CNN",
        date: new Date(Date.now() - 60 * 60 * 1000).toISOString()
      }
    );
  }

  while (results.length < numResults) {
    results.push({
      title: `${query} - Additional Information`,
      link: `https://example.com/news/${query.toLowerCase().replace(/\s+/g, '-')}-${results.length + 1}`,
      snippet: `More information about ${query} from a comprehensive news coverage.`,
      source: "News Source",
      date: new Date(Date.now() - results.length * 60 * 60 * 1000).toISOString()
    });
  }

  return results.slice(0, numResults);
}

/**
 * Search Google Web (organic) results via SerpAPI instance
 */
async function searchGoogleWeb(serpApi: any, query: string, params: any): Promise<WebSearchResult[]> {
  try {
    const response = await callSerpApiJson(serpApi, {
      engine: 'google',
      ...params
    });

    const organic = response?.organic_results || [];
    return organic.map((r: any) => ({
      title: r.title || '',
      link: r.link || '',
      snippet: r.snippet || '',
      displayedLink: r.displayed_link || '',
      date: r.date || '',
      source: extractSourceFromLink(r.link) || extractSourceFromDisplayedLink(r.displayed_link)
    }));
  } catch (err) {
    console.error('Error searching Google Web:', err);
    return [];
  }
}

/**
 * Search Google News via SerpAPI instance
 */
async function searchGoogleNews(serpApi: any, query: string, params: any): Promise<WebSearchResult[]> {
  try {
    const response = await callSerpApiJson(serpApi, {
      engine: 'google_news',
      ...params
    });

    const newsResults = response?.news_results || [];
    return newsResults.map((r: any) => ({
      title: r.title || '',
      link: r.link || '',
      snippet: r.snippet || '',
      displayedLink: r.source || r.displayed_link || '',
      date: r.date || '',
      source: r.source || extractSourceFromLink(r.link)
    }));
  } catch (err) {
    console.error('Error searching Google News:', err);
    return [];
  }
}

/**
 * Try to fetch and extract main textual content from a page (first ~500 chars)
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
  } catch (err) {
    console.error(`Error extracting content from ${url}:`, err);
    return null;
  }
}

function extractSourceFromLink(url: string): string | null {
  try {
    if (!url) return null;
    const u = new URL(url);
    const hostname = u.hostname.replace(/^www\./i, '');
    const parts = hostname.split('.');
    if (parts.length > 1) return parts[0];
    return hostname;
  } catch {
    return null;
  }
}

function extractSourceFromDisplayedLink(displayedLink: string): string | null {
  try {
    if (!displayedLink) return null;
    const m = displayedLink.match(/^(?:https?:\/\/)?(?:www\.)?([^\/]+)/i);
    if (m && m[1]) {
      const hostname = m[1];
      const parts = hostname.split('.');
      if (parts.length > 1) return parts[0];
      return hostname;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Search recent news (hours window)
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
    timeRange: timeRange as any
  });
}

/**
 * Format search results into text lines for AI consumption
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
 * Get page meta information for a URL
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
  } catch (err) {
    console.error(`Error getting URL info for ${url}:`, err);
    return {
      title: '',
      description: ''
    };
  }
}
