import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { generateRecommendations } from '@/lib/aiAnalysis';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user preferences - CORRECTED: userPreference (singular)
    const userPreferences = await db.userPreference.findUnique({
      where: { userId: session.user.id },
    });

    if (!userPreferences) {
      return NextResponse.json({ error: 'User preferences not found' }, { status: 404 });
    }

    // Get user's reading history
    const readArticles = await db.readArticle.findMany({
      where: { userId: session.user.id },
      include: { article: true },
      orderBy: { readAt: 'desc' },
      take: 20,
    });

    // Get available articles (not read recently)
    const readArticleIds = readArticles.map(ra => ra.articleId);
    
    // Build where clause for available articles
    const whereClause: any = {
      id: {
        notIn: readArticleIds,
      },
      publishedAt: {
        gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
      },
    };

    // Add category filter if user has preferences
    if (userPreferences.categories && userPreferences.categories.length > 0) {
      whereClause.category = {
        in: userPreferences.categories,
      };
    }

    const availableArticles = await db.article.findMany({
      where: whereClause,
      orderBy: [
        { publishedAt: 'desc' }, // Primary sort by recency
        // If importance field exists in your schema, uncomment this:
        // { importance: 'desc' },
      ],
      take: 50,
    });

    if (availableArticles.length === 0) {
      return NextResponse.json([]);
    }

    // Generate AI recommendations
    const recommendedIds = await generateRecommendations(
      userPreferences,
      readArticles,
      availableArticles
    );

    // Get recommended articles in order
    const recommendations = recommendedIds
      .map(id => availableArticles.find(article => article.id === id))
      .filter(article => article !== undefined)
      .slice(0, 10);

    return NextResponse.json(recommendations);
  } catch (error) {
    console.error('Recommendations error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}