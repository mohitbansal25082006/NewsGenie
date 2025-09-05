// E:\newsgenie\src\app\api\chat\conversations\[id]\route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { getConversation, generateAndSaveResponse } from '@/lib/chat';
import { NewsAPI } from '@/lib/newsApi';
import { searchWeb, formatWebSearchResults } from '@/lib/webSearch';

/** Types for NewsAPI responses to avoid `any` */
interface NewsApiSource {
  id?: string | null;
  name?: string | null;
}

interface NewsApiArticle {
  source?: NewsApiSource;
  author?: string | null;
  title?: string | null;
  description?: string | null;
  url?: string | null;
  urlToImage?: string | null;
  publishedAt?: string | null;
  content?: string | null;
}

interface NewsApiResponse {
  status: 'ok' | 'error' | string;
  totalResults?: number;
  articles?: NewsApiArticle[];
  code?: string;
  message?: string;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
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
    console.error('Error getting conversation:', error);
    return NextResponse.json({ error: 'Failed to get conversation' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await params;

    // Parse request body safely
    let body: Record<string, unknown> = {};
    try {
      const parsed = await request.json().catch(() => null);
      if (parsed && typeof parsed === 'object') {
        body = parsed as Record<string, unknown>;
      }
    } catch {
      body = {};
    }

    const message = String(body['message'] ?? '').trim();
    const webSearchEnabled = Boolean(body['webSearchEnabled']);
    const searchMode = Boolean(body['searchMode']);
    const regenerate = Boolean(body['regenerate']);

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // Extract the actual user query
    const cleanUserQuery = extractUserQuery(message);
    console.log('Clean user query:', cleanUserQuery);

    let latestNewsContext = '';
    let webSearchResults = '';
    let allSources: string[] = [];

    try {
      const queryTerms = extractSearchTerms(cleanUserQuery);

      // Web search
      if (webSearchEnabled) {
        try {
          console.log('Performing web search for:', cleanUserQuery);
          const searchResults = await searchWeb(cleanUserQuery, {
            type: searchMode ? 'comprehensive' : 'news',
            numResults: 8,
          });

          if (searchResults?.length) {
            console.log('Web search returned', searchResults.length, 'results');
            const formattedResults = formatWebSearchResults(searchResults);
            webSearchResults = `WEB SEARCH RESULTS:\n${formattedResults.join('\n\n')}`;
            allSources = searchResults.map((r) => r.link).filter(Boolean) as string[];
          }
        } catch (err) {
          console.error('Web search failed:', err);
        }
      }

      // Fallback to NewsAPI
      if (!webSearchResults) {
        const newsApi = new NewsAPI();

        if (queryTerms.length > 0) {
          try {
            const searchResponse = (await newsApi.getEverything({
              q: queryTerms.map((t) => `"${t}"`).join(' OR '),
              language: 'en',
              sortBy: 'publishedAt',
              pageSize: 8,
            })) as NewsApiResponse | null;

            if (searchResponse?.status === 'ok' && searchResponse.articles?.length) {
              latestNewsContext = buildNewsContext(searchResponse.articles, {
                header: 'Latest News Related to Your Query',
                maxItems: 6,
              });

              const newsSources = searchResponse.articles
                .map((a) => a.url)
                .filter((u): u is string => !!u);
              allSources.push(...newsSources);
            }
          } catch (err) {
            console.warn('newsApi.getEverything failed, falling back to headlines', err);
          }
        }

        if (!latestNewsContext || searchMode) {
          try {
            const userExtra = session.user as { country?: string };
            const country = userExtra?.country ?? 'us';

            const headlinesResponse = (await newsApi.getTopHeadlines({
              country,
              pageSize: 10,
            })) as NewsApiResponse | null;

            if (headlinesResponse?.status === 'ok' && headlinesResponse.articles?.length) {
              const headlinesContext = buildNewsContext(headlinesResponse.articles, {
                header: 'Latest News Headlines',
                maxItems: 8,
              });

              latestNewsContext = latestNewsContext
                ? `${latestNewsContext}\n\n${headlinesContext}`
                : headlinesContext;

              const headlineSources = headlinesResponse.articles
                .map((a) => a.url)
                .filter((u): u is string => !!u);
              allSources.push(...headlineSources);
            }
          } catch (err) {
            console.warn('newsApi.getTopHeadlines failed:', err);
          }
        }
      }
    } catch (err) {
      console.error('Error building context:', err);
    }

    const combinedContext = webSearchResults
      ? latestNewsContext
        ? `${webSearchResults}\n\n${latestNewsContext}`
        : webSearchResults
      : latestNewsContext;

    const contextInstruction = combinedContext
      ? `\n\n[CONTEXT_BEGIN]\n${combinedContext}\n[CONTEXT_END]\n\nUse the context above when relevant. Prefer recent, reliable sources and cite them inline.`
      : '';

    const messageForAi = cleanUserQuery + contextInstruction;
    const uniqueSources = [...new Set(allSources)];

    // ✅ Pass sources directly as string[]
    const result = await generateAndSaveResponse(
      resolvedParams.id,
      messageForAi,
      session.user.id,
      uniqueSources
    );

    return NextResponse.json(result);
  } catch (error: unknown) {
    console.error('Error generating response:', error);
    return NextResponse.json({ error: 'Failed to generate response' }, { status: 500 });
  }
}

/* ---------------- Helpers ---------------- */
function extractUserQuery(message: string): string {
  const contextBeginIndex = message.indexOf('[CONTEXT_BEGIN]');
  if (contextBeginIndex !== -1) {
    return message.substring(0, contextBeginIndex).trim();
  }
  const lines = message.split('\n');
  const queryLines: string[] = [];
  for (const line of lines) {
    if (
      line.includes('[CONTEXT_BEGIN]') ||
      line.includes('WEB SEARCH RESULTS:') ||
      line.includes('Latest News Related to Your Query:') ||
      line.includes('Latest News Headlines:') ||
      line.includes('Source:') ||
      line.match(/^\d+\./)
    ) {
      break;
    }
    queryLines.push(line);
  }
  return queryLines.join('\n').trim();
}

function buildNewsContext(
  articles: NewsApiArticle[],
  opts: { header: string; maxItems?: number }
): string {
  const maxItems = opts.maxItems ?? 6;
  const items = articles.slice(0, maxItems).map((a, i) => {
    const published = a.publishedAt ? formatDate(a.publishedAt) : 'unknown date';
    const source = a.source?.name ?? 'unknown source';
    const snippet = sanitizeSnippet(a.description ?? a.content ?? '');
    const snippetShort = snippet.length > 140 ? snippet.slice(0, 137) + '...' : snippet;
    const safeTitle = (a.title ?? 'No title').replace(/\s+/g, ' ').trim();
    const urlPart = a.url ? ` — ${a.url}` : '';
    return `${i + 1}. ${safeTitle} — ${source} (${published})${
      snippetShort ? ` — ${snippetShort}` : ''
    }${urlPart}`;
  });
  return `${opts.header}:\n${items.join('\n')}`;
}

function extractSearchTerms(message: string): string[] {
  if (!message) return [];
  const terms = new Set<string>();
  const lower = message.toLowerCase();
  const newsKeywords = [
    'modi',
    'narendra modi',
    'biden',
    'joe biden',
    'trump',
    'ukraine',
    'russia',
    'china',
    'ai',
    'artificial intelligence',
    'election',
    'economy',
    'stocks',
    'covid',
    'climate',
    'technology',
    'market',
    'india',
    'pakistan',
    'uk',
    'us',
    'usa',
  ];
  for (const kw of newsKeywords) {
    if (lower.includes(kw)) terms.add(kw);
  }
  const capSeqRegex = /\b([A-Z][a-z]{1,}\b(?:\s+[A-Z][a-z]{1,}\b){0,3})/g;
  let match: RegExpExecArray | null;
  while ((match = capSeqRegex.exec(message)) !== null) {
    const t = match[1].trim();
    if (t.length > 2) terms.add(t);
  }
  if (terms.size === 0) {
    const words = message
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length > 3);
    words.slice(0, 4).forEach((w) => terms.add(w));
  }
  return Array.from(terms).slice(0, 6);
}

function formatDate(dateString: string): string {
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

function sanitizeSnippet(input?: string): string {
  if (!input) return '';
  return input.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}
