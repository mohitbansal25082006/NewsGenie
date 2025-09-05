// E:\newsgenie\src\app\api\article\[id]\related\route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // First, get the current article to find related ones
    const currentArticle = await db.article.findUnique({
      where: { id: params.id },
    });

    if (!currentArticle) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }

    // Find related articles based on:
    // 1. Same category
    // 2. Similar keywords
    // 3. Same sentiment

    // Get articles with the same category, excluding the current article
    const relatedByCategory = await db.article.findMany({
      where: {
        category: currentArticle.category,
        id: { not: currentArticle.id },
      },
      orderBy: {
        publishedAt: 'desc',
      },
      take: 5,
    });

    // If we don't have enough articles from the same category, try to find articles with similar keywords
    if (relatedByCategory.length < 3 && currentArticle.keywords && currentArticle.keywords.length > 0) {
      // Find articles that have at least one matching keyword
      const keywordMatches = await db.article.findMany({
        where: {
          id: { not: currentArticle.id },
          keywords: {
            hasSome: currentArticle.keywords.slice(0, 2), // Check against first 2 keywords
          },
        },
        orderBy: {
          publishedAt: 'desc',
        },
        take: 5,
      });

      // Combine results, avoiding duplicates
      const allRelated = [...relatedByCategory];
      for (const article of keywordMatches) {
        if (!allRelated.some(a => a.id === article.id)) {
          allRelated.push(article);
        }
      }

      // If we still don't have enough, get articles with the same sentiment
      if (allRelated.length < 3 && currentArticle.sentiment) {
        const sentimentMatches = await db.article.findMany({
          where: {
            id: { not: currentArticle.id },
            sentiment: currentArticle.sentiment,
          },
          orderBy: {
            publishedAt: 'desc',
          },
          take: 5,
        });

        for (const article of sentimentMatches) {
          if (!allRelated.some(a => a.id === article.id)) {
            allRelated.push(article);
          }
        }
      }

      // Limit to 5 articles
      return NextResponse.json({ articles: allRelated.slice(0, 5) });
    }

    return NextResponse.json({ articles: relatedByCategory });
  } catch (error) {
    console.error('Error fetching related articles:', error);
    return NextResponse.json(
      { error: 'Failed to fetch related articles' },
      { status: 500 }
    );
  }
}