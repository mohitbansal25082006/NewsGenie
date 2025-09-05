// E:\newsgenie\src\app\api\article\[id]\related\route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import type { Article } from '@prisma/client';

type Params = { id: string };

export async function GET(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    const resolvedParams = params;

    // Fetch current article
    const currentArticle = await db.article.findUnique({
      where: { id: resolvedParams.id },
    });

    if (!currentArticle) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }

    // Request query params
    const url = new URL(request.url);
    const searchParams = url.searchParams;
    const limitRaw = parseInt(searchParams.get('limit') || '5', 10);
    const limit = Number.isFinite(limitRaw) && limitRaw > 0 ? Math.min(limitRaw, 50) : 5;
    const strategy = (searchParams.get('strategy') || 'combined') as
      | 'category'
      | 'keywords'
      | 'sentiment'
      | 'combined';

    // Helper to add unique articles by id
    const addUnique = (target: Article[], items: Article[]) => {
      for (const item of items) {
        if (!target.some(a => a.id === item.id)) {
          target.push(item);
        }
      }
    };

    // Ensure types for keywords
    const currentKeywords = (currentArticle.keywords ?? []) as string[];

    // Accumulate related articles (explicitly typed)
    let relatedArticles: Article[] = [];

    if (strategy === 'category' || strategy === 'combined') {
      const categoryMatches = await db.article.findMany({
        where: {
          category: currentArticle.category,
          id: { not: currentArticle.id },
        },
        orderBy: { publishedAt: 'desc' },
        take: limit,
      });

      relatedArticles = [...relatedArticles, ...categoryMatches];
    }

    if ((strategy === 'keywords' || strategy === 'combined') && currentKeywords.length > 0) {
      const keywordMatches = await db.article.findMany({
        where: {
          id: { not: currentArticle.id },
          // Prisma `hasSome` expects an array; compare against some keywords (limit to 2 for performance)
          keywords: {
            hasSome: currentKeywords.slice(0, 2),
          },
        },
        orderBy: { publishedAt: 'desc' },
        take: limit,
      });

      addUnique(relatedArticles, keywordMatches);
    }

    if ((strategy === 'sentiment' || strategy === 'combined') && currentArticle.sentiment) {
      const sentimentMatches = await db.article.findMany({
        where: {
          id: { not: currentArticle.id },
          sentiment: currentArticle.sentiment,
        },
        orderBy: { publishedAt: 'desc' },
        take: limit,
      });

      addUnique(relatedArticles, sentimentMatches);
    }

    // Fallbacks if we don't have enough
    if (relatedArticles.length < 3) {
      const sourceMatches = await db.article.findMany({
        where: {
          id: { not: currentArticle.id },
          source: currentArticle.source,
        },
        orderBy: { publishedAt: 'desc' },
        take: limit,
      });

      addUnique(relatedArticles, sourceMatches);
    }

    if (relatedArticles.length < 3) {
      const countryMatches = await db.article.findMany({
        where: {
          id: { not: currentArticle.id },
          country: currentArticle.country,
        },
        orderBy: { publishedAt: 'desc' },
        take: limit,
      });

      addUnique(relatedArticles, countryMatches);
    }

    // Score & sort
    const scoredArticles = relatedArticles.map(article => {
      let score = 0;

      if (article.category === currentArticle.category) score += 5;

      // keyword matching (ensure both sides are arrays)
      const articleKeywords = (article.keywords ?? []) as string[];
      if (articleKeywords.length > 0 && currentKeywords.length > 0) {
        const commonKeywords = articleKeywords.filter((keyword: string) =>
          currentKeywords.includes(keyword)
        );
        score += commonKeywords.length * 2;
      }

      if (article.sentiment === currentArticle.sentiment) score += 3;
      if (article.source === currentArticle.source) score += 2;
      if (article.country === currentArticle.country) score += 1;

      // recency boost (article.publishedAt may be string or Date)
      const published = new Date(article.publishedAt);
      const daysDiff =
        Math.abs(Date.now() - published.getTime()) / (1000 * 60 * 60 * 24);
      const recencyBoost = Math.max(0, 1 - daysDiff / 30);
      score += recencyBoost;

      return {
        article,
        relevanceScore: score,
      };
    });

    const finalArticles = scoredArticles
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, limit)
      .map(item => item.article);

    return NextResponse.json({
      articles: finalArticles,
      strategy,
      total: finalArticles.length,
    });
  } catch (error) {
    console.error('Error fetching related articles:', error);
    return NextResponse.json(
      { error: 'Failed to fetch related articles' },
      { status: 500 }
    );
  }
}
