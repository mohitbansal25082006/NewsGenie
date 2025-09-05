import { NextRequest, NextResponse } from 'next/server';
import { NewsAPI } from '@/lib/newsApi'; // Import the class
import { analyzeArticle } from '@/lib/aiAnalysis';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    // Verify cron secret (add this to your .env.local)
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('Starting automated news fetch...');

    // Initialize NewsAPI
    const newsApi = new NewsAPI();

    // Fetch latest news
    const categories = ['general', 'business', 'technology', 'sports', 'health', 'entertainment'];
    let totalProcessed = 0;

    for (const category of categories) {
      try {
        // Use the class method to get news
        const response = await newsApi.getTopHeadlines({
          category,
          pageSize: 20,
          page: 1
        });
        
        const articles = response.articles;

        for (const article of articles) {
          // Check if article already exists
          const existing = await db.article.findUnique({
            where: { url: article.url },
          });

          if (!existing) {
            // Analyze article with AI
            const analysis = await analyzeArticle(
              article.title,
              article.description || '',
              article.content || ''
            );

            // Store article with AI analysis
            await db.article.create({
              data: {
                title: article.title,
                description: article.description,
                content: article.content,
                url: article.url,
                urlToImage: article.urlToImage,
                source: article.source?.name || 'Unknown',
                category,
                publishedAt: new Date(article.publishedAt),
                author: article.author,
                summary: analysis.summary,
                sentiment: analysis.sentiment,
                keywords: analysis.keywords,
                topics: analysis.topics,
                importance: analysis.importance,
              },
            });

            totalProcessed++;
          }
        }
      } catch (categoryError) {
        console.error(`Error processing category ${category}:`, categoryError);
      }
    }

    // Update analytics
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const totalUsers = await db.user.count();
    const totalArticles = await db.article.count();
    const todayViews = await db.readArticle.count({
      where: {
        readAt: {
          gte: today,
        },
      },
    });

    // Get category breakdown
    const categories_breakdown = await db.article.groupBy({
      by: ['category'],
      _count: true,
    });

    const topCategories = categories_breakdown.reduce((acc: Record<string, number>, item) => {
      acc[item.category] = item._count;
      return acc;
    }, {});

    // Get source breakdown
    const sources_breakdown = await db.article.groupBy({
      by: ['source'],
      _count: {
        _all: true
      },
      orderBy: {
        _count: {
          source: 'desc'
        }
      },
      take: 10,
    });

    const topSources = sources_breakdown.reduce((acc: Record<string, number>, item) => {
      acc[item.source] = item._count._all;
      return acc;
    }, {});

    // Get sentiment breakdown
    const sentiment_breakdown = await db.article.groupBy({
      by: ['sentiment'],
      _count: {
        _all: true
      },
      where: {
        sentiment: {
          not: null
        }
      }
    });

    const sentimentBreakdown = sentiment_breakdown.reduce((acc: Record<string, number>, item) => {
      if (item.sentiment) {
        acc[item.sentiment] = item._count._all;
      }
      return acc;
    }, {});

    // Upsert analytics
    await db.analytics.upsert({
      where: { date: today },
      update: {
        totalUsers,
        totalArticles,
        totalViews: todayViews,
        topCategories,
        topSources,
        sentimentBreakdown,
      },
      create: {
        date: today,
        totalUsers,
        totalArticles,
        totalViews: todayViews,
        topCategories,
        topSources,
        sentimentBreakdown,
      },
    });

    console.log(`Cron job completed. Processed ${totalProcessed} new articles.`);

    return NextResponse.json({ 
      success: true, 
      processed: totalProcessed,
      message: `Successfully processed ${totalProcessed} new articles`
    });
  } catch (error) {
    console.error('Cron job error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}