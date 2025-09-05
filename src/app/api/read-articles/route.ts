import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { articleId } = await request.json();

    const user = await db.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
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
  } catch (error) {
    console.error('Mark as read error:', error);
    return NextResponse.json(
      { error: 'Failed to mark as read' },
      { status: 500 }
    );
  }
}

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

    const readArticles = await db.readArticle.findMany({
      where: { userId: user.id },
      include: { article: true },
      orderBy: { readAt: 'desc' },
      take: 50, // Limit to last 50 read articles
    });

    return NextResponse.json(readArticles);
  } catch (error) {
    console.error('Get read articles error:', error);
    return NextResponse.json(
      { error: 'Failed to get read articles' },
      { status: 500 }
    );
  }
}