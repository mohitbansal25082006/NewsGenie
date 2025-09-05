// E:\newsgenie\src\app\api\article\analyze\route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { summarizeArticle, analyzeSentiment, extractKeywords } from '@/lib/openai';

type BiasResult = { detected: boolean; type: string; explanation: string };
type KeyPointsResult = string[];
type EntitiesResult = {
  people: string[];
  organizations: string[];
  locations: string[];
};
type FactCheckResult = { claims: string[]; veracity: ('verified' | 'unverified' | 'misleading')[] };
type TimelineResult = { events: { date?: string; description: string }[] } | null;
type SentimentOverall = 'positive' | 'negative' | 'neutral';
type SentimentDetails = { overall: SentimentOverall; score: number; explanation: string };

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse body safely
    const parsedBody = await request.json().catch(() => null);
    if (!parsedBody || typeof parsedBody !== 'object') {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }
    const body = parsedBody as Record<string, unknown>;

    const articleId = (body.articleId as string) ?? undefined;
    const url = (body.url as string) ?? undefined;
    const deepAnalysis = Boolean(body.deepAnalysis);

    if (!articleId || !url) {
      return NextResponse.json({ error: 'Article ID and URL are required' }, { status: 400 });
    }

    // Get article from DB
    const article = await db.article.findUnique({
      where: { id: articleId },
    });

    if (!article) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }

    // Use stored content as baseline; if deepAnalysis is true you could call scrapers here
    const content = article.content ?? article.description ?? '';
    const title = article.title ?? '';

    // Generate summary, sentiment (string), keywords in parallel
    const [summary, sentimentString, keywords] = await Promise.all([
      summarizeArticle(content || title || article.description || ''),
      analyzeSentiment(`${title} ${article.description ?? ''}`), // returns 'positive' | 'negative' | 'neutral'
      extractKeywords(`${title} ${article.description ?? ''}`),
    ]);

    // Base analysis object
    let analysisData: {
      summary: string;
      sentiment: SentimentOverall;
      keywords: string[];
      sentimentDetails?: SentimentDetails;
      bias?: BiasResult;
      keyPoints?: KeyPointsResult;
      entities?: EntitiesResult;
      factCheck?: FactCheckResult;
      timeline?: TimelineResult;
    } = {
      summary,
      sentiment: (['positive', 'negative', 'neutral'].includes((sentimentString || '').toLowerCase())
        ? (sentimentString.toLowerCase() as SentimentOverall)
        : 'neutral'),
      keywords: Array.isArray(keywords) ? keywords.map(String) : (keywords ? [String(keywords)] : []),
    };

    // Extended deep analysis
    if (deepAnalysis) {
      const [
        biasAnalysis,
        keyPoints,
        entities,
        factCheck,
        timeline,
        sentimentDetails,
      ] = await Promise.all([
        detectBias(content || article.description || title),
        extractKeyPoints(content || article.description || title),
        extractEntities(content || article.description || title),
        performFactCheck(content || article.description || title),
        extractTimeline(content || article.description || title),
        buildSentimentDetails(
          `${title}\n\n${content || article.description || ''}`,
          analysisData.sentiment
        ),
      ]);

      analysisData = {
        ...analysisData,
        sentimentDetails,
        bias: biasAnalysis,
        keyPoints,
        entities,
        factCheck,
        timeline,
      };
    }

    // Update the article in DB - store sentiment string and keywords array
    const updatedArticle = await db.article.update({
      where: { id: articleId },
      data: {
        summary: analysisData.summary,
        sentiment: analysisData.sentiment,
        keywords: analysisData.keywords,
      },
    });

    // Return analysis data plus some article fields
    return NextResponse.json({
      ...analysisData,
      title: updatedArticle.title,
      description: updatedArticle.description,
      content: updatedArticle.content,
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error analyzing article:', error.message);
    } else {
      console.error('Error analyzing article (unknown):', error);
    }
    return NextResponse.json({ error: 'Failed to analyze article' }, { status: 500 });
  }
}

/* --------------------------
   Helper functions (OpenAI)
   These use process.env.OPENAI_API_URL and OPENAI_API_KEY as in your original file.
   They parse the returned JSON safely.
   -------------------------- */

/**
 * Call OpenAI's chat endpoint with a typed payload.
 * Payload is a general object (Record<string, unknown>).
 */
async function callOpenAIChat(payload: Record<string, unknown>): Promise<unknown> {
  const url = process.env.OPENAI_API_URL || 'https://api.openai.com/v1/chat/completions';
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('OPENAI_API_KEY not set');

  const resp = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(payload),
  });

  if (!resp.ok) {
    const text = await resp.text().catch(() => '');
    throw new Error(`OpenAI request failed: ${resp.status} ${text}`);
  }

  const data = await resp.json().catch(() => null);
  return data;
}

