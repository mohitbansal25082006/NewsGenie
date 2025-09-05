// E:\newsgenie\src\app\api\chat\article-qa\route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { answerArticleQuestion } from '@/lib/chat';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { articleId, question } = await request.json();
    
    if (!articleId || !question) {
      return NextResponse.json(
        { error: 'Article ID and question are required' },
        { status: 400 }
      );
    }
    
    const result = await answerArticleQuestion(articleId, question);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error answering article question:', error);
    return NextResponse.json(
      { error: 'Failed to answer question' },
      { status: 500 }
    );
  }
}