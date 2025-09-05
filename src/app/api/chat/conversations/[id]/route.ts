// E:\newsgenie\src\app\api\chat\conversations\[id]\route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getConversation, generateAndSaveResponse } from '@/lib/chat';
import { NewsAPI } from '@/lib/newsApi';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await params;
    const conversation = await getConversation(resolvedParams.id, session.user.id);
    
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

    const resolvedParams = await params;
    const { message, prioritizeLatest } = await request.json();
    
    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }
    
    // Always fetch the latest news to provide up-to-date information
    let latestNewsContext = '';
    try {
      const newsApi = new NewsAPI();
      
      // First try to get headlines with the query from the user message
      const queryTerms = extractSearchTerms(message);
      
      if (queryTerms.length > 0) {
        // Try to find news related to the user's query
        const searchResponse = await newsApi.getEverything({
          q: queryTerms.join(' OR '),
          language: 'en',
          sortBy: 'publishedAt',
          pageSize: 5,
        });
        
        if (searchResponse.status === 'ok' && searchResponse.articles && searchResponse.articles.length > 0) {
          latestNewsContext = '\n\nLatest News Related to Your Query:\n' + 
            searchResponse.articles.slice(0, 5).map((article, index) => 
              `${index + 1}. ${article.title} (${article.source.name}, ${formatDate(article.publishedAt)})`
            ).join('\n');
        }
      }
      
      // If no specific results or as a fallback, get general top headlines
      if (!latestNewsContext) {
        const headlinesResponse = await newsApi.getTopHeadlines({
          country: 'us',
          pageSize: 10,
        });
        
        if (headlinesResponse.status === 'ok' && headlinesResponse.articles) {
          latestNewsContext = '\n\nLatest News Headlines:\n' + 
            headlinesResponse.articles.slice(0, 8).map((article, index) => 
              `${index + 1}. ${article.title} (${article.source.name}, ${formatDate(article.publishedAt)})`
            ).join('\n');
        }
      }
    } catch (error) {
      console.error('Error fetching latest news for context:', error);
    }
    
    const result = await generateAndSaveResponse(
      resolvedParams.id,
      message + latestNewsContext,
      session.user.id
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

// Helper function to extract potential search terms from user message
function extractSearchTerms(message: string): string[] {
  // Simple extraction of proper nouns and important terms
  // This is a basic implementation - in production, you might want to use NLP
  const terms: string[] = [];
  
  // Common news topics and people to look for
  const newsKeywords = [
    'modi', 'pm modi', 'narendra modi', 'prime minister', 'india',
    'biden', 'president biden', 'usa', 'america',
    'ukraine', 'russia', 'war', 'conflict',
    'election', 'vote', 'politics',
    'economy', 'market', 'stocks',
    'covid', 'pandemic', 'health',
    'technology', 'tech', 'ai', 'artificial intelligence',
    'climate', 'environment', 'weather'
  ];
  
  const lowerMessage = message.toLowerCase();
  
  // Check for news keywords in the message
  for (const keyword of newsKeywords) {
    if (lowerMessage.includes(keyword)) {
      terms.push(keyword);
    }
  }
  
  // Extract capitalized words that might be proper nouns
  const words = message.split(/\s+/);
  for (const word of words) {
    // If word is capitalized and longer than 3 characters, it might be a proper noun
    if (word.length > 3 && word[0] === word[0].toUpperCase() && word.slice(1) !== word.slice(1).toLowerCase()) {
      terms.push(word);
    }
  }
  
  // Remove duplicates and return
  return [...new Set(terms)];
}

// Helper function to format date
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffHours < 1) {
    return 'just now';
  } else if (diffHours < 24) {
    return `${diffHours}h ago`;
  } else if (diffDays < 7) {
    return `${diffDays}d ago`;
  } else {
    return date.toLocaleDateString();
  }
}