/**
 * Safely parse common OpenAI choice shapes into either a parsed object or raw string.
 * Returns parsed JSON, string, or null.
 */
async function safeParseChoiceJson(data: unknown): Promise<unknown> {
  try {
    if (!data || typeof data !== 'object') return null;
    const d = data as Record<string, unknown>;

    const choices = d['choices'];
    if (!Array.isArray(choices) || choices.length === 0) {
      return null;
    }

    const first = choices[0] as Record<string, unknown>;
    // message.content
    const message = first['message'];
    if (message && typeof message === 'object') {
      const msg = message as Record<string, unknown>;
      const content = msg['content'];
      if (content !== undefined && content !== null) {
        if (typeof content === 'object') return content;
        if (typeof content === 'string') {
          try {
            return JSON.parse(content);
          } catch {
            return content;
          }
        }
        return content;
      }
    }

    // fallback to top-level text
    const text = first['text'];
    if (typeof text === 'string') {
      try {
        return JSON.parse(text);
      } catch {
        return text;
      }
    }

    // delta.content (streaming shape)
    const delta = first['delta'];
    if (delta && typeof delta === 'object') {
      const deltaContent = (delta as Record<string, unknown>)['content'];
      if (typeof deltaContent === 'string') {
        try {
          return JSON.parse(deltaContent);
        } catch {
          return deltaContent;
        }
      }
    }

    return null;
  } catch {
    return null;
  }
}

async function detectBias(text: string): Promise<BiasResult> {
  try {
    const payload: Record<string, unknown> = {
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content:
            'Analyze the given text for potential bias. Identify if there is any bias (political, commercial, sensational, etc.) and provide a brief explanation. Respond in JSON format with fields: detected (boolean), type (string), explanation (string).',
        },
        { role: 'user', content: text },
      ],
      max_tokens: 200,
      temperature: 0.3,
    };

    const data = await callOpenAIChat(payload);
    const parsed = await safeParseChoiceJson(data);
    if (parsed && typeof parsed === 'object') {
      const p = parsed as Record<string, unknown>;
      return {
        detected: Boolean(p['detected']),
        type: String(p['type'] ?? 'unknown'),
        explanation: String(p['explanation'] ?? String(parsed)),
      };
    }

    return { detected: false, type: 'none', explanation: 'No bias detected' };
  } catch (error: unknown) {
    if (error instanceof Error) console.error('Error detecting bias:', error.message);
    else console.error('Error detecting bias (unknown):', error);
    return { detected: false, type: 'none', explanation: 'No bias detected' };
  }
}

async function extractKeyPoints(text: string): Promise<KeyPointsResult> {
  try {
    const payload: Record<string, unknown> = {
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'Extract 3-5 key points from the given text. Return them as a JSON array of strings.',
        },
        { role: 'user', content: text },
      ],
      max_tokens: 300,
      temperature: 0.3,
    };

    const data = await callOpenAIChat(payload);
    const parsed = await safeParseChoiceJson(data);

    if (Array.isArray(parsed)) return parsed.slice(0, 5).map(String);
    if (typeof parsed === 'string') {
      return parsed
        .split(/\n+/)
        .map((s) => s.replace(/^\s*[-–•\d.]+\s*/, '').trim())
        .filter((s) => s)
        .slice(0, 5);
    }
    return [];
  } catch (error: unknown) {
    if (error instanceof Error) console.error('Error extracting key points:', error.message);
    else console.error('Error extracting key points (unknown):', error);
    return [];
  }
}

async function extractEntities(text: string): Promise<EntitiesResult> {
  try {
    const payload: Record<string, unknown> = {
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content:
            'Extract entities (people, organizations, locations) from the given text. Return them in JSON format with fields: people (string[]), organizations (string[]), locations (string[]).',
        },
        { role: 'user', content: text },
      ],
      max_tokens: 300,
      temperature: 0.3,
    };

    const data = await callOpenAIChat(payload);
    const parsed = await safeParseChoiceJson(data);
    if (parsed && typeof parsed === 'object') {
      const p = parsed as Record<string, unknown>;
      return {
        people: Array.isArray(p['people']) ? (p['people'] as unknown[]).map(String) : [],
        organizations: Array.isArray(p['organizations']) ? (p['organizations'] as unknown[]).map(String) : [],
        locations: Array.isArray(p['locations']) ? (p['locations'] as unknown[]).map(String) : [],
      };
    }

    return { people: [], organizations: [], locations: [] };
  } catch (error: unknown) {
    if (error instanceof Error) console.error('Error extracting entities:', error.message);
    else console.error('Error extracting entities (unknown):', error);
    return { people: [], organizations: [], locations: [] };
  }
}

