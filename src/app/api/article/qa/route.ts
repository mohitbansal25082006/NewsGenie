import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { answerQuestionAboutArticleWithWebScraping, extractArticleContentFromUrl } from '@/lib/openai';

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
    let content = article.content || article.description || article.title || '';
    const sources: string[] = [];

    // If we have a URL, try to fetch more content
    if (url) {
      try {
        // Check if the article content is truncated
        const isTruncated = content.includes('[+');
        
        if (isTruncated) {
          // Try to extract full content from URL
          const extractedContent = await extractArticleContentFromUrl(url);
          if (extractedContent.content) {
            content = extractedContent.content;
            // Update the article in the database with full content
            await db.article.update({
              where: { id: articleId },
              data: {
                content: extractedContent.content,
                author: extractedContent.author || article.author,
                publishedAt: extractedContent.publishDate ? new Date(extractedContent.publishDate) : article.publishedAt,
              },
            });
          }
        }
        
        // Add the URL as a source
        sources.push(url);
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
    if (Array.isArray(answerSources) && answerSources.length > 0) {
      for (const s of answerSources) {
        if (!allSources.includes(s)) allSources.push(s);
      }
    }

    return NextResponse.json({
      answer,
      sources: allSources.length > 0 ? allSources : undefined,
    });
  } catch (error) {
    console.error('Error answering article question:', error);
    return NextResponse.json(
      { error: 'Failed to answer question' },
      { status: 500 }
    );
  }
}