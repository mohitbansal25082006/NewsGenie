// E:\newsgenie\src\app\api\chat\personalized-briefing\route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createPersonalizedBriefing } from '@/lib/chat';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const result = await createPersonalizedBriefing(session.user.id);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error creating personalized briefing:', error);
    return NextResponse.json(
      { error: 'Failed to create personalized briefing' },
      { status: 500 }
    );
  }
}