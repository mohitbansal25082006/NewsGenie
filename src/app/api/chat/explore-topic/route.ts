// E:\newsgenie\src\app\api\chat\explore-topic\route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { searchWeb, WebSearchResult, formatWebSearchResults } from '@/lib/webSearch';
import { generateEnhancedChatResponse } from '@/lib/openai';

interface ExploreTopicRequest {
  topic: string;
  webSearchEnabled?: boolean;
  language?: string;
  location?: string;
  generateDetailedReport?: boolean;
}

interface ExploreTopicResponse {
  explanation: string;
  relatedTopics: string[];
  suggestedQuestions: string[];
  sources: string[];
  webSearchResults?: WebSearchResult[];
  detailedReport?: string;
  reportSections?: {
    overview: string;
    keyPoints: string[];
    currentDevelopments: string;
    historicalContext: string;
    impact: string;
    futureOutlook: string;
    controversies: string;
    resources: string[];
  };
}

/**
 * Local ChatMessage type to ensure role is the expected union type
 * and avoid broad 'string' assignment problems with TypeScript.
 */
type ChatMessage = { role: 'system' | 'user' | 'assistant'; content: string };

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    // Avoid potential Boolean(...) call issues by using explicit checks
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = (await request.json()) as ExploreTopicRequest;
    const { 
      topic, 
      webSearchEnabled = true, 
      language = 'en', 
      location = 'us',
      generateDetailedReport = false
    } = body;

    if (!topic || !topic.trim()) {
      return NextResponse.json({ error: 'Topic is required' }, { status: 400 });
    }

    console.log(`Exploring topic: ${topic} (web search: ${webSearchEnabled}, detailed report: ${generateDetailedReport})`);

    // Initialize response
    const response: ExploreTopicResponse = {
      explanation: '',
      relatedTopics: [],
      suggestedQuestions: [],
      sources: [],
      webSearchResults: [],
      detailedReport: '',
      reportSections: {
        overview: '',
        keyPoints: [],
        currentDevelopments: '',
        historicalContext: '',
        impact: '',
        futureOutlook: '',
        controversies: '',
        resources: []
      }
    };

    // Perform web search if enabled
    let webSearchContext = '';
    let webSearchResults: WebSearchResult[] = [];
    
    if (webSearchEnabled) {
      try {
        console.log('Performing web search for topic exploration:', topic);
        webSearchResults = await searchWeb(topic, {
          type: 'comprehensive',
          location,
          language,
          numResults: 15,
        });

        if (webSearchResults && webSearchResults.length > 0) {
          console.log('Web search returned', webSearchResults.length, 'results');
          response.webSearchResults = webSearchResults;
          
          // Format search results for AI consumption
          const formattedResults = formatWebSearchResults(webSearchResults);
          webSearchContext = `WEB SEARCH RESULTS:\n${formattedResults.join('\n\n')}`;
          
          // Extract sources
          response.sources = webSearchResults.map((r) => r.link).filter((link): link is string => Boolean(link));
        }
      } catch (error) {
        console.error('Web search failed for topic exploration:', error);
      }
    }

    // Get user preferences for personalization
    const userPreferences = {
      interests: (session.user as any).interests || [],
      country: location,
      language,
    };

    try {
      // Generate basic topic exploration
      const exploreResult = await exploreNewsTopic(
        session.user.id,
        topic,
        webSearchContext,
        userPreferences
      );

      if (exploreResult.explanation) {
        response.explanation = exploreResult.explanation;
      }

      if (exploreResult.relatedTopics && Array.isArray(exploreResult.relatedTopics)) {
        response.relatedTopics = exploreResult.relatedTopics;
      }

      if (exploreResult.suggestedQuestions && Array.isArray(exploreResult.suggestedQuestions)) {
        response.suggestedQuestions = exploreResult.suggestedQuestions;
      }

      if (exploreResult.sources && Array.isArray(exploreResult.sources)) {
        response.sources = [...new Set([...response.sources, ...exploreResult.sources])];
      }

      // Generate detailed report if requested
      if (generateDetailedReport) {
        console.log('Generating detailed report for topic:', topic);
        const detailedReport = await generateComprehensiveReport(
          topic,
          webSearchResults,
          userPreferences,
          exploreResult
        );

        response.detailedReport = detailedReport.content;
        response.reportSections = detailedReport.sections;
        
        // Add any additional sources from the detailed report
        if (detailedReport.sources && Array.isArray(detailedReport.sources)) {
          response.sources = [...new Set([...response.sources, ...detailedReport.sources])];
        }
      }
    } catch (error) {
      console.error('Error exploring topic:', error);
      
      // Fallback to basic exploration
      response.explanation = `I'm currently unable to explore the topic "${topic}" in detail. This might be due to technical difficulties or the topic being too specialized.`;
      response.relatedTopics = [
        `${topic} overview`,
        `Recent developments in ${topic}`,
        `Impact of ${topic} on society`,
      ];
      response.suggestedQuestions = [
        `What is ${topic}?`,
        `Why is ${topic} important?`,
        `What are the latest developments in ${topic}?`,
        `How does ${topic} affect everyday life?`,
        `What are the future prospects for ${topic}?`,
        `Where can I learn more about ${topic}?`,
      ];
    }

    const enhancedResponse = await enhanceTopicResponse(response, topic, generateDetailedReport);
    return NextResponse.json(enhancedResponse);
  } catch (error) {
    console.error('Error in explore-topic API:', error);
    return NextResponse.json({ error: 'Failed to explore topic' }, { status: 500 });
  }
}

