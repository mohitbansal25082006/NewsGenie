// E:\newsgenie\src\app\api\chat\personalized-briefing\route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { generatePersonalizedBriefing } from '@/lib/openai';
import { NewsAPI } from '@/lib/newsApi';

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

export async function GET(): Promise<NextResponse> {
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

    // Build categories from user interests (defensive: ensure array)
    const interests =
      Array.isArray(user.userPreference.interests) && user.userPreference.interests.length > 0
        ? user.userPreference.interests
        : [];

    const categories: string[] =
      interests.length > 0 ? interests.slice(0, 3) : ['general', 'business', 'technology'];

    const allArticles: ProcessedArticle[] = [];
    const newsApi = new NewsAPI();

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

    // Fetch articles by category
    for (const category of categories) {
      try {
        const response = (await newsApi.getTopHeadlines({
          category,
          country: user.userPreference.country,
          pageSize: 5,
        })) as NewsApiResponse;

        if (response.status === 'ok' && Array.isArray(response.articles)) {
          const processed = response.articles.map((article) => mapArticle(article, category));
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
          interests.length > 0 ? interests.map((i) => i.trim()).filter(Boolean).join(' OR ') : 'latest news';

        const response = (await newsApi.getEverything({
          q: query,
          language: user.userPreference.language,
          sortBy: 'publishedAt',
          pageSize: 20,
        })) as NewsApiResponse;

        if (response.status === 'ok' && Array.isArray(response.articles)) {
          const processed = response.articles.map((article) => mapArticle(article, 'general'));

          // Add unique articles by URL
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

    // Sort by published date (newest first). If missing date, push to the end.
    const latestArticles = allArticles
      .slice()
      .sort((a, b) => {
        const at = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
        const bt = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
        return bt - at;
      })
      .slice(0, 15);

    // Format for the AI — ensure publishedAt is always a string (fallback to current time)
    const formattedArticles: { title: string; summary: string; category: string; publishedAt: string }[] =
      latestArticles.map((article) => ({
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
      formattedArticles
    );

    return NextResponse.json({
      briefing,
      articlesCount: latestArticles.length,
      latestArticleDate: latestArticles[0]?.publishedAt ?? null,
    });
  } catch (error) {
    console.error('Error creating personalized briefing:', error);
    return NextResponse.json({ error: 'Failed to create personalized briefing' }, { status: 500 });
  }
}
