// E:\newsgenie\src\app\api\article\qa\route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { articleId, question, url } =
      (await request.json()) as { articleId?: string; question?: string; url?: string };

    if (!articleId || !question) {
      return NextResponse.json(
        { error: 'Article ID and question are required' },
        { status: 400 }
      );
    }

    // Get the article from database
    const article = await db.article.findUnique({
      where: { id: articleId },
    });

    if (!article) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }

    // Prepare content for analysis
    const content = article.content || article.description || article.title || '';
    const sources: string[] = [];

    // If we have a URL, try to fetch more content (simulated here)
    if (url) {
      try {
        // In a real implementation, you would use a web scraping service
        // For this example, we'll simulate fetching additional content
        console.log(`Would fetch content from: ${url} for Q&A`);

        // Add the URL as a source
        sources.push(url);

        // In a real implementation, you would:
        // 1. Fetch the HTML content from the URL
        // 2. Extract the main article content
        // 3. Combine it with the existing content
        // 4. Use the combined content for Q&A

        // For now, we'll just use the existing content
      } catch (error) {
        console.error('Error fetching article content for Q&A:', error);
        // Continue with existing content
      }
    }

    // Import the OpenAI function dynamically to avoid circular dependencies
    const { answerQuestionAboutArticle } = await import('@/lib/openai');

    // Generate answer
    const answer = await answerQuestionAboutArticle(question, content);

    return NextResponse.json({
      answer,
      sources: sources.length > 0 ? sources : undefined,
    });
  } catch (error) {
    console.error('Error answering article question:', error);
    return NextResponse.json(
      { error: 'Failed to answer question' },
      { status: 500 }
    );
  }
}
