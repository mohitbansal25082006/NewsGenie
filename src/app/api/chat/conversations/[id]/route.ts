// E:\newsgenie\src\app\api\chat\conversations\[id]\route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getConversation, generateAndSaveResponse } from '@/lib/chat';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Await the params before using them
    const { id } = await params;
    const conversation = await getConversation(id, session.user.id);
    
    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }
    
    return NextResponse.json(conversation);
  } catch (error) {
    console.error('Error getting conversation:', error);
    return NextResponse.json(
      { error: 'Failed to get conversation' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { message, articleIds } = await request.json();
    
    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }
    
    // Await the params before using them
    const { id } = await params;
    const result = await generateAndSaveResponse(
      id,
      message,
      session.user.id,
      articleIds || []
    );
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error generating response:', error);
    return NextResponse.json(
      { error: 'Failed to generate response' },
      { status: 500 }
    );
  }
}