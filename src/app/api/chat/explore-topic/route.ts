// E:\newsgenie\src\app\api\chat\explore-topic\route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { exploreNewsTopic } from '@/lib/chat';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { topic } = await request.json();
    
    if (!topic) {
      return NextResponse.json(
        { error: 'Topic is required' },
        { status: 400 }
      );
    }
    
    const result = await exploreNewsTopic(session.user.id, topic);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error exploring topic:', error);
    return NextResponse.json(
      { error: 'Failed to explore topic' },
      { status: 500 }
    );
  }
}