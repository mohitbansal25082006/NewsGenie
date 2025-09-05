// E:\newsgenie\src\app\api\chat\conversations\[id]\route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
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
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error getting conversation:', error.message);
    } else {
      console.error('Error getting conversation (unknown):', error);
    }
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

    // Parse request body safely (NextRequest.json() is fine in app router but guard)
    let body: any = {};
    try {
      body = await request.json();
    } catch {
      // fall back to empty body
      body = {};
    }

    const message: string = (body?.message ?? '').toString();
    const prioritizeLatest: boolean = Boolean(body?.prioritizeLatest);

    if (!message || message.trim().length === 0) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // Compose latest news context to augment user message
    let latestNewsContext = '';
    try {
      const newsApi = new NewsAPI();

      // Extract search terms from the user message
      const queryTerms = extractSearchTerms(message);

      // If there are query terms, search specifically for them first
      if (queryTerms.length > 0) {
        try {
          const searchResponse = await newsApi.getEverything({
            q: queryTerms.map(t => `"${t}"`).join(' OR '),
            language: 'en',
            sortBy: 'publishedAt',
            pageSize: 8,
          });

          if (searchResponse?.status === 'ok' && Array.isArray(searchResponse.articles) && searchResponse.articles.length > 0) {
            latestNewsContext = buildNewsContext(searchResponse.articles, {
              header: 'Latest News Related to Your Query',
              maxItems: 6,
            });
          }
        } catch (err) {
          console.warn('newsApi.getEverything failed for queryTerms, falling back to headlines', err);
        }
      }

      // If still empty or the user explicitly wants latest, get top headlines as fallback
      if (!latestNewsContext || prioritizeLatest) {
        try {
          const headlinesResponse = await newsApi.getTopHeadlines({
            country: (session?.user as any)?.country || 'us',
            pageSize: 10,
          });

          if (headlinesResponse?.status === 'ok' && Array.isArray(headlinesResponse.articles)) {
            const headlinesContext = buildNewsContext(headlinesResponse.articles, {
              header: 'Latest News Headlines',
              maxItems: 8,
            });

            // If we already had domain-specific results, append headlines as backup
            latestNewsContext = latestNewsContext
              ? latestNewsContext + '\n\n' + headlinesContext
              : headlinesContext;
          }
        } catch (err) {
          console.warn('newsApi.getTopHeadlines failed:', err);
        }
      }
    } catch (err) {
      console.error('Error building latestNewsContext:', err);
    }

    // If we have context, append a short instruction that the AI should prefer cited, recent facts
    const newsInstruction = latestNewsContext
      ? `\n\n[NEWS_CONTEXT_BEGIN]\n${latestNewsContext}\n[NEWS_CONTEXT_END]\n\nUse the news context above when it is relevant. Prefer facts from recent, reliable sources and cite them inline (source name and date). If something is not supported by the context, say so and avoid guessing.`
      : '';

    // Combine original message with the context so the AI can use it
    const messageForAi = message + newsInstruction;

    // Ask chat layer to generate and save response
    const result = await generateAndSaveResponse(
      resolvedParams.id,
      messageForAi,
      session.user.id
    );

    return NextResponse.json(result);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error generating response:', error.message);
    } else {
      console.error('Error generating response (unknown):', error);
    }
    return NextResponse.json(
      { error: 'Failed to generate response' },
      { status: 500 }
    );
  }
}

/* -------------- Helpers -------------- */

/**
 * Build a compact news context with title, source, publishedAt (relative) and a short snippet.
 * Returns a string ready to be appended to the AI prompt.
 */
function buildNewsContext(
  articles: Array<{ title?: string; description?: string; content?: string; source?: { name?: string }; publishedAt?: string; url?: string }>,
  opts: { header: string; maxItems?: number }
) {
  const maxItems = opts.maxItems ?? 6;
  const items = articles.slice(0, maxItems).map((a, i) => {
    const published = a.publishedAt ? formatDate(a.publishedAt) : 'unknown date';
    const source = a.source?.name ?? 'unknown source';
    const snippet = sanitizeSnippet(a.description ?? a.content ?? '');
    const snippetShort = snippet.length > 140 ? snippet.slice(0, 137) + '...' : snippet;
    const safeTitle = (a.title ?? 'No title').replace(/\s+/g, ' ').trim();
    return `${i + 1}. ${safeTitle} — ${source} (${published})${snippetShort ? ` — ${snippetShort}` : ''}${a.url ? ` — ${a.url}` : ''}`;
  });

  return `${opts.header}:\n${items.join('\n')}`;
}

/**
 * Extract search terms from the message:
 * - Named entities (capitalized sequences)
 * - Known news keywords present in text
 * - Words longer than 3 chars if no other term found (as last resort)
 */
function extractSearchTerms(message: string): string[] {
  if (!message || typeof message !== 'string') return [];
  const terms = new Set<string>();
  const lower = message.toLowerCase();

  // Known news keywords to look for
  const newsKeywords = [
    'modi', 'narendra modi', 'biden', 'joe biden', 'trump', 'ukraine', 'russia',
    'china', 'ai', 'artificial intelligence', 'election', 'economy', 'stocks',
    'covid', 'climate', 'technology', 'market', 'india', 'pakistan', 'uk', 'us', 'usa'
  ];

  for (const kw of newsKeywords) {
    if (lower.includes(kw)) terms.add(kw);
  }

  // Find multi-word capitalized sequences (e.g., "United States", "Elon Musk")
  const capSeqRegex = /\b([A-Z][a-z]{1,}\b(?:\s+[A-Z][a-z]{1,}\b){0,3})/g;
  let match;
  while ((match = capSeqRegex.exec(message)) !== null) {
    const t = match[1].trim();
    if (t.length > 2) terms.add(t);
  }

  // If still empty, take longest words (as fallback)
  if (terms.size === 0) {
    const words = message
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 3);
    words.slice(0, 4).forEach(w => terms.add(w));
  }

  return Array.from(terms).slice(0, 6);
}

/** Get human-friendly relative date or short date */
function formatDate(dateString: string) {
  try {
    const d = new Date(dateString);
    const diffMs = Date.now() - d.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    return d.toLocaleDateString();
  } catch {
    return dateString;
  }
}

/** Very small sanitizer to produce readable snippet text from HTML-ish content */
function sanitizeSnippet(input?: string): string {
  if (!input) return '';
  return input
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}
