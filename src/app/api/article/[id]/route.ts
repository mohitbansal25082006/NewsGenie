// E:\newsgenie\src\app\api\article\[id]\route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { extractArticleContentFromUrl } from '@/lib/openai';

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
    
    // Check if content is truncated (indicated by "[+")
    const isTruncated = article.content && article.content.includes('[+');
    
    // If content is truncated and we have a URL, try to fetch full content
    if (isTruncated && article.url) {
      try {
        const extractedContent = await extractArticleContentFromUrl(article.url);
        if (extractedContent.content) {
          // Update the article with full content
          const updatedArticle = await db.article.update({
            where: { id: params.id },
            data: {
              content: extractedContent.content,
              author: extractedContent.author || article.author,
              publishedAt: extractedContent.publishDate ? new Date(extractedContent.publishDate) : article.publishedAt,
            },
          });
          
          // Use the updated article for the response
          article.content = updatedArticle.content;
          article.author = updatedArticle.author;
          article.publishedAt = updatedArticle.publishedAt;
        }
      } catch (error) {
        console.error('Error extracting full article content:', error);
        // Continue with truncated content if extraction fails
      }
    }
    
    // If user is authenticated, mark as read
    const session = await getServerSession(authOptions);
    if (session?.user?.id) {
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

// New endpoint to handle article Q&A and fetching full content
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const url = new URL(request.url);
    const action = url.searchParams.get('action');
    
    // Handle fetch-full action
    if (action === 'fetch-full') {
      const article = await db.article.findUnique({
        where: { id: params.id },
      });
      
      if (!article) {
        return NextResponse.json({ error: 'Article not found' }, { status: 404 });
      }
      
      if (!article.url) {
        return NextResponse.json({ error: 'Article URL not available' }, { status: 400 });
      }
      
      try {
        const extractedContent = await extractArticleContentFromUrl(article.url);
        if (extractedContent.content) {
          // Update the article with full content
          const updatedArticle = await db.article.update({
            where: { id: params.id },
            data: {
              content: extractedContent.content,
              author: extractedContent.author || article.author,
              publishedAt: extractedContent.publishDate ? new Date(extractedContent.publishDate) : article.publishedAt,
            },
          });
          
          return NextResponse.json(updatedArticle);
        } else {
          return NextResponse.json({ error: 'Failed to extract content' }, { status: 500 });
        }
      } catch (error) {
        console.error('Error extracting full article content:', error);
        return NextResponse.json(
          { error: 'Failed to extract article content' },
          { status: 500 }
        );
      }
    }
    
    // Handle Q&A action (default)
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
    console.error('Error in POST request:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}