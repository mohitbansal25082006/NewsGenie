import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function summarizeArticle(content: string): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a professional news summarizer. Create concise, informative summaries of news articles in 2-3 sentences. Focus on the key facts and main points."
        },
        {
          role: "user",
          content: `Please summarize this news article:\n\n${content}`
        }
      ],
      max_tokens: 150,
      temperature: 0.3,
    });

    return response.choices[0]?.message?.content || "Summary not available.";
  } catch (error) {
    console.error('OpenAI summarization error:', error);
    return "Summary not available.";
  }
}

export async function analyzeSentiment(text: string): Promise<'positive' | 'negative' | 'neutral'> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "Analyze the sentiment of the given text. Respond with only one word: 'positive', 'negative', or 'neutral'."
        },
        {
          role: "user",
          content: text
        }
      ],
      max_tokens: 10,
      temperature: 0,
    });

    const sentiment = response.choices[0]?.message?.content?.toLowerCase().trim();
    return sentiment === 'positive' || sentiment === 'negative' ? sentiment : 'neutral';
  } catch (error) {
    console.error('OpenAI sentiment analysis error:', error);
    return 'neutral';
  }
}

export async function extractKeywords(text: string): Promise<string[]> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "Extract 3-5 key keywords or phrases from the given text. Return them as a comma-separated list."
        },
        {
          role: "user",
          content: text
        }
      ],
      max_tokens: 50,
      temperature: 0.3,
    });

    const keywords = response.choices[0]?.message?.content;
    return keywords ? keywords.split(',').map(k => k.trim()) : [];
  } catch (error) {
    console.error('OpenAI keyword extraction error:', error);
    return [];
  }
}