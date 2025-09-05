// E:\newsgenie\src\app\api\article\qa\route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { answerQuestionAboutArticleWithWebScraping } from '@/lib/openai';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { articleId, question, url } = await request.json();
    
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
    let content = article.content || article.description || article.title;
    let sources: string[] = [];
    
    // If we have a URL, try to fetch more content
    if (url) {
      try {
        // Add the URL as a source
        sources.push(url);
        
        // In a real implementation, you would fetch and parse the article content
        // For now, we'll just use the existing content
        console.log(`Would fetch content from: ${url} for Q&A`);
      } catch (error) {
        console.error('Error fetching article content for Q&A:', error);
        // Continue with existing content
      }
    }
    
    // Generate answer using the enhanced function
    const { answer, sources: answerSources } = await answerQuestionAboutArticleWithWebScraping(
      question,
      content,
      url
    );
    
    // Combine the sources
    const allSources = [...sources];
    if (answerSources && answerSources.length > 0) {
      answerSources.forEach(source => {
        if (!allSources.includes(source)) {
          allSources.push(source);
        }
      });
    }
    
    return NextResponse.json({
      answer,
      sources: allSources.length > 0 ? allSources : undefined
    });
  } catch (error) {
    console.error('Error answering article question:', error);
    return NextResponse.json(
      { error: 'Failed to answer question' },
      { status: 500 }
    );
  }
}