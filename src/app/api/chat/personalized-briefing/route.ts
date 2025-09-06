// E:\newsgenie\src\app\api\chat\personalized-briefing\route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { generatePersonalizedBriefing } from '@/lib/openai';
import { NewsAPI } from '@/lib/newsApi';
import { searchWeb, WebSearchResult, formatWebSearchResults } from '@/lib/webSearch';

/**
 * Types for NewsAPI responses (avoid `any`)
 */
interface NewsApiSource {
  id?: string | null;
  name: string;
}

interface NewsApiArticle {
  source: NewsApiSource;
  author?: string | null;
  title?: string | null;
  description?: string | null;
  url: string;
  urlToImage?: string | null;
  publishedAt?: string | null;
  content?: string | null;
}

interface NewsApiResponse {
  status: 'ok' | 'error';
  totalResults?: number;
  articles?: NewsApiArticle[];
  code?: string;
  message?: string;
}

/**
 * Processed article type the AI expects
 */
interface ProcessedArticle {
  title: string;
  description?: string | null;
  content?: string | null;
  url: string;
  publishedAt?: string | null;
  source: string;
  category: string;
}

/**
 * Briefing request body
 */
interface BriefingRequest {
  webSearchEnabled?: boolean;
  forceRefresh?: boolean;
  timeRange?: 'today' | 'week' | 'month' | 'quarter';
  categories?: string[];
}

/**
 * Briefing response
 */
interface BriefingResponse {
  briefing: string;
  articlesCount: number;
  latestArticleDate: string | null;
  webSearchResults?: WebSearchResult[];
  sources: string[];
  generatedAt: string;
  timeRange: string;
  categories: string[];
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user preferences
    const user = await db.user.findUnique({
      where: {
        id: session.user.id,
      },
      include: {
        userPreference: true,
      },
    });

    if (!user || !user.userPreference) {
      return NextResponse.json({ error: 'User preferences not found' }, { status: 404 });
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const webSearchEnabled = searchParams.get('webSearch') === 'true';
    const timeRange =
      (searchParams.get('timeRange') as 'today' | 'week' | 'month' | 'quarter') || 'week';
    const forceRefresh = searchParams.get('forceRefresh') === 'true';

    // Generate personalized briefing
    const briefing = await generatePersonalizedBriefingInternal(
      user,
      webSearchEnabled,
      timeRange,
      forceRefresh
    );

    return NextResponse.json(briefing);
  } catch (error) {
    console.error('Error creating personalized briefing:', error);
    return NextResponse.json({ error: 'Failed to create personalized briefing' }, { status: 500 });
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = (await request.json()) as BriefingRequest;
    const { webSearchEnabled = true, forceRefresh = false, timeRange = 'week', categories } = body;

    // Get user preferences
    const user = await db.user.findUnique({
      where: {
        id: session.user.id,
      },
      include: {
        userPreference: true,
      },
    });

    if (!user || !user.userPreference) {
      return NextResponse.json({ error: 'User preferences not found' }, { status: 404 });
    }

    // Generate personalized briefing
    const briefing = await generatePersonalizedBriefingInternal(
      user,
      webSearchEnabled,
      timeRange,
      forceRefresh,
      categories
    );

    return NextResponse.json(briefing);
  } catch (error) {
    console.error('Error creating personalized briefing:', error);
    return NextResponse.json({ error: 'Failed to create personalized briefing' }, { status: 500 });
  }
}

/**
 * Internal function to generate personalized briefing
 */
