// E:\newsgenie\src\app\api\chat\personalized-briefing\route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { generatePersonalizedBriefing } from '@/lib/openai';
import { NewsAPI } from '@/lib/newsApi';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user preferences
    const user = await db.user.findUnique({
      where: {
        id: session.user.id,
      },
      include: {
        userPreference: true,
      },
    });

    if (!user || !user.userPreference) {
      return NextResponse.json({ error: 'User preferences not found' }, { status: 404 });
    }

    // Get the latest articles based on user preferences
    const newsApi = new NewsAPI();
    
    // Fetch articles from multiple categories if user has interests
    const categories = user.userPreference.interests.length > 0 
      ? user.userPreference.interests.slice(0, 3) // Limit to top 3 interests
      : ['general', 'business', 'technology']; // Default categories

    const allArticles: any[] = [];
    
    // Fetch articles for each category
    for (const category of categories) {
      try {
        const response = await newsApi.getTopHeadlines({
          category,
          country: user.userPreference.country,
          pageSize: 5, // Get 5 articles per category
        });
        
        if (response.status === 'ok' && response.articles) {
          // Process and add articles
          const processedArticles = response.articles.map((article: any) => ({
            title: article.title,
            description: article.description,
            content: article.content,
            url: article.url,
            publishedAt: article.publishedAt,
            source: article.source.name,
            category: category,
          }));
          
          allArticles.push(...processedArticles);
        }
      } catch (error) {
        console.error(`Error fetching articles for category ${category}:`, error);
      }
    }

    // If we don't have enough articles from categories, try fetching everything with a query
    if (allArticles.length < 10) {
      try {
        const query = user.userPreference.interests.length > 0 
          ? user.userPreference.interests.join(' OR ') 
          : 'latest news';
        
        const response = await newsApi.getEverything({
          q: query,
          language: user.userPreference.language,
          sortBy: 'publishedAt',
          pageSize: 20,
        });
        
        if (response.status === 'ok' && response.articles) {
          const processedArticles = response.articles.map((article: any) => ({
            title: article.title,
            description: article.description,
            content: article.content,
            url: article.url,
            publishedAt: article.publishedAt,
            source: article.source.name,
            category: 'general', // Default category for everything query
          }));
          
          // Add only unique articles
          for (const article of processedArticles) {
            if (!allArticles.some(a => a.url === article.url)) {
              allArticles.push(article);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching everything articles:', error);
      }
    }

    // Sort all articles by published date (newest first) and take the latest 15
    const latestArticles = allArticles
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
      .slice(0, 15);

    // Format articles for the AI
    const formattedArticles = latestArticles.map(article => ({
      title: article.title,
      summary: article.description || article.content?.substring(0, 200) || '',
      category: article.category,
      publishedAt: article.publishedAt,
    }));

    // Generate briefing
    const briefing = await generatePersonalizedBriefing(
      {
        interests: user.userPreference.interests,
        country: user.userPreference.country,
        language: user.userPreference.language,
      },
      formattedArticles
    );

    return NextResponse.json({
      briefing,
      articlesCount: latestArticles.length,
      latestArticleDate: latestArticles[0]?.publishedAt || null,
    });
  } catch (error) {
    console.error('Error creating personalized briefing:', error);
    return NextResponse.json(
      { error: 'Failed to create personalized briefing' },
      { status: 500 }
    );
  }
}