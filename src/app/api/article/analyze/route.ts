// E:\newsgenie\src\app\api\article\analyze\route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { summarizeArticle, analyzeSentiment, extractKeywords } from '@/lib/openai';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { articleId, url } = await request.json();
    
    if (!articleId || !url) {
      return NextResponse.json(
        { error: 'Article ID and URL are required' },
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
    
    // Fetch the article content from the original URL
    let content = article.content;
    let title = article.title;
    
    try {
      // In a real implementation, you would use a web scraping service
      // For this example, we'll simulate fetching additional content
      // In production, you might use services like Apify, ScrapingBee, or build your own scraper
      
      // This is a placeholder for the actual web scraping logic
      // const response = await fetch(url);
      // const html = await response.text();
      // const parsedContent = parseHtmlContent(html);
      // content = parsedContent.content;
      // title = parsedContent.title;
      
      // For now, we'll just use the existing content
      console.log(`Would fetch content from: ${url}`);
    } catch (error) {
      console.error('Error fetching article content:', error);
      // Continue with existing content
    }
    
    // Generate AI analysis
    const [summary, sentiment, keywords] = await Promise.all([
      summarizeArticle(content || article.description || title),
      analyzeSentiment(title + ' ' + (article.description || '')),
      extractKeywords(title + ' ' + (article.description || ''))
    ]);
    
    // Update the article with the analysis
    const updatedArticle = await db.article.update({
      where: { id: articleId },
      data: {
        summary,
        sentiment,
        keywords,
      },
    });
    
    return NextResponse.json({
      summary,
      sentiment,
      keywords,
      title: updatedArticle.title,
      description: updatedArticle.description,
      content: updatedArticle.content
    });
  } catch (error) {
    console.error('Error analyzing article:', error);
    return NextResponse.json(
      { error: 'Failed to analyze article' },
      { status: 500 }
    );
  }
}