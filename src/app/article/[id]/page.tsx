// E:\newsgenie\src\app\article\[id]\page.tsx
'use client';
import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft, BookmarkPlus, BookmarkCheck, ExternalLink, Share, Clock, User, Calendar, 
  Send, Bot, MessageSquare, Loader2, Brain, CheckCircle, AlertTriangle, 
  Globe, Users, Lightbulb, FileText
} from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';
import Image from 'next/image';
import toast from 'react-hot-toast';

interface Article {
  id: string;
  title: string;
  description: string;
  content: string;
  url: string;
  urlToImage: string;
  publishedAt: string;
  source: string;
  author: string;
  category: string;
  summary?: string;
  sentiment?: 'positive' | 'negative' | 'neutral' | string;
  keywords?: string[];
}

interface Bookmark {
  id: string;
  articleId: string;
  userId: string;
  createdAt: string;
}

interface QAMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: Date;
  sources?: string[];
}

type SentimentOverall = 'positive' | 'negative' | 'neutral';

interface AnalysisData {
  summary: string;
  sentiment?: SentimentOverall | string;
  sentimentDetails?: {
    overall: SentimentOverall;
    score: number;
    explanation: string;
  };
  bias?: {
    detected: boolean;
    type: string;
    explanation: string;
  };
  keyPoints: string[];
  entities: {
    people: string[];
    organizations: string[];
    locations: string[];
  };
  factCheck: {
    claims: string[];
    veracity: ('verified' | 'unverified' | 'misleading')[];
  };
  timeline?: {
    events: {
      date?: string;
      description: string;
    }[];
  } | null;
  translations?: {
    [language: string]: {
      title: string;
      summary: string;
    };
  };
}

