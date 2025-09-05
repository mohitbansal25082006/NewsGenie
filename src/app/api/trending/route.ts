import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { analyzeTrendingTopics } from '@/lib/aiAnalysis';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get trending topics from the last 24 hours
    const trendingTopics = await db.trendingTopic.findMany({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
        },
      },
      orderBy: {
        score: 'desc',
      },
      take: 20,
      include: {
        articles: {
          take: 3,
          orderBy: {
            publishedAt: 'desc',
          },
          select: {
            id: true,
            title: true,
            description: true,
            url: true,
            urlToImage: true,
            source: true,
            publishedAt: true,
          },
        },
      },
    });

    return NextResponse.json(trendingTopics);
  } catch (error) {
    console.error('Trending topics error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get recent articles for trending analysis
    const articles = await db.article.findMany({
      where: {
        publishedAt: {
          gte: new Date(Date.now() - 6 * 60 * 60 * 1000), // Last 6 hours
        },
      },
      orderBy: {
        publishedAt: 'desc',
      },
      take: 100,
      select: {
        id: true,
        title: true,
        content: true,
        description: true,
        keywords: true,
        topics: true,
        category: true,
        publishedAt: true,
      },
    });

    if (articles.length === 0) {
      return NextResponse.json({ message: 'No recent articles for analysis' });
    }

    // Analyze trending topics with AI
    const trendingAnalysis = await analyzeTrendingTopics(articles);

    // Store trending topics in database
    const createdTopics = await Promise.all(
      trendingAnalysis.map(async (topic: any) => {
        return await db.trendingTopic.upsert({
          where: {
            topic_category: {
              topic: topic.topic,
              category: topic.category,
            },
          },
          update: {
            score: topic.score,
            mentions: {
              increment: topic.mentions || 1,
            },
            sentiment: topic.sentiment,
            updatedAt: new Date(),
          },
          create: {
            topic: topic.topic,
            score: topic.score,
            category: topic.category,
            mentions: topic.mentions || 1,
            sentiment: topic.sentiment,
          },
        });
      })
    );

    return NextResponse.json({ 
      message: 'Trending topics analyzed',
      topics: createdTopics.length 
    });
  } catch (error) {
    console.error('Trending analysis error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}