async function generatePersonalizedBriefingInternal(
  user: any,
  webSearchEnabled: boolean = true,
  timeRange: 'today' | 'week' | 'month' | 'quarter' = 'week',
  forceRefresh: boolean = false,
  customCategories?: string[]
): Promise<BriefingResponse> {
  // Ensure categories always available (fix for catch block)
  let categories: string[] = [];

  try {
    console.log(
      `Generating personalized briefing for user ${user.id} (web search: ${webSearchEnabled}, time range: ${timeRange})`
    );

    // Build categories from user interests or custom categories
    const interests =
      Array.isArray(user.userPreference.interests) && user.userPreference.interests.length > 0
        ? user.userPreference.interests
        : [];

    categories =
      customCategories && customCategories.length > 0
        ? customCategories.slice(0, 5)
        : interests.length > 0
        ? interests.slice(0, 3)
        : ['general', 'business', 'technology'];

    const allArticles: ProcessedArticle[] = [];
    const newsApi = new NewsAPI();
    let webSearchResults: WebSearchResult[] = [];
    let allSources: string[] = [];

    // Helper to safely map NewsAPI article to our ProcessedArticle
    const mapArticle = (a: NewsApiArticle, category: string): ProcessedArticle => ({
      title: a.title ?? '',
      description: a.description ?? null,
      content: a.content ?? null,
      url: a.url,
      publishedAt: a.publishedAt ?? null,
      source: a.source?.name ?? 'unknown',
      category,
    });

    // Calculate date range for filtering
    const now = new Date();
    const startDate = new Date();
    switch (timeRange) {
      case 'today':
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'quarter':
        startDate.setMonth(now.getMonth() - 3);
        break;
    }

    // Fetch articles by category
    for (const category of categories) {
      try {
        const response = (await newsApi.getTopHeadlines({
          category,
          country: user.userPreference.country,
          pageSize: 5,
        })) as NewsApiResponse;

        if (response.status === 'ok' && Array.isArray(response.articles)) {
          const processed = response.articles
            .filter((article) => {
              if (!article.publishedAt) return true;
              const articleDate = new Date(article.publishedAt);
              return articleDate >= startDate;
            })
            .map((article) => mapArticle(article, category));
          allArticles.push(...processed);
        }
      } catch (error) {
        console.error(`Error fetching articles for category ${category}:`, error);
      }
    }

    // If not enough articles, fetch broader "everything" query
    if (allArticles.length < 10) {
      try {
        const query =
          interests.length > 0
            ? interests.map((i: string) => i.trim()).filter(Boolean).join(' OR ')
            : 'latest news';

        const response = (await newsApi.getEverything({
          q: query,
          language: user.userPreference.language,
          sortBy: 'publishedAt',
          from: startDate.toISOString().split('T')[0],
          pageSize: 20,
        })) as NewsApiResponse;

        if (response.status === 'ok' && Array.isArray(response.articles)) {
          const processed = response.articles
            .filter((article) => {
              if (!article.publishedAt) return true;
              const articleDate = new Date(article.publishedAt);
              return articleDate >= startDate;
            })
            .map((article) => mapArticle(article, 'general'));

          for (const article of processed) {
            if (!allArticles.some((a) => a.url === article.url)) {
              allArticles.push(article);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching everything articles:', error);
      }
    }

    // Perform web search if enabled
    if (webSearchEnabled) {
      try {
        const searchQuery =
          interests.length > 0
            ? `latest ${interests.slice(0, 3).join(', ')} news`
            : 'latest news developments';

        console.log('Performing web search for briefing:', searchQuery);

        // Map our timeRange to what searchWeb expects
        let searchTimeRange: 'today' | 'week' | 'month' | 'year' | undefined;
        switch (timeRange) {
          case 'today':
            searchTimeRange = 'today';
            break;
          case 'week':
            searchTimeRange = 'week';
            break;
          case 'month':
            searchTimeRange = 'month';
            break;
          case 'quarter':
            // For quarter, use month as the closest approximation
            searchTimeRange = 'month';
            break;
          default:
            searchTimeRange = 'week';
        }

        const searchResults = await searchWeb(searchQuery, {
          type: 'news',
          location: user.userPreference.country,
          language: user.userPreference.language,
          numResults: 10,
          timeRange: searchTimeRange,
        });

        if (searchResults && searchResults.length > 0) {
          webSearchResults = searchResults;

          const webSources = searchResults.map((r) => r.link).filter((link): link is string => Boolean(link));
          allSources.push(...webSources);

          console.log(`Web search returned ${searchResults.length} results`);
        }
      } catch (error) {
        console.error('Web search failed for briefing:', error);
      }
    }

    const latestArticles = allArticles
      .slice()
      .sort((a, b) => {
        const at = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
        const bt = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
        return bt - at;
      })
      .slice(0, 15);

    const formattedArticles = latestArticles.map((article) => ({
      title: article.title,
      summary: article.description ?? article.content?.substring(0, 200) ?? '',
      category: article.category,
      publishedAt: article.publishedAt ?? new Date().toISOString(),
    }));

    const briefing = await generatePersonalizedBriefing(
      {
        interests: user.userPreference.interests ?? [],
        country: user.userPreference.country,
        language: user.userPreference.language,
      },
      formattedArticles,
      webSearchResults.length > 0 ? formatWebSearchResults(webSearchResults) : undefined
    );

    const articleSources = latestArticles.map((a) => a.url).filter(Boolean) as string[];
    allSources = [...new Set([...allSources, ...articleSources])];

    return {
      briefing,
      articlesCount: latestArticles.length,
      latestArticleDate: latestArticles[0]?.publishedAt ?? null,
      webSearchResults: webSearchResults.length > 0 ? webSearchResults : undefined,
      sources: allSources,
      generatedAt: new Date().toISOString(),
      timeRange,
      categories,
    };
  } catch (error) {
    console.error('Error in generatePersonalizedBriefingInternal:', error);

    return {
      briefing: `I apologize, but I'm currently unable to generate your personalized briefing.`,
      articlesCount: 0,
      latestArticleDate: null,
      sources: [],
      generatedAt: new Date().toISOString(),
      timeRange,
      categories: categories || [],
    };
  }
}