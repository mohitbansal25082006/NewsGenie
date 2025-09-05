import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { subDays, format } from 'date-fns';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get reading stats for last 7 days
    const sevenDaysAgo = subDays(new Date(), 7);
    
    // Get daily reading counts
    const readArticles = await db.readArticle.findMany({
      where: {
        userId: user.id,
        readAt: {
          gte: sevenDaysAgo,
        },
      },
      include: {
        article: true,
      },
      orderBy: {
        readAt: 'desc',
      },
    });

    // Group by date for reading stats
    const readingStatsMap = new Map<string, number>();
    const categoryDistribution = new Map<string, number>();
    const sentimentDistribution = new Map<string, number>();

    readArticles.forEach((item) => {
      const date = format(item.readAt, 'yyyy-MM-dd');
      readingStatsMap.set(date, (readingStatsMap.get(date) || 0) + 1);
      
      const category = item.article.category || 'general';
      categoryDistribution.set(category, (categoryDistribution.get(category) || 0) + 1);
      
      const sentiment = item.article.sentiment || 'neutral';
      sentimentDistribution.set(sentiment, (sentimentDistribution.get(sentiment) || 0) + 1);
    });

    // Convert maps to arrays
    const readingStats = Array.from(readingStatsMap.entries()).map(([date, count]) => ({
      date,
      count,
    }));

    const categoryData = Object.fromEntries(categoryDistribution);
    const sentimentData = Object.fromEntries(sentimentDistribution);

    // Get total counts
    const totalRead = await db.readArticle.count({
      where: { userId: user.id },
    });

    const totalBookmarks = await db.bookmark.count({
      where: { userId: user.id },
    });

    const todayRead = await db.readArticle.count({
      where: {
        userId: user.id,
        readAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
        },
      },
    });

    return NextResponse.json({
      readingStats,
      categoryDistribution: categoryData,
      sentimentDistribution: sentimentData,
      totalRead,
      totalBookmarks,
      todayRead,
    });

  } catch (error) {
    console.error('Analytics error:', error);
    return NextResponse.json(
      { error: 'Failed to get analytics' },
      { status: 500 }
    );
  }
}