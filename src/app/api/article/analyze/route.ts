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
    let body: any = {};
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    const articleId = body.articleId as string | undefined;
    const url = body.url as string | undefined;
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
      sentiment: SentimentOverall; // keep simple string for compatibility
      keywords: string[];
      // deepAnalysis pieces optionally added below
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
      keywords: Array.isArray(keywords) ? keywords : (keywords ? [String(keywords)] : []),
    };

    // Extended deep analysis
    if (deepAnalysis) {
      const [biasAnalysis, keyPoints, entities, factCheck, timeline, sentimentDetails] = await Promise.all([
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
        sentiment: analysisData.sentiment, // store the returned sentiment string directly
        keywords: analysisData.keywords,
      },
    });

    // Return analysis data plus some article fields
    // NOTE: we keep `sentiment` string AND include `sentimentDetails` for the UI "Sentiment" tab.
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

async function callOpenAIChat(payload: any): Promise<any> {
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

  const data = await resp.json().catch(() => ({}));
  return data;
}

async function safeParseChoiceJson(data: any): Promise<any> {
  // Handles various shapes returned by OpenAI
  try {
    const raw =
      data?.choices?.[0]?.message?.content ??
      data?.choices?.[0]?.text ??
      data?.choices?.[0]?.delta?.content;
    if (!raw) return null;
    if (typeof raw === 'object') return raw; // already parsed
    if (typeof raw === 'string') {
      try {
        return JSON.parse(raw);
      } catch {
        return raw;
      }
    }
    return raw;
  } catch {
    return null;
  }
}

async function detectBias(text: string): Promise<BiasResult> {
  try {
    const payload = {
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
      return {
        detected: Boolean(parsed.detected),
        type: parsed.type ?? 'unknown',
        explanation: parsed.explanation ?? String(parsed),
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
    const payload = {
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
        .map((s: string) => s.replace(/^\s*[-–•\d.]+\s*/, '').trim())
        .filter((s: string) => s)
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
    const payload = {
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
      return {
        people: Array.isArray(parsed.people) ? parsed.people.map(String) : [],
        organizations: Array.isArray(parsed.organizations) ? parsed.organizations.map(String) : [],
        locations: Array.isArray(parsed.locations) ? parsed.locations.map(String) : [],
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
    const payload = {
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
      return {
        claims: Array.isArray(parsed.claims) ? parsed.claims.map(String) : [],
        veracity: Array.isArray(parsed.veracity)
          ? parsed.veracity.map((v: any) => String(v) as 'verified' | 'unverified' | 'misleading')
          : [],
      };
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
    const payload = {
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
    if (parsed && parsed.events && Array.isArray(parsed.events) && parsed.events.length > 0) {
      return parsed;
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
    const payload = {
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
      const outOverall: SentimentOverall =
        ['positive', 'negative', 'neutral'].includes((parsed.overall || '').toLowerCase())
          ? (parsed.overall.toLowerCase() as SentimentOverall)
          : overall;

      const scoreNum = typeof parsed.score === 'number' ? parsed.score : Number(parsed.score);
      const score =
        Number.isFinite(scoreNum) && scoreNum >= 0 && scoreNum <= 1
          ? scoreNum
          : defaultSentimentScore(overall);

      const explanation = typeof parsed.explanation === 'string' && parsed.explanation.trim()
        ? parsed.explanation.trim()
        : defaultSentimentExplanation(overall);

      return { overall: outOverall, score, explanation };
    }
  } catch (err) {
    // fall through to fallback
  }

  return {
    overall,
    score: defaultSentimentScore(overall),
    explanation: defaultSentimentExplanation(overall),
  };
}

function defaultSentimentScore(overall: SentimentOverall): number {
  switch (overall) {
    case 'positive': return 0.8;
    case 'negative': return 0.2;
    default: return 0.5;
  }
}
function defaultSentimentExplanation(overall: SentimentOverall): string {
  switch (overall) {
    case 'positive': return 'Tone appears generally optimistic or favorable.';
    case 'negative': return 'Tone appears critical, alarming, or unfavorable.';
    default: return 'Language is mostly balanced with limited affect.';
  }
}
