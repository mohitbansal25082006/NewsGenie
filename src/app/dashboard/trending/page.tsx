'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Clock,
  RefreshCw,
  ExternalLink,
  Heart
} from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

interface TrendingTopic {
  id: string;
  topic: string;
  score: number;
  category: string;
  mentions: number;
  sentiment: string;
  createdAt: string;
  articles: Array<{
    id: string;
    title: string;
    description: string;
    url: string;
    source: string;
    publishedAt: string;
  }>;
}

export default function TrendingPage() {
  const { data: session, status } = useSession();
  const [trendingTopics, setTrendingTopics] = useState<TrendingTopic[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchTrendingTopics();
    }
  }, [status]);

  const fetchTrendingTopics = async () => {
    try {
      const response = await fetch('/api/trending');
      if (response.ok) {
        const data = await response.json();
        setTrendingTopics(data);
      }
    } catch (error) {
      console.error('Failed to fetch trending topics:', error);
      toast.error('Failed to load trending topics');
    } finally {
      setLoading(false);
    }
  };

  const refreshTrendingAnalysis = async () => {
    try {
      setRefreshing(true);
      toast.info('Analyzing latest trends...');
      
      const response = await fetch('/api/trending', {
        method: 'POST',
      });
      
      if (response.ok) {
        const result = await response.json();
        toast.success(`Updated trending topics! Found ${result.topics || 0} trends.`);
        await fetchTrendingTopics();
      }
    } catch (error) {
      console.error('Failed to refresh trending analysis:', error);
      toast.error('Failed to refresh trending analysis');
    } finally {
      setRefreshing(false);
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'text-green-600 bg-green-100';
      case 'negative': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return <TrendingUp className="h-4 w-4" />;
      case 'negative': return <TrendingDown className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">Trending Topics</h1>
          </div>
          <div className="grid gap-4">
            {[...Array(6)].map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-4 w-32" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-3/4" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Please sign in to view trending topics</h1>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid gap-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Trending Topics</h1>
            <p className="text-gray-600 mt-2">
              AI-powered analysis of what's trending in the news
            </p>
          </div>
          <Button onClick={refreshTrendingAnalysis} disabled={refreshing}>
            <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Analyzing...' : 'Refresh Analysis'}
          </Button>
        </div>

        {/* Trending Topics Grid */}
        {trendingTopics.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No trending topics yet</h3>
              <p className="text-gray-600 mb-4">
                Trending analysis will appear as more articles are processed
              </p>
              <Button onClick={refreshTrendingAnalysis} disabled={refreshing}>
                <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                Start Analysis
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {trendingTopics.map((topic, index) => (
              <Card key={topic.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <Badge variant="secondary" className="text-xs">
                        #{index + 1}
                      </Badge>
                      <div>
                        <CardTitle className="text-xl">{topic.topic}</CardTitle>
                        <CardDescription className="flex items-center space-x-4 mt-2">
                          <Badge className="capitalize">{topic.category}</Badge>
                          <Badge variant="outline" className={getSentimentColor(topic.sentiment)}>
                            {getSentimentIcon(topic.sentiment)}
                            <span className="ml-1 capitalize">{topic.sentiment}</span>
                          </Badge>
                          <span className="flex items-center text-sm text-gray-500">
                            <Activity className="h-3 w-3 mr-1" />
                            {topic.mentions} mentions
                          </span>
                          <span className="flex items-center text-sm text-gray-500">
                            <TrendingUp className="h-3 w-3 mr-1" />
                            Score: {topic.score.toFixed(2)}
                          </span>
                        </CardDescription>
                      </div>
                    </div>
                    <Badge variant="outline" className="ml-2">
                      <Clock className="h-3 w-3 mr-1" />
                      {new Date(topic.createdAt).toLocaleDateString()}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <h4 className="font-semibold mb-3">Related Articles:</h4>
                  <div className="grid gap-3">
                    {topic.articles.slice(0, 3).map((article) => (
                      <div key={article.id} className="border rounded-lg p-3 hover:bg-gray-50 transition-colors">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <h5 className="font-medium text-sm mb-1 line-clamp-2">
                              {article.title}
                            </h5>
                            <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                              {article.description}
                            </p>
                            <div className="flex items-center space-x-3 text-xs text-gray-500">
                              <span>{article.source}</span>
                              <span>•</span>
                              <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            asChild
                            className="ml-2 flex-shrink-0"
                          >
                            <Link href={article.url} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-3 w-3" />
                            </Link>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {topic.articles.length > 3 && (
                    <div className="mt-3 text-center">
                      <Badge variant="outline">
                        +{topic.articles.length - 3} more articles
                      </Badge>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}