/**
 * Generate a detailed report on the topic using AI
 */
async function generateComprehensiveReport(
  topic: string,
  webSearchResults: WebSearchResult[],
  userPreferences: { interests: string[]; country: string; language: string },
  baseExploration: { explanation: string; relatedTopics: string[]; suggestedQuestions: string[] }
): Promise<{
  content: string;
  sections: {
    overview: string;
    keyPoints: string[];
    currentDevelopments: string;
    historicalContext: string;
    impact: string;
    futureOutlook: string;
    controversies: string;
    resources: string[];
  };
  sources?: string[];
}> {
  try {
    // Format web search results for AI consumption
    let searchContext = '';
    if (webSearchResults && webSearchResults.length > 0) {
      const formattedResults = formatWebSearchResults(webSearchResults);
      searchContext = `WEB SEARCH RESULTS:\n${formattedResults.join('\n\n')}`;
    }

    // Create a comprehensive prompt for the detailed report
    const prompt = `Generate a comprehensive detailed report on the topic: "${topic}".

    Your report should include the following sections:
    1. Overview: A comprehensive introduction to the topic
    2. Key Points: 5-7 bullet points covering the most important aspects
    3. Current Developments: Recent news and developments related to the topic
    4. Historical Context: How the topic has evolved over time
    5. Impact: Effects on society, economy, environment, etc.
    6. Future Outlook: Predictions and trends for the future
    7. Controversies: Debates, disagreements, or challenges related to the topic
    8. Resources: 5-7 reliable sources for further reading

    Format your response as a JSON object with the following structure:
    {
      "overview": "Comprehensive overview text...",
      "keyPoints": ["Point 1", "Point 2", ...],
      "currentDevelopments": "Text about current developments...",
      "historicalContext": "Text about historical context...",
      "impact": "Text about impact...",
      "futureOutlook": "Text about future outlook...",
      "controversies": "Text about controversies...",
      "resources": ["Resource 1", "Resource 2", ...]
    }

    ${searchContext ? `Use the following web search results to enhance your report:\n${searchContext}` : ''}

    ${userPreferences.interests.length > 0 ? `Consider the user's interests: ${userPreferences.interests.join(', ')}.` : ''}
    ${userPreferences.country ? `Focus on relevance to ${userPreferences.country} where applicable.` : ''}
    ${userPreferences.language ? `Write the report in ${userPreferences.language}.` : ''}

    Base your report on the following initial exploration:
    Explanation: ${baseExploration.explanation}
    Related Topics: ${baseExploration.relatedTopics.join(', ')}
    Suggested Questions: ${baseExploration.suggestedQuestions.join(', ')}`;

    // Generate the detailed report using AI
    const messages: ChatMessage[] = [
      { role: 'system', content: 'You are an expert research analyst who generates comprehensive, well-structured reports on various topics.' },
      { role: 'user', content: prompt }
    ];

    // NOTE: generateEnhancedChatResponse may have multiple overloads in your lib.
    // Cast to any so we can pass contexts and options; replace cast with proper types when available.
    const aiResponse = await (generateEnhancedChatResponse as any)(
      messages,
      webSearchResults && webSearchResults.length > 0 ? [searchContext] : undefined,
      {
        temperature: 0.3,
        maxTokens: 3000,
      }
    );

    // Parse the AI response
    let reportContent: any;
    try {
      // Try to parse the JSON response
      const jsonMatch = aiResponse.response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        reportContent = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (error) {
      console.error('Error parsing AI response as JSON:', error);
      
      // Fallback to extracting sections manually
      reportContent = extractSectionsFromText(aiResponse.response);
    }

    // Ensure all required sections exist
    const sections = {
      overview: reportContent.overview || 'No overview available.',
      keyPoints: Array.isArray(reportContent.keyPoints) ? reportContent.keyPoints : [],
      currentDevelopments: reportContent.currentDevelopments || 'No current developments information available.',
      historicalContext: reportContent.historicalContext || 'No historical context available.',
      impact: reportContent.impact || 'No impact information available.',
      futureOutlook: reportContent.futureOutlook || 'No future outlook available.',
      controversies: reportContent.controversies || 'No controversies information available.',
      resources: Array.isArray(reportContent.resources) ? reportContent.resources : []
    };

    // Generate the formatted report content
    const formattedContent = generateFormattedReport(topic, sections);

    // Extract sources from the AI response
    const sources = extractSourcesFromText(aiResponse.response);

    return {
      content: formattedContent,
      sections,
      sources
    };
  } catch (error) {
    console.error('Error generating detailed report:', error);
    
    // Fallback to a basic report
    const fallbackSections = {
      overview: `A comprehensive overview of ${topic} is currently unavailable due to technical difficulties.`,
      keyPoints: [
        `${topic} is a significant topic with wide-ranging implications`,
        `Understanding ${topic} requires examining multiple dimensions`,
        `Recent developments have highlighted the importance of this topic`
      ],
      currentDevelopments: 'Information about current developments is unavailable at this time.',
      historicalContext: 'Historical context information is unavailable at this time.',
      impact: 'Impact information is unavailable at this time.',
      futureOutlook: 'Future outlook information is unavailable at this time.',
      controversies: 'Controversies information is unavailable at this time.',
      resources: [
        'https://en.wikipedia.org/wiki/' + encodeURIComponent(topic.replace(/\s+/g, '_')),
        'https://www.britannica.com/search?query=' + encodeURIComponent(topic)
      ]
    };

    return {
      content: generateFormattedReport(topic, fallbackSections),
      sections: fallbackSections,
      sources: fallbackSections.resources
    };
  }
}

/**
 * Generate a formatted report from sections
 */
function generateFormattedReport(topic: string, sections: {
  overview: string;
  keyPoints: string[];
  currentDevelopments: string;
  historicalContext: string;
  impact: string;
  futureOutlook: string;
  controversies: string;
  resources: string[];
}): string {
  return `# Comprehensive Report: ${topic}

*Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}*

## Overview

${sections.overview}

## Key Points

${sections.keyPoints.map((point: string) => `- ${point}`).join('\n')}

## Current Developments

${sections.currentDevelopments}

## Historical Context

${sections.historicalContext}

## Impact

${sections.impact}

## Future Outlook

${sections.futureOutlook}

## Controversies

${sections.controversies}

## Resources for Further Reading

${sections.resources.map((resource: string) => `- ${resource}`).join('\n')}

---

*This report was generated using AI and web search technologies. While every effort has been made to ensure accuracy, please verify critical information from primary sources.*`;
}

/**
 * Extract sections from text when JSON parsing fails
 */
function extractSectionsFromText(text: string): any {
  const sections: any = {
    overview: '',
    keyPoints: [],
    currentDevelopments: '',
    historicalContext: '',
    impact: '',
    futureOutlook: '',
    controversies: '',
    resources: []
  };

  // Extract overview
  const overviewMatch = text.match(/## Overview\s*\n([\s\S]*?)(?=## Key Points|$)/i);
  if (overviewMatch) {
    sections.overview = overviewMatch[1].trim();
  }

  // Extract key points
  const keyPointsMatch = text.match(/## Key Points\s*\n([\s\S]*?)(?=## Current Developments|$)/i);
  if (keyPointsMatch) {
    const keyPointsText = keyPointsMatch[1];
    const points = keyPointsText.split(/\n\s*-\s*/).filter(p => p.trim());
    sections.keyPoints = points;
  }

  // Extract current developments
  const currentDevelopmentsMatch = text.match(/## Current Developments\s*\n([\s\S]*?)(?=## Historical Context|$)/i);
  if (currentDevelopmentsMatch) {
    sections.currentDevelopments = currentDevelopmentsMatch[1].trim();
  }

  // Extract historical context
  const historicalContextMatch = text.match(/## Historical Context\s*\n([\s\S]*?)(?=## Impact|$)/i);
  if (historicalContextMatch) {
    sections.historicalContext = historicalContextMatch[1].trim();
  }

  // Extract impact
  const impactMatch = text.match(/## Impact\s*\n([\s\S]*?)(?=## Future Outlook|$)/i);
  if (impactMatch) {
    sections.impact = impactMatch[1].trim();
  }

  // Extract future outlook
  const futureOutlookMatch = text.match(/## Future Outlook\s*\n([\s\S]*?)(?=## Controversies|$)/i);
  if (futureOutlookMatch) {
    sections.futureOutlook = futureOutlookMatch[1].trim();
  }

  // Extract controversies
  const controversiesMatch = text.match(/## Controversies\s*\n([\s\S]*?)(?=## Resources|$)/i);
  if (controversiesMatch) {
    sections.controversies = controversiesMatch[1].trim();
  }

  // Extract resources
  const resourcesMatch = text.match(/## Resources for Further Reading\s*\n([\s\S]*?)(?=---|$)/i);
  if (resourcesMatch) {
    const resourcesText = resourcesMatch[1];
    const resources = resourcesText.split(/\n\s*-\s*/).filter(r => r.trim());
    sections.resources = resources;
  }

  return sections;
}

/**
 * Extract sources from text
 */
function extractSourcesFromText(text: string): string[] {
  const sources: string[] = [];
  
  // Extract URLs
  const urlRegex = /https?:\/\/[^\s\)]+/g;
  const urls = text.match(urlRegex) || [];
  sources.push(...urls);
  
  // Extract resource-like text (after "Resources:" or similar)
  const resourceSection = text.match(/## Resources for Further Reading\s*\n([\s\S]*?)(?=---|$)/i);
  if (resourceSection) {
    const resourceLines = resourceSection[1].split('\n');
    for (const line of resourceLines) {
      const cleanLine = line.replace(/^-\s*/, '').trim();
      if (cleanLine && !cleanLine.startsWith('#')) {
        sources.push(cleanLine);
      }
    }
  }
  
  // Remove duplicates and return
  return [...new Set(sources)];
}

async function enhanceTopicResponse(
  response: ExploreTopicResponse,
  topic: string,
  hasDetailedReport: boolean
): Promise<ExploreTopicResponse> {
  // Add a title to the explanation if not present
  if (response.explanation) {
    if (!response.explanation.includes(`## ${topic}`)) {
      response.explanation = `## ${topic}\n\n${response.explanation}`;
    }
    
    // Add a timestamp
    response.explanation += `\n\n*Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}*`;
    
    // Add a note about the detailed report if available
    if (hasDetailedReport && response.detailedReport) {
      response.explanation += `\n\n*A detailed report on this topic is available below.*`;
    }
  }
  
  // Ensure we have related topics
  if (!response.relatedTopics || response.relatedTopics.length === 0) {
    response.relatedTopics = [
      `${topic} overview`,
      `History of ${topic}`,
      `Current trends in ${topic}`,
      `Future of ${topic}`,
      `${topic} in different cultures`,
    ];
  }
  
  // Ensure we have suggested questions
  if (!response.suggestedQuestions || response.suggestedQuestions.length === 0) {
    response.suggestedQuestions = [
      `What is ${topic}?`,
      `Why is ${topic} important right now?`,
      `What are the key aspects of ${topic}?`,
      `How has ${topic} evolved over time?`,
      `What are the controversies surrounding ${topic}?`,
      `Where can I find reliable information about ${topic}?`,
    ];
  }
  
  // Ensure we have sources
  if (!response.sources || response.sources.length === 0) {
    response.sources = [
      `https://en.wikipedia.org/wiki/${encodeURIComponent(topic.replace(/\s+/g, '_'))}`,
      `https://www.britannica.com/search?query=${encodeURIComponent(topic)}`,
      `https://www.bbc.com/news/topics/${encodeURIComponent(
        topic.toLowerCase().replace(/\s+/g, '-')
      )}`,
    ];
  }
  
  return response;
}

