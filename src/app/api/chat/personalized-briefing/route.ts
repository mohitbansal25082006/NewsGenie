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
  format?: 'json' | 'html' | 'markdown';
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

/**
 * User type with preferences (userPreference can be null)
 */
interface UserWithPreferences {
  id: string;
  userPreference: {
    interests: string[];
    country: string;
    language: string;
  } | null;
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      include: { userPreference: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Type assertion to match our interface
    const userWithPrefs = user as unknown as UserWithPreferences;
    
    // If user preferences don't exist, create default preferences
    if (!userWithPrefs.userPreference) {
      try {
        await db.userPreference.create({
          data: {
            userId: userWithPrefs.id,
            interests: ['general', 'technology', 'business'],
            country: 'us',
            language: 'en',
          },
        });
        
        // Refetch user with preferences
        const updatedUser = await db.user.findUnique({
          where: { id: session.user.id },
          include: { userPreference: true },
        });
        
        if (!updatedUser?.userPreference) {
          return NextResponse.json({ error: 'Failed to create user preferences' }, { status: 500 });
        }
        
        // Update the user with preferences
        userWithPrefs.userPreference = updatedUser.userPreference;
      } catch (error) {
        console.error('Error creating user preferences:', error);
        return NextResponse.json({ error: 'Failed to create user preferences' }, { status: 500 });
      }
    }

    const { searchParams } = new URL(request.url);
    const webSearchEnabled = searchParams.get('webSearch') === 'true';
    const timeRange =
      (searchParams.get('timeRange') as 'today' | 'week' | 'month' | 'quarter') || 'week';
    const forceRefresh = searchParams.get('forceRefresh') === 'true';
    const format = (searchParams.get('format') as 'json' | 'html' | 'markdown') || 'json';

    const briefing = await generatePersonalizedBriefingInternal(
      userWithPrefs,
      webSearchEnabled,
      timeRange,
      forceRefresh
    );

    if (format === 'html') {
      return formatBriefingAsHtml(briefing);
    } else if (format === 'markdown') {
      return formatBriefingAsMarkdown(briefing);
    } else {
      return NextResponse.json(briefing);
    }
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
    const {
      webSearchEnabled = true,
      forceRefresh = false,
      timeRange = 'week',
      categories,
      format = 'json',
    } = body;

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      include: { userPreference: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Type assertion to match our interface
    const userWithPrefs = user as unknown as UserWithPreferences;
    
    // If user preferences don't exist, create default preferences
    if (!userWithPrefs.userPreference) {
      try {
        await db.userPreference.create({
          data: {
            userId: userWithPrefs.id,
            interests: ['general', 'technology', 'business'],
            country: 'us',
            language: 'en',
          },
        });
        
        // Refetch user with preferences
        const updatedUser = await db.user.findUnique({
          where: { id: session.user.id },
          include: { userPreference: true },
        });
        
        if (!updatedUser?.userPreference) {
          return NextResponse.json({ error: 'Failed to create user preferences' }, { status: 500 });
        }
        
        // Update the user with preferences
        userWithPrefs.userPreference = updatedUser.userPreference;
      } catch (error) {
        console.error('Error creating user preferences:', error);
        return NextResponse.json({ error: 'Failed to create user preferences' }, { status: 500 });
      }
    }

    const briefing = await generatePersonalizedBriefingInternal(
      userWithPrefs,
      webSearchEnabled,
      timeRange,
      forceRefresh,
      categories
    );

    if (format === 'html') {
      return formatBriefingAsHtml(briefing);
    } else if (format === 'markdown') {
      return formatBriefingAsMarkdown(briefing);
    } else {
      return NextResponse.json(briefing);
    }
  } catch (error) {
    console.error('Error creating personalized briefing:', error);
    return NextResponse.json({ error: 'Failed to create personalized briefing' }, { status: 500 });
  }
}

/**
 * Format briefing as HTML
 */
function formatBriefingAsHtml(briefingResp: BriefingResponse): NextResponse {
  const {
    briefing: briefingText,
    articlesCount,
    latestArticleDate,
    generatedAt,
    timeRange,
    categories,
    sources,
  } = briefingResp;

  const formattedDate = latestArticleDate
    ? new Date(latestArticleDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'Not available';

  const generatedAtFormatted = new Date(generatedAt).toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const timeRangeFormatted = timeRange.charAt(0).toUpperCase() + timeRange.slice(1);

  let formattedBriefing = briefingText
    .replace(/^### (.*$)/gm, '<h3>$1</h3>')
    .replace(/^## (.*$)/gm, '<h2>$1</h2>')
    .replace(/^# (.*$)/gm, '<h1>$1</h1>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/^- (.*$)/gm, '<li>$1</li>')
    .replace(/(<li>[\s\S]*<\/li>)/, '<ul>$1</ul>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/^(.*)$/gm, '<p>$1</p>');

  formattedBriefing = formattedBriefing.replace(/<p><\/p>/g, '');

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Personalized News Briefing</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f9fafb;
    }
    .container { background: white; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); padding: 30px; }
    .title { font-size: 28px; font-weight: 700; color: #1e40af; }
    h1,h2,h3 { color: #1e40af; }
  </style>
</head>
<body>
  <div class="container">
    <h1 class="title">Personalized News Briefing</h1>
    <p><strong>Generated on:</strong> ${generatedAtFormatted}</p>
    <p><strong>Time range:</strong> ${timeRangeFormatted}</p>
    <p><strong>Articles:</strong> ${articlesCount}</p>
    <p><strong>Sources:</strong> ${sources.length}</p>
    ${latestArticleDate ? `<p><strong>Latest:</strong> ${formattedDate}</p>` : ''}
    <div>${categories.map(cat => `<span>[${cat}]</span>`).join(' ')}</div>
    <div>${formattedBriefing}</div>
  </div>
</body>
</html>
  `;
  return new NextResponse(html, { headers: { 'Content-Type': 'text/html' } });
}

/**
 * Format briefing as Markdown
 */
function formatBriefingAsMarkdown(briefingResp: BriefingResponse): NextResponse {
  const {
    briefing: briefingText,
    articlesCount,
    latestArticleDate,
    generatedAt,
    timeRange,
    categories,
    sources,
  } = briefingResp;

  const formattedDate = latestArticleDate
    ? new Date(latestArticleDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'Not available';

  const generatedAtFormatted = new Date(generatedAt).toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const timeRangeFormatted = timeRange.charAt(0).toUpperCase() + timeRange.slice(1);
  const categoriesList = categories.map((cat) => `- ${cat}`).join('\n  ');

  const markdown = `# Personalized News Briefing
---
**Generated on:** ${generatedAtFormatted}  
**Time range:** ${timeRangeFormatted}  
**Articles:** ${articlesCount}  
**Sources:** ${sources.length}  
${latestArticleDate ? `**Latest article:** ${formattedDate}\n` : ''}
**Categories:**  
  ${categoriesList}
---
${briefingText}
---
*This briefing was generated by NewsGenie AI based on your interests and reading history.*`;

  return new NextResponse(markdown, { headers: { 'Content-Type': 'text/markdown' } });
}

/**
 * Internal function to generate personalized briefing
 */
async function generatePersonalizedBriefingInternal(
  user: UserWithPreferences,
  webSearchEnabled: boolean = true,
  timeRange: 'today' | 'week' | 'month' | 'quarter' = 'week',
  forceRefresh: boolean = false,
  customCategories?: string[]
): Promise<BriefingResponse> {
  let categories: string[] = [];
  
  try {
    // We already checked that userPreference is not null, but TypeScript doesn't know this
    if (!user.userPreference) {
      throw new Error('User preferences not found');
    }

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

    const mapArticle = (a: NewsApiArticle, category: string): ProcessedArticle => ({
      title: a.title ?? '',
      description: a.description ?? null,
      content: a.content ?? null,
      url: a.url,
      publishedAt: a.publishedAt ?? null,
      source: a.source?.name ?? 'unknown',
      category,
    });

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
              return new Date(article.publishedAt) >= startDate;
            })
            .map((article) => mapArticle(article, category));
          
          allArticles.push(...processed);
        }
      } catch (error) {
        console.error(`Error fetching articles for category ${category}:`, error);
      }
    }

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
              return new Date(article.publishedAt) >= startDate;
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

    if (webSearchEnabled) {
      try {
        const searchQuery =
          interests.length > 0
            ? `latest ${interests.slice(0, 3).join(', ')} news`
            : 'latest news developments';
            
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
            searchTimeRange = 'month'; 
            break;
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
      briefing: `I apologize, but I'm currently unable to generate your personalized briefing. Please try again later.`,
      articlesCount: 0,
      latestArticleDate: null,
      sources: [],
      generatedAt: new Date().toISOString(),
      timeRange,
      categories: categories || [],
    };
  }
}