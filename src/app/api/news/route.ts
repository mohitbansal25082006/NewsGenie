import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { NewsAPI } from '@/lib/newsApi';
import { summarizeArticle, analyzeSentiment, extractKeywords } from '@/lib/openai';

const newsApi = new NewsAPI();

interface NewsApiParams {
  page: number;
  pageSize: number;
  country: string;
  category?: string;
  q?: string;
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const country = searchParams.get('country') || 'us';
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '20');
    const q = searchParams.get('q');

    // Get user preferences
    const user = await db.user.findUnique({
      where: { email: session.user.email },
      include: { userPreference: true },
    });

    const newsParams: NewsApiParams = {
      page,
      pageSize,
      country,
    };

    if (category) {
      newsParams.category = category;
    }

    if (q) {
      newsParams.q = q;
    }

    // If user has preferences, use them
    if (user?.userPreference && !category && !q) {
      if (user.userPreference.interests && user.userPreference.interests.length > 0) {
        // For top headlines, we can only use one category
        // Map interests to news categories
        const validCategory = user.userPreference.interests.find((interest: string) => 
          ['general', 'business', 'entertainment', 'health', 'science', 'sports', 'technology'].includes(interest)
        );
        if (validCategory) {
          newsParams.category = validCategory;
        }
      }
    }

    const newsResponse = await newsApi.getTopHeadlines(newsParams);
    
    // Process articles and add AI features
    const processedArticles = await Promise.all(
      newsResponse.articles.map(async (article) => {
        // Check if article already exists in database
        let dbArticle = await db.article.findUnique({
          where: { url: article.url },
        });

        if (!dbArticle) {
          // Create new article with AI processing
          const summary = article.content ? await summarizeArticle(article.content) : null;
          const sentiment = article.title ? await analyzeSentiment(article.title + ' ' + (article.description || '')) : 'neutral';
          const keywords = article.title ? await extractKeywords(article.title + ' ' + (article.description || '')) : [];

          dbArticle = await db.article.create({
            data: {
              title: article.title,
              description: article.description || '',
              content: article.content || '',
              url: article.url,
              urlToImage: article.urlToImage || '',
              publishedAt: new Date(article.publishedAt),
              source: article.source.name,
              author: article.author || '',
              category: category || 'general',
              country: country,
              language: 'en',
              summary,
              sentiment,
              keywords,
            },
          });
        }

        return {
          ...article,
          id: dbArticle.id,
          summary: dbArticle.summary,
          sentiment: dbArticle.sentiment,
          keywords: dbArticle.keywords,
        };
      })
    );

    return NextResponse.json({
      ...newsResponse,
      articles: processedArticles,
    });

  } catch (error) {
    console.error('News API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch news' },
      { status: 500 }
    );
  }
}