async function exploreNewsTopic(
  userId: string,
  topic: string,
  webSearchContext: string = '',
  userPreferences?: { interests: string[]; country: string; language: string }
): Promise<{
  explanation: string;
  relatedTopics: string[];
  suggestedQuestions: string[];
  sources?: string[];
}> {
  try {
    const preferencesText = userPreferences
      ? `\n\nUser preferences:\n- Interests: ${userPreferences.interests.join(
          ', '
        )}\n- Country: ${userPreferences.country}\n- Language: ${userPreferences.language}`
      : '';
    
    // Create a prompt for the AI to generate topic exploration
    const prompt = `You are an expert research assistant. Your task is to provide a comprehensive exploration of the topic: "${topic}".

    Provide your response in the following format:
    
    EXPLANATION:
    [A detailed explanation of the topic, covering its definition, importance, and key aspects. Include current developments if relevant.]
    
    RELATED TOPICS:
    [5-8 related topics or subtopics, each on a new line starting with "- "]
    
    SUGGESTED QUESTIONS:
    [6-8 thoughtful questions someone might ask about this topic, each on a new line starting with "? "]
    
    SOURCES:
    [3-5 reliable sources for learning more about this topic, each on a new line starting with "- "]
    
    ${webSearchContext ? `Use the following web search results to enhance your response:\n${webSearchContext}` : ''}
    ${preferencesText}`;

    // Generate the exploration using AI
    const messages: ChatMessage[] = [
      { role: 'system', content: 'You are an expert research assistant who provides comprehensive topic explorations.' },
      { role: 'user', content: prompt }
    ];

    // NOTE: cast to any for flexibility with your library overloads/options.
    const aiResponse = await (generateEnhancedChatResponse as any)(
      messages,
      webSearchContext ? [webSearchContext] : undefined,
      {
        temperature: 0.3,
        maxTokens: 1500,
      }
    );

    // Parse the response
    const responseText = aiResponse.response;
    
    // Extract sections
    const explanationMatch = responseText.match(/EXPLANATION:\s*\n([\s\S]*?)(?=RELATED TOPICS:|$)/i);
    const explanation = explanationMatch ? explanationMatch[1].trim() : '';
    
    const relatedTopicsMatch = responseText.match(/RELATED TOPICS:\s*\n([\s\S]*?)(?=SUGGESTED QUESTIONS:|$)/i);
    const relatedTopicsLines = relatedTopicsMatch ? relatedTopicsMatch[1] : '';
    const relatedTopics = relatedTopicsLines.split(/\n\s*-\s*/).filter((t: string) => t.trim());
    
    const suggestedQuestionsMatch = responseText.match(/SUGGESTED QUESTIONS:\s*\n([\s\S]*?)(?=SOURCES:|$)/i);
    const suggestedQuestionsLines = suggestedQuestionsMatch ? suggestedQuestionsMatch[1] : '';
    const suggestedQuestions = suggestedQuestionsLines.split(/\n\s*\?\s*/).filter((q: string) => q.trim());
    
    const sourcesMatch = responseText.match(/SOURCES:\s*\n([\s\S]*?)$/i);
    const sourcesLines = sourcesMatch ? sourcesMatch[1] : '';
    const sources = sourcesLines.split(/\n\s*-\s*/).filter((s: string) => s.trim());

    return {
      explanation,
      relatedTopics,
      suggestedQuestions,
      sources
    };
  } catch (error) {
    console.error('Error in exploreNewsTopic:', error);
    return {
      explanation: `I apologize, but I'm unable to provide a detailed exploration of "${topic}". This could be due to technical difficulties or limitations in accessing current information about this topic.`,
      relatedTopics: [`${topic} overview`, `Recent developments in ${topic}`, `Impact of ${topic} on society`],
      suggestedQuestions: [`What is ${topic}?`, `Why is ${topic} important?`, `What are the latest developments in ${topic}?`],
    };
  }
}