async function performFactCheck(text: string): Promise<FactCheckResult> {
  try {
    const payload: Record<string, unknown> = {
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content:
            'Identify key claims in the text that could be fact-checked. For each claim, provide a brief veracity assessment. Return in JSON format with fields: claims (string[]), veracity (string[] where each value is "verified", "unverified", or "misleading").',
        },
        { role: 'user', content: text },
      ],
      max_tokens: 400,
      temperature: 0.3,
    };

    const data = await callOpenAIChat(payload);
    const parsed = await safeParseChoiceJson(data);

    if (parsed && typeof parsed === 'object') {
      const p = parsed as Record<string, unknown>;
      const claims = Array.isArray(p['claims']) ? (p['claims'] as unknown[]).map(String) : [];
      const veracityRaw = Array.isArray(p['veracity']) ? (p['veracity'] as unknown[]) : [];
      const veracity = veracityRaw.map((v) => {
        const s = String(v).toLowerCase();
        if (s === 'verified') return 'verified' as const;
        if (s === 'misleading') return 'misleading' as const;
        return 'unverified' as const;
      });
      return { claims, veracity };
    }

    return { claims: [], veracity: [] };
  } catch (error: unknown) {
    if (error instanceof Error) console.error('Error performing fact check:', error.message);
    else console.error('Error performing fact check (unknown):', error);
    return { claims: [], veracity: [] };
  }
}

async function extractTimeline(text: string): Promise<TimelineResult> {
  try {
    const payload: Record<string, unknown> = {
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content:
            'Extract any timeline of events from the text. Return in JSON format with fields: events (array of objects with date and description). If no timeline is found, return an empty array.',
        },
        { role: 'user', content: text },
      ],
      max_tokens: 300,
      temperature: 0.3,
    };

    const data = await callOpenAIChat(payload);
    const parsed = await safeParseChoiceJson(data);
    if (parsed && typeof parsed === 'object') {
      const p = parsed as Record<string, unknown>;
      if (Array.isArray(p['events']) && p['events'].length > 0) {
        const events = (p['events'] as unknown[]).map((ev) => {
          if (ev && typeof ev === 'object') {
            const e = ev as Record<string, unknown>;
            return {
              date: typeof e['date'] === 'string' ? e['date'] : undefined,
              description: String(e['description'] ?? ''),
            };
          }
          return { date: undefined, description: String(ev ?? '') };
        });
        return { events };
      }
    }

    return null;
  } catch (error: unknown) {
    if (error instanceof Error) console.error('Error extracting timeline:', error.message);
    else console.error('Error extracting timeline (unknown):', error);
    return null;
  }
}

/**
 * Build a structured sentiment details object for the Sentiment tab.
 * If OpenAI fails, returns a deterministic fallback explanation and score.
 */
async function buildSentimentDetails(text: string, overall: SentimentOverall): Promise<SentimentDetails> {
  try {
    const payload: Record<string, unknown> = {
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content:
            'You are an assistant that explains sentiment analysis results. Respond in JSON with fields: overall ("positive" | "negative" | "neutral"), score (0..1 number confidence), explanation (short string).',
        },
        {
          role: 'user',
          content:
            `Given this article text, produce a concise explanation and confidence score for the sentiment "${overall}".\n\nArticle:\n${text}`,
        },
      ],
      max_tokens: 200,
      temperature: 0.2,
    };

    const data = await callOpenAIChat(payload);
    const parsed = await safeParseChoiceJson(data);
    if (parsed && typeof parsed === 'object') {
      const p = parsed as Record<string, unknown>;

      const outOverall =
        typeof p['overall'] === 'string' && ['positive', 'negative', 'neutral'].includes(p['overall'].toLowerCase())
          ? (p['overall'].toLowerCase() as SentimentOverall)
          : overall;

      const scoreNum =
        typeof p['score'] === 'number' ? p['score'] : Number(p['score'] ?? NaN);
      const score =
        Number.isFinite(scoreNum) && scoreNum >= 0 && scoreNum <= 1 ? scoreNum : defaultSentimentScore(overall);

      const explanation =
        typeof p['explanation'] === 'string' && p['explanation'].trim()
          ? p['explanation'].trim()
          : defaultSentimentExplanation(overall);

      return { overall: outOverall, score, explanation };
    }
  } catch (error) {
    console.error('buildSentimentDetails error:', error);
  }

  return {
    overall,
    score: defaultSentimentScore(overall),
    explanation: defaultSentimentExplanation(overall),
  };
}

function defaultSentimentScore(overall: SentimentOverall): number {
  switch (overall) {
    case 'positive':
      return 0.8;
    case 'negative':
      return 0.2;
    default:
      return 0.5;
  }
}
function defaultSentimentExplanation(overall: SentimentOverall): string {
  switch (overall) {
    case 'positive':
      return 'Tone appears generally optimistic or favorable.';
    case 'negative':
      return 'Tone appears critical, alarming, or unfavorable.';
    default:
      return 'Language is mostly balanced with limited affect.';
  }
}
