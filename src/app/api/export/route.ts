import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { exportToPDF, exportToCSV, exportAnalytics } from '@/lib/export';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { type, format } = await request.json();

    if (type === 'bookmarks') {
      const bookmarks = await db.bookmark.findMany({
        where: { userId: session.user.id },
        include: { article: true },
        orderBy: { createdAt: 'desc' },
      });

      const articles = bookmarks.map(b => b.article);

      if (format === 'pdf') {
        const pdf = await exportToPDF(articles, session.user);
        const pdfBuffer = Buffer.from(pdf.output('arraybuffer'));
        
        return new NextResponse(pdfBuffer, {
          headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': 'attachment; filename="bookmarks.pdf"',
          },
        });
      } else if (format === 'csv') {
        const csvContent = exportToCSV(articles);
        
        return new NextResponse(csvContent, {
          headers: {
            'Content-Type': 'text/csv',
            'Content-Disposition': 'attachment; filename="bookmarks.csv"',
          },
        });
      }
    } else if (type === 'analytics') {
      // Get user analytics data
      const totalRead = await db.readArticle.count({
        where: { userId: session.user.id },
      });
      
      const totalBookmarks = await db.bookmark.count({
        where: { userId: session.user.id },
      });

      const readArticles = await db.readArticle.findMany({
        where: { userId: session.user.id },
        include: { article: true },
      });

      // Calculate favorite category
      const categoryCounts = readArticles.reduce((acc: any, ra) => {
        const category = ra.article.category;
        acc[category] = (acc[category] || 0) + 1;
        return acc;
      }, {});

      const favoriteCategory = Object.entries(categoryCounts)
        .sort(([,a], [,b]) => (b as number) - (a as number))[0]?.[0] || 'None';

      // Calculate average reading time
      const totalReadingTime = readArticles.reduce((acc, ra) => acc + (ra.readTime || 0), 0);
      const avgReadingTime = readArticles.length > 0 ? 
        Math.round(totalReadingTime / readArticles.length / 60) : 0;

      // Get top topics
      const topicCounts = readArticles.reduce((acc: any, ra) => {
        ra.article.topics?.forEach(topic => {
          acc[topic] = (acc[topic] || 0) + 1;
        });
        return acc;
      }, {});

      const topTopics = Object.entries(topicCounts)
        .sort(([,a], [,b]) => (b as number) - (a as number))
        .slice(0, 10)
        .map(([name, count]) => ({ name, count }));

      const analyticsData = {
        totalRead,
        totalBookmarks,
        favoriteCategory,
        avgReadingTime,
        topTopics,
      };

      const pdf = await exportAnalytics(analyticsData);
      const pdfBuffer = Buffer.from(pdf.output('arraybuffer'));
      
      return new NextResponse(pdfBuffer, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': 'attachment; filename="analytics.pdf"',
        },
      });
    }

    return NextResponse.json({ error: 'Invalid export type' }, { status: 400 });
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}