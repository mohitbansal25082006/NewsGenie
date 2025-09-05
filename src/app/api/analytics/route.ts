import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    // Get basic counts
    const totalRead = await db.readArticle.count({
      where: { userId },
    });

    const totalBookmarks = await db.bookmark.count({
      where: { userId },
    });

    // Get reading streak (consecutive days with reading activity)
    const readDates = await db.readArticle.findMany({
      where: { userId },
      select: { readAt: true },
      orderBy: { readAt: 'desc' },
    });

    let readingStreak = 0;
    if (readDates.length > 0) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const uniqueDates = [...new Set(readDates.map(r => {
        const date = new Date(r.readAt);
        date.setHours(0, 0, 0, 0);
        return date.getTime();
      }))].sort((a, b) => b - a);

      let currentDate = today.getTime();
      for (const dateTime of uniqueDates) {
        if (dateTime === currentDate || dateTime === currentDate - 86400000) {
          readingStreak++;
          currentDate = dateTime - 86400000;
        } else {
          break;
        }
      }
    }

    // Get average reading time
    const readArticles = await db.readArticle.findMany({
      where: { userId, readTime: { not: null } },
      select: { readTime: true },
    });

    const avgReadingTime = readArticles.length > 0 
      ? Math.round(readArticles.reduce((acc, r) => acc + (r.readTime || 0), 0) / readArticles.length / 60)
      : 0;

    // Get category breakdown
    const categoryStats = await db.readArticle.findMany({
      where: { userId },
      include: { article: { select: { category: true } } },
    });

    const categoryCounts = categoryStats.reduce((acc: any, r) => {
      const category = r.article.category;
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {});

    const categoryBreakdown = Object.entries(categoryCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => (b.value as number) - (a.value as number));

    const favoriteCategory = categoryBreakdown[0]?.name || 'None';

    // Get reading trend (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const dailyReads = await db.readArticle.findMany({
      where: {
        userId,
        readAt: { gte: thirtyDaysAgo },
      },
      select: { readAt: true },
    });

    const readingTrend = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      const nextDay = new Date(date);
      nextDay.setDate(nextDay.getDate() + 1);
      
      const articles = dailyReads.filter(r => {
        const readDate = new Date(r.readAt);
        return readDate >= date && readDate < nextDay;
      }).length;

      readingTrend.push({
        date: date.toISOString().split('T')[0],
        articles,
      });
    }

    // Get top topics
    const topicStats = await db.readArticle.findMany({
      where: { userId },
      include: { article: { select: { topics: true } } },
    });

    const topicCounts = topicStats.reduce((acc: any, r) => {
      r.article.topics?.forEach(topic => {
        acc[topic] = (acc[topic] || 0) + 1;
      });
      return acc;
    }, {});

    const topTopics = Object.entries(topicCounts)
      .sort(([,a], [,b]) => (b as number) - (a as number))
      .slice(0, 10)
      .map(([name, count]) => ({ name, count }));

    // Get sentiment breakdown
    const sentimentStats = await db.readArticle.findMany({
      where: { userId },
      include: { article: { select: { sentiment: true } } },
    });

    const sentimentCounts = sentimentStats.reduce((acc: any, r) => {
      const sentiment = r.article.sentiment || 'neutral';
      acc[sentiment] = (acc[sentiment] || 0) + 1;
      return acc;
    }, {});

    const sentimentBreakdown = Object.entries(sentimentCounts)
      .map(([sentiment, count]) => ({ sentiment, count }));

    // Get weekly activity
    const weeklyActivity = [];
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    for (let i = 0; i < 7; i++) {
      const dayReads = dailyReads.filter(r => new Date(r.readAt).getDay() === i);
      weeklyActivity.push({
        day: days[i],
        articles: dayReads.length,
      });
    }

    return NextResponse.json({
      totalRead,
      totalBookmarks,
      readingStreak,
      avgReadingTime,
      favoriteCategory,
      categoryBreakdown,
      readingTrend,
      topTopics,
      sentimentBreakdown,
      weeklyActivity,
    });
  } catch (error) {
    console.error('Analytics error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}