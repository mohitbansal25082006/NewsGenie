// E:\newsgenie\src\app\api\read-articles\route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

type ParsedBody = { articleId?: string; id?: string };

/**
 * Robust helper to parse request body with fallbacks:
 * 1) request.json()
 * 2) request.text() + JSON.parse
 * 3) parse URLSearchParams (form-encoded)
 */
async function parseRequestBody(request: Request): Promise<ParsedBody> {
  // Fast check for common content-type header
  const contentType = request.headers.get('content-type') ?? '';

  // Try request.json() first (normal case)
  try {
    // Annotate as unknown to avoid implicit `any`
    const json = (await request.json()) as unknown;
    if (json && typeof json === 'object') {
      return json as ParsedBody;
    }
  } catch {
    // fall through to alternative parsing
  }

  // Some clients don't set content-type correctly; try json() again safely
  try {
    const maybeJson = await request.json().catch(() => null) as unknown | null;
    if (maybeJson && typeof maybeJson === 'object') {
      return maybeJson as ParsedBody;
    }
  } catch {
    // ignore and fall through
  }

  // Fallback: try reading as text and parsing
  try {
    const text = await request.text();
    if (!text) return {};

    // Try parse as JSON string
    try {
      const parsed = JSON.parse(text) as unknown;
      if (parsed && typeof parsed === 'object') return parsed as ParsedBody;
    } catch {
      // Not JSON — try URLSearchParams (form-encoded)
      try {
        const params = new URLSearchParams(text);
        if (params.has('articleId')) {
          return { articleId: params.get('articleId') ?? undefined };
        }
        if (params.has('id')) {
          return { id: params.get('id') ?? undefined };
        }
      } catch {
        // ignore
      }
    }
  } catch {
    // ignore
  }

  // As last attempt, return empty object
  return {};
}

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await parseRequestBody(request);

    // Accept both `articleId` or `id`
    const articleIdRaw = body.articleId ?? body.id;

    if (!articleIdRaw || typeof articleIdRaw !== 'string') {
      return NextResponse.json(
        { error: 'Invalid request body. `articleId` is required and must be a string.' },
        { status: 400 }
      );
    }

    const articleId = articleIdRaw.trim();
    if (!articleId) {
      return NextResponse.json({ error: 'articleId cannot be empty' }, { status: 400 });
    }

    // Ensure user exists
    const user = await db.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Ensure article exists
    const article = await db.article.findUnique({
      where: { id: articleId },
      select: { id: true },
    });

    if (!article) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }

    // Check if already read
    const existingRead = await db.readArticle.findUnique({
      where: {
        userId_articleId: {
          userId: user.id,
          articleId,
        },
      },
    });

    if (existingRead) {
      return NextResponse.json({ message: 'Already marked as read' });
    }

    const readArticle = await db.readArticle.create({
      data: {
        userId: user.id,
        articleId,
      },
    });

    return NextResponse.json(readArticle);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Mark as read error:', error.message);
    } else {
      console.error('Mark as read unknown error:', error);
    }
    return NextResponse.json({ error: 'Failed to mark as read' }, { status: 500 });
  }
}

export async function GET(): Promise<NextResponse> {
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

    const readArticles = await db.readArticle.findMany({
      where: { userId: user.id },
      include: { article: true },
      orderBy: { readAt: 'desc' },
      take: 50, // Limit to last 50 read articles
    });

    return NextResponse.json(readArticles);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Get read articles error:', error.message);
    } else {
      console.error('Get read articles unknown error:', error);
    }
    return NextResponse.json({ error: 'Failed to get read articles' }, { status: 500 });
  }
}
