// E:\newsgenie\src\app\api\preferences\route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const user = await db.user.findUnique({
      where: { email: session.user.email },
      include: { userPreference: true },
    });
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    if (!user.userPreference) {
      const defaultPreferences = await db.userPreference.create({
        data: {
          userId: user.id,
          interests: ['general'],
          sources: [],
          country: 'us',
          language: 'en',
          emailNotifications: false,
          articlesPerDay: 20,
          notifyBreakingNews: true,
          notifyNewArticles: true,
          notifyDigest: false,
          digestTime: '08:00',
        },
      });
      return NextResponse.json(defaultPreferences);
    }
    
    return NextResponse.json(user.userPreference);
  } catch (error) {
    console.error('Get preferences error:', error);
    return NextResponse.json(
      { error: 'Failed to get preferences' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const data = await request.json();
    const user = await db.user.findUnique({
      where: { email: session.user.email },
    });
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    const preferences = await db.userPreference.upsert({
      where: { userId: user.id },
      update: {
        interests: data.interests || [],
        sources: data.sources || [],
        country: data.country || 'us',
        language: data.language || 'en',
        emailNotifications: data.emailNotifications ?? false,
        articlesPerDay: data.articlesPerDay ?? 20,
        notifyBreakingNews: data.notifyBreakingNews ?? true,
        notifyNewArticles: data.notifyNewArticles ?? true,
        notifyDigest: data.notifyDigest ?? false,
        digestTime: data.digestTime || '08:00',
      },
      create: {
        userId: user.id,
        interests: data.interests || ['general'],
        sources: data.sources || [],
        country: data.country || 'us',
        language: data.language || 'en',
        emailNotifications: data.emailNotifications ?? false,
        articlesPerDay: data.articlesPerDay ?? 20,
        notifyBreakingNews: data.notifyBreakingNews ?? true,
        notifyNewArticles: data.notifyNewArticles ?? true,
        notifyDigest: data.notifyDigest ?? false,
        digestTime: data.digestTime || '08:00',
      },
    });
    
    return NextResponse.json(preferences);
  } catch (error) {
    console.error('Update preferences error:', error);
    return NextResponse.json(
      { error: 'Failed to update preferences' },
      { status: 500 }
    );
  }
}