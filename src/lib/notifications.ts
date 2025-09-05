// E:\newsgenie\src\lib\notifications.ts
import { prisma } from "./db";

export interface NotificationData {
  userId: string;
  title: string;
  message: string;
  type: 'breaking_news' | 'new_article' | 'digest' | 'system';
  articleId?: string;
}

// Define Article interface based on your Prisma schema
export interface Article {
  id: string;
  title: string;
  category: string;
  country?: string | null;
  // Add other article properties as needed
}

export async function createNotification(data: NotificationData) {
  try {
    const notification = await prisma.notification.create({
      data: {
        userId: data.userId,
        title: data.title,
        message: data.message,
        type: data.type,
        articleId: data.articleId,
      },
    });
    return notification;
  } catch (error) {
    console.error("Error creating notification:", error);
    throw error;
  }
}

// Function to send breaking news notification to users who have enabled it
export async function sendBreakingNewsNotification(article: Article) {
  try {
    // Get users who have enabled breaking news notifications
    const users = await prisma.userPreference.findMany({
      where: {
        notifyBreakingNews: true,
      },
      include: {
        user: true,
      },
    });

    for (const userPref of users) {
      // Check if the article matches the user's interests or country
      const matchesInterest = userPref.interests.includes(article.category);
      const matchesCountry = userPref.country === article.country;
      
      if (matchesInterest || matchesCountry) {
        await createNotification({
          userId: userPref.userId,
          title: "Breaking News",
          message: article.title,
          type: "breaking_news",
          articleId: article.id,
        });
      }
    }
  } catch (error) {
    console.error("Error sending breaking news notifications:", error);
  }
}

// Function to send new article notification to users who have enabled it
export async function sendNewArticleNotification(article: Article) {
  try {
    // Get users who have enabled new article notifications
    const users = await prisma.userPreference.findMany({
      where: {
        notifyNewArticles: true,
      },
      include: {
        user: true,
      },
    });

    for (const userPref of users) {
      // Check if the article matches the user's interests or country
      const matchesInterest = userPref.interests.includes(article.category);
      const matchesCountry = userPref.country === article.country;
      
      if (matchesInterest || matchesCountry) {
        await createNotification({
          userId: userPref.userId,
          title: "New Article",
          message: article.title,
          type: "new_article",
          articleId: article.id,
        });
      }
    }
  } catch (error) {
    console.error("Error sending new article notifications:", error);
  }
}

// Function to send daily digest notifications
export async function sendDailyDigestNotification(userId: string, articles: Article[]) {
  try {
    const userPref = await prisma.userPreference.findUnique({
      where: { userId },
    });

    if (!userPref?.notifyDigest) return;

    const articleTitles = articles.slice(0, 5).map(a => a.title).join('; ');
    
    await createNotification({
      userId,
      title: "Daily News Digest",
      message: `Top stories for today: ${articleTitles}`,
      type: "digest",
    });
  } catch (error) {
    console.error("Error sending daily digest notification:", error);
  }
}