export default function ArticlePage() {
  const { data: session } = useSession();
  const params = useParams();
  const router = useRouter();
  const articleId = params.id as string;
  
  const [article, setArticle] = useState<Article | null>(null);
  const [relatedArticles, setRelatedArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [relatedLoading, setRelatedLoading] = useState(true);
  const [bookmarked, setBookmarked] = useState(false);
  const [qaMessages, setQaMessages] = useState<QAMessage[]>([]);
  const [question, setQuestion] = useState('');
  const [isAsking, setIsAsking] = useState(false);
  const [showQA, setShowQA] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
  const [isUpdatingContent, setIsUpdatingContent] = useState(false);
  const [isContentTruncated, setIsContentTruncated] = useState(false);
  
  const fetchArticle = useCallback(async () => {
    setLoading(true);
    setIsUpdatingContent(true);
    try {
      const response = await fetch(`/api/article/${articleId}`);
      if (response.ok) {
        const data: Article = await response.json();
        setArticle(data);
        
        // Check if content is truncated
        if (data.content.includes('[+')) {
          setIsContentTruncated(true);
          // Try to fetch full content
          try {
            const fullResponse = await fetch(`/api/article/${articleId}/fetch-full`, {
              method: 'POST',
            });
            if (fullResponse.ok) {
              const fullData: Article = await fullResponse.json();
              setArticle(fullData);
              setIsContentTruncated(false);
            }
          } catch (error) {
            console.error('Error fetching full article:', error);
          }
        } else {
          setIsContentTruncated(false);
        }
        
        if (session) {
          markAsRead(articleId);
        }
      } else {
        toast.error('Article not found');
        router.push('/');
      }
    } catch (error) {
      console.error('Error fetching article:', error);
      toast.error('Failed to load article');
      router.push('/');
    } finally {
      setLoading(false);
      setIsUpdatingContent(false);
    }
  }, [articleId, session, router]);
  
  const fetchFullContent = async () => {
    setIsUpdatingContent(true);
    try {
      const response = await fetch(`/api/article/${articleId}/fetch-full`, {
        method: 'POST',
      });
      if (response.ok) {
        const data: Article = await response.json();
        setArticle(data);
        setIsContentTruncated(false);
        toast.success('Full article loaded');
      } else {
        toast.error('Failed to load full article');
      }
    } catch (error) {
      console.error('Error fetching full article:', error);
      toast.error('Error loading full article');
    } finally {
      setIsUpdatingContent(false);
    }
  };
  
  const fetchRelatedArticles = useCallback(async () => {
    setRelatedLoading(true);
    try {
      const response = await fetch(`/api/article/${articleId}/related`);
      if (response.ok) {
        const data = await response.json();
        setRelatedArticles(data.articles || []);
      }
    } catch (error) {
      console.error('Error fetching related articles:', error);
    } finally {
      setRelatedLoading(false);
    }
  }, [articleId]);
  
  const checkBookmarkStatus = useCallback(async () => {
    try {
      const response = await fetch('/api/bookmarks');
      if (response.ok) {
        const bookmarks: Bookmark[] = await response.json();
        setBookmarked(bookmarks.some((b: Bookmark) => b.articleId === articleId));
      }
    } catch (error) {
      console.error('Error checking bookmark status:', error);
    }
  }, [articleId]);
  
  useEffect(() => {
    if (articleId) {
      fetchArticle();
      fetchRelatedArticles();
      if (session) {
        checkBookmarkStatus();
      }
    }
  }, [articleId, session, fetchArticle, fetchRelatedArticles, checkBookmarkStatus]);
  
  const toggleBookmark = async () => {
    if (!session) {
      toast.error('Please sign in to bookmark articles');
      return;
    }
    
    try {
      if (bookmarked) {
        const response = await fetch(`/api/bookmarks?articleId=${articleId}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          setBookmarked(false);
          toast.success('Bookmark removed');
        }
      } else {
        const response = await fetch('/api/bookmarks', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ articleId }),
        });
        if (response.ok) {
          setBookmarked(true);
          toast.success('Article bookmarked');
        }
      }
    } catch (error) {
      console.error('Error updating bookmark:', error);
      toast.error('Failed to update bookmark');
    }
  };
  
  const markAsRead = async (id: string) => {
    try {
      await fetch('/api/read-articles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ articleId: id }),
      });
    } catch (error) {
      console.error('Error marking article as read:', error);
    }
  };
  
  const shareArticle = () => {
    if (navigator.share) {
      navigator.share({
        title: article?.title,
        text: article?.description,
        url: article?.url,
      });
    } else {
      navigator.clipboard.writeText(article?.url || '');
      toast.success('Link copied to clipboard');
    }
  };
  
  const analyzeArticle = async () => {
    if (!article || isAnalyzing) return;
    
    setIsAnalyzing(true);
    try {
      const response = await fetch('/api/article/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          articleId: article.id,
          url: article.url,
          deepAnalysis: true
        }),
      });
      
      if (response.ok) {
        const data: AnalysisData = await response.json();
        setAnalysisData(data);
        setShowAnalysis(true);
        setArticle(prev => prev ? {
          ...prev,
          summary: data.summary ?? prev.summary,
          sentiment: (data.sentiment as Article['sentiment']) ?? prev.sentiment,
          keywords: data.entities ? prev.keywords : prev.keywords,
        } : null);
        toast.success('Article analysis completed');
      } else {
        toast.error('Failed to analyze article');
      }
    } catch (error) {
      console.error('Error analyzing article:', error);
      toast.error('Error analyzing article');
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  const askQuestion = async () => {
    if (!question.trim() || !session || isAsking) return;
    
    setIsAsking(true);
    const userQuestion = question;
    setQuestion('');
    
    const userMessage: QAMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: userQuestion,
      createdAt: new Date(),
    };
    setQaMessages(prev => [...prev, userMessage]);
    
    try {
      const response = await fetch('/api/article/qa', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          articleId,
          question: userQuestion,
          url: article?.url
        }),
      });
      
      if (response.ok) {
        const { answer, sources } = await response.json();
        const assistantMessage: QAMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: answer,
          createdAt: new Date(),
          sources
        };
        setQaMessages(prev => [...prev, assistantMessage]);
      } else {
        toast.error('Failed to get answer');
      }
    } catch (error) {
      console.error('Error asking question:', error);
      toast.error('Error asking question');
    } finally {
      setIsAsking(false);
    }
  };
  
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      askQuestion();
    }
  };
  
  const getSentimentColor = (sentiment?: string) => {
    switch (sentiment) {
      case 'positive': return 'text-green-600 bg-green-50';
      case 'negative': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };
  
  const getBiasColor = (type: string) => {
    switch (type) {
      case 'political': return 'text-purple-600 bg-purple-50';
      case 'commercial': return 'text-blue-600 bg-blue-50';
      case 'sensational': return 'text-orange-600 bg-orange-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };
  
  const getVeracityColor = (veracity: string) => {
    switch (veracity) {
      case 'verified': return 'text-green-600 bg-green-50';
      case 'unverified': return 'text-yellow-600 bg-yellow-50';
      case 'misleading': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="mb-6">
            <Button variant="ghost" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </div>
          
          <Skeleton className="h-8 w-3/4 mb-4" />
          <div className="flex items-center gap-2 mb-6">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-24" />
          </div>
          
          <div className="relative w-full h-64 md:h-96 rounded-lg overflow-hidden mb-6">
            <Skeleton className="w-full h-full" />
          </div>
          
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
      </div>
    );
  }
  
  if (!article) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Article Not Found</h1>
          <p className="text-gray-600 mb-4">The article you&apos;re looking for doesn&apos;t exist.</p>
          <Button onClick={() => router.push('/')}>
            Go to Homepage
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Back Button */}
        <div className="mb-6">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>
        
        {/* Article Header */}
        <div className="mb-6">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <Badge variant="secondary">{article.source}</Badge>
            {article.sentiment && (
              <Badge 
                variant={
                  article.sentiment === 'positive' ? 'default' :
                  article.sentiment === 'negative' ? 'destructive' : 'secondary'
                }
              >
                {article.sentiment}
              </Badge>
            )}
            <Badge variant="outline">{article.category}</Badge>
          </div>
          
          <h1 className="text-3xl font-bold mb-4">{article.title}</h1>
          
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-6">
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-1" />
              <span>{format(new Date(article.publishedAt), 'MMM d, yyyy')}</span>
            </div>
            {article.author && (
              <div className="flex items-center">
                <User className="h-4 w-4 mr-1" />
                <span>{article.author}</span>
              </div>
            )}
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              <span>5 min read</span>
            </div>
          </div>
        </div>
        
        {/* Article Image */}
        {article.urlToImage && (
          <div className="relative w-full h-64 md:h-96 rounded-lg overflow-hidden mb-6">
            <Image 
              src={article.urlToImage} 
              alt={article.title}
              fill
              className="object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                if (target?.style) target.style.display = 'none';
              }}
            />
          </div>
        )}
        
        {/* Article Actions */}
        <div className="flex gap-2 mb-6">
          <Button
            variant="outline"
            size="sm"
            onClick={toggleBookmark}
            className="flex items-center"
          >
            {bookmarked ? (
              <>
                <BookmarkCheck className="h-4 w-4 mr-2" />
                Saved
              </>
            ) : (
              <>
                <BookmarkPlus className="h-4 w-4 mr-2" />
                Save
              </>
            )}
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={shareArticle}
            className="flex items-center"
          >
            <Share className="h-4 w-4 mr-2" />
            Share
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            asChild
            className="flex items-center"
          >
            <a 
              href={article.url} 
              target="_blank" 
              rel="noopener noreferrer"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              View Original
            </a>
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={analyzeArticle}
            disabled={isAnalyzing}
            className="flex items-center"
          >
            {isAnalyzing ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Brain className="h-4 w-4 mr-2" />
            )}
            Analyze
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowQA(!showQA)}
            className="flex items-center"
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            Ask AI
          </Button>
        </div>
        
        {/* AI Summary */}
        {article.summary && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">AI Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">{article.summary}</p>
            </CardContent>
          </Card>
        )}
        
        {/* Analysis Results */}
        {showAnalysis && analysisData && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Brain className="h-5 w-5 mr-2" />
                Advanced Article Analysis
              </CardTitle>
              <CardDescription>
                Comprehensive analysis powered by AI
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="sentiment">Sentiment</TabsTrigger>
                  <TabsTrigger value="entities">Entities</TabsTrigger>
                  <TabsTrigger value="fact-check">Fact Check</TabsTrigger>
                </TabsList>
                
                <TabsContent value="overview" className="space-y-4">
                  {analysisData.keyPoints?.length ? (
                    <div>
                      <h3 className="font-semibold mb-2">Key Points</h3>
                      <ul className="space-y-2">
                        {analysisData.keyPoints.map((point, index) => (
                          <li key={index} className="flex items-start">
                            <Lightbulb className="h-4 w-4 mt-0.5 mr-2 text-yellow-500 flex-shrink-0" />
                            <span className="text-sm">{point}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                  
                  {analysisData.bias?.detected && (
                    <div>
                      <h3 className="font-semibold mb-2">Bias Detection</h3>
                      <div className={`p-3 rounded-lg ${getBiasColor(analysisData.bias.type)}`}>
                        <div className="flex items-center mb-2">
                          <AlertTriangle className="h-4 w-4 mr-2" />
                          <span className="font-medium">{analysisData.bias.type} bias detected</span>
                        </div>
                        <p className="text-sm">{analysisData.bias.explanation}</p>
                      </div>
                    </div>
                  )}
                  
                  {analysisData.timeline && analysisData.timeline.events?.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-2">Timeline</h3>
                      <div className="space-y-2">
                        {analysisData.timeline.events.map((event, index) => (
                          <div key={index} className="flex items-start">
                            <div className="flex-shrink-0 w-20 text-sm text-gray-500">
                              {event.date ? format(new Date(event.date), 'MMM d') : '—'}
                            </div>
                            <div className="text-sm">{event.description}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="sentiment" className="space-y-4">
                  {analysisData.sentimentDetails ? (
                    <div className={`p-4 rounded-lg ${getSentimentColor(analysisData.sentimentDetails.overall)}`}>
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold">Overall Sentiment</h3>
                        <Badge variant="outline">{analysisData.sentimentDetails.overall}</Badge>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                        <div 
                          className="h-2 rounded-full bg-current"
                          style={{ width: `${Math.max(0, Math.min(1, analysisData.sentimentDetails.score)) * 100}%` }}
                        />
                      </div>
                      <p className="text-sm">{analysisData.sentimentDetails.explanation}</p>
                    </div>
                  ) : (
                    <div className="text-sm text-gray-600">
                      Sentiment details are not available yet. Click <span className="font-medium">Analyze</span> to run deep analysis.
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="entities" className="space-y-4">
                  {analysisData.entities?.people?.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-2 flex items-center">
                        <Users className="h-4 w-4 mr-2" />
                        People Mentioned
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {analysisData.entities.people.map((person, index) => (
                          <Badge key={index} variant="outline">{person}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {analysisData.entities?.organizations?.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-2 flex items-center">
                        <FileText className="h-4 w-4 mr-2" />
                        Organizations
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {analysisData.entities.organizations.map((org, index) => (
                          <Badge key={index} variant="outline">{org}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {analysisData.entities?.locations?.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-2 flex items-center">
                        <Globe className="h-4 w-4 mr-2" />
                        Locations
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {analysisData.entities.locations.map((location, index) => (
                          <Badge key={index} variant="outline">{location}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="fact-check" className="space-y-4">
                  <h3 className="font-semibold mb-2 flex items-center">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Fact Check Results
                  </h3>
                  <div className="space-y-3">
                    {analysisData.factCheck?.claims?.length ? (
                      analysisData.factCheck.claims.map((claim, index) => (
                        <div key={index} className={`p-3 rounded-lg ${getVeracityColor(analysisData.factCheck.veracity[index])}`}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium text-sm">{claim}</span>
                            <Badge variant="outline">{analysisData.factCheck.veracity[index]}</Badge>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-sm text-gray-600">No fact-checkable claims were detected.</div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        )}
        
        {/* Article Q&A */}
        {showQA && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <MessageSquare className="h-5 w-5 mr-2" />
                Ask About This Article
              </CardTitle>
              <CardDescription>
                Ask questions about this article. AI will analyze the original article to provide answers.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {qaMessages.length > 0 && (
                <ScrollArea className="h-64 p-2 border rounded-lg">
                  <div className="space-y-4">
                    {qaMessages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[80%] rounded-lg p-3 ${
                            msg.role === 'user'
                              ? 'bg-blue-500 text-white'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          <div className="flex items-start space-x-2">
                            {msg.role === 'assistant' && (
                              <Bot className="h-5 w-5 mt-0.5 text-blue-500 flex-shrink-0" />
                            )}
                            <div>
                              <p className="whitespace-pre-wrap">{msg.content}</p>
                              {msg.sources && msg.sources.length > 0 && (
                                <div className="mt-2">
                                  <p className="text-xs font-medium mb-1">Sources:</p>
                                  <ul className="text-xs">
                                    {msg.sources.map((source, index) => (
                                      <li key={index} className="flex items-center">
                                        <span className="mr-1">•</span>
                                        <span className="truncate">{source}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              <div
                                className={`text-xs mt-1 ${
                                  msg.role === 'user' ? 'text-blue-100' : 'text-gray-500'
                                }`}
                              >
                                {format(msg.createdAt, 'h:mm a')}
                              </div>
                            </div>
                            {msg.role === 'user' && (
                              <User className="h-5 w-5 mt-0.5 text-blue-200 flex-shrink-0" />
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
              
              <div className="flex space-x-2">
                <Input
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Ask a question about this article..."
                  disabled={isAsking}
                  className="flex-1"
                />
                <Button
                  onClick={askQuestion}
                  disabled={!question.trim() || isAsking}
                >
                  {isAsking ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
              
              {qaMessages.length === 0 && (
                <div className="text-center text-sm text-gray-500 mt-2">
                  <p>Try asking questions like:</p>
                  <div className="flex flex-wrap justify-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs cursor-pointer" onClick={() => setQuestion("What is the main point of this article?")}>
                      What is the main point?
                    </Badge>
                    <Badge variant="outline" className="text-xs cursor-pointer" onClick={() => setQuestion("Who are the key people mentioned?")}>
                      Who are mentioned?
                    </Badge>
                    <Badge variant="outline" className="text-xs cursor-pointer" onClick={() => setQuestion("What are the implications of this news?")}>
                      What are the implications?
                    </Badge>
                    <Badge variant="outline" className="text-xs cursor-pointer" onClick={() => setQuestion("Is there any bias in this article?")}>
                      Is there bias?
                    </Badge>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
        
        {/* Keywords */}
        {article.keywords && article.keywords.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Keywords</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {article.keywords.map((keyword, index) => (
                  <Badge key={index} variant="outline">
                    {keyword}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
        
        {/* Article Content */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            {/* Load Full Article Button */}
            {isContentTruncated && !isUpdatingContent && (
              <div className="mb-4 flex justify-center">
                <Button 
                  onClick={fetchFullContent} 
                  disabled={isUpdatingContent}
                  variant="outline"
                >
                  {isUpdatingContent ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Loading full article...
                    </>
                  ) : (
                    'Load Full Article'
                  )}
                </Button>
              </div>
            )}
            
            {/* Article Content */}
            {isUpdatingContent ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
              </div>
            ) : (
              <div className="prose prose-lg max-w-none">
                <p className="text-lg font-medium mb-4 leading-relaxed">{article.description}</p>
                
                {/* Format article content with paragraphs */}
                <div className="space-y-4">
                  {article.content.split('\n\n').map((paragraph, index) => (
                    <p key={index} className="text-gray-700 leading-relaxed">
                      {paragraph.trim()}
                    </p>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Related Articles Section */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4">Related Articles</h2>
          
          {relatedLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[...Array(2)].map((_, i) => (
                <Card key={i} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-3/4" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : relatedArticles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {relatedArticles.map((relatedArticle) => (
                <Card key={relatedArticle.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="secondary" className="text-xs">
                        {relatedArticle.source}
                      </Badge>
                      {relatedArticle.sentiment && (
                        <Badge 
                          variant={
                            relatedArticle.sentiment === 'positive' ? 'default' :
                            relatedArticle.sentiment === 'negative' ? 'destructive' : 'secondary'
                          }
                          className="text-xs"
                        >
                          {relatedArticle.sentiment}
                        </Badge>
                      )}
                    </div>
                    <h3 className="font-medium mb-2 line-clamp-2">
                      <Link 
                        href={`/article/${relatedArticle.id}`} 
                        className="hover:text-blue-600 transition-colors"
                      >
                        {relatedArticle.title}
                      </Link>
                    </h3>
                    <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                      {relatedArticle.description}
                    </p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{format(new Date(relatedArticle.publishedAt), 'MMM d')}</span>
                      <span>{relatedArticle.category}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-gray-500">No related articles found.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}