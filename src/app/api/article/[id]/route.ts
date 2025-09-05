// E:\newsgenie\src\app\api\article\[id]\route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Await the params promise
    const params = await context.params;
    
    const article = await db.article.findUnique({
      where: { id: params.id },
    });
    
    if (!article) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }
    
    // If user is authenticated, increment view count and mark as read
    const session = await getServerSession(authOptions);
    if (session?.user?.id) {
      // Mark article as read
      try {
        await db.readArticle.upsert({
          where: {
            userId_articleId: {
              userId: session.user.id,
              articleId: params.id,
            },
          },
          update: {
            readAt: new Date(),
          },
          create: {
            userId: session.user.id,
            articleId: params.id,
            readAt: new Date(),
          },
        });
      } catch (error) {
        console.error('Error marking article as read:', error);
        // Non-critical error, continue execution
      }
    }
    
    return NextResponse.json(article);
  } catch (error) {
    console.error('Error fetching article:', error);
    return NextResponse.json(
      { error: 'Failed to fetch article' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const params = await context.params;
    const body = await request.json();
    
    // Check if user has permission to update articles
    // For now, we'll allow any authenticated user to update articles
    // In a production app, you might want to add role-based access control
    
    const updatedArticle = await db.article.update({
      where: { id: params.id },
      data: {
        ...body,
        updatedAt: new Date(),
      },
    });
    
    return NextResponse.json(updatedArticle);
  } catch (error) {
    console.error('Error updating article:', error);
    return NextResponse.json(
      { error: 'Failed to update article' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const params = await context.params;
    
    // Check if user has permission to delete articles
    // For now, we'll allow any authenticated user to delete articles
    // In a production app, you might want to add role-based access control
    
    // First, delete related records
    await db.bookmark.deleteMany({
      where: { articleId: params.id },
    });
    
    await db.readArticle.deleteMany({
      where: { articleId: params.id },
    });
    
    await db.notification.deleteMany({
      where: { articleId: params.id },
    });
    
    // Then delete the article
    await db.article.delete({
      where: { id: params.id },
    });
    
    return NextResponse.json({ message: 'Article deleted successfully' });
  } catch (error) {
    console.error('Error deleting article:', error);
    return NextResponse.json(
      { error: 'Failed to delete article' },
      { status: 500 }
    );
  }
}

// New endpoint to handle article Q&A
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const body = await request.json();
    const { question } = body;
    
    if (!question) {
      return NextResponse.json({ error: 'Question is required' }, { status: 400 });
    }
    
    // Get the article
    const article = await db.article.findUnique({
      where: { id: params.id },
    });
    
    if (!article) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }
    
    // Import the OpenAI function dynamically to avoid circular dependencies
    const { answerQuestionAboutArticle } = await import('@/lib/openai');
    
    // Generate answer
    const answer = await answerQuestionAboutArticle(
      question,
      article.content || article.description || article.title
    );
    
    return NextResponse.json({
      answer,
      articleTitle: article.title,
    });
  } catch (error) {
    console.error('Error answering article question:', error);
    return NextResponse.json(
      { error: 'Failed to answer question' },
      { status: 500 }
    );
  }
}