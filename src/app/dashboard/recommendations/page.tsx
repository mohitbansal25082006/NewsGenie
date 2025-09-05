'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Heart, 
  ExternalLink, 
  Clock,
  RefreshCw,
  Star,
  TrendingUp,
  Sparkles,
  BookOpen
} from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

interface RecommendedArticle {
  id: string;
  title: string;
  description: string;
  url: string;
  urlToImage: string;
  source: string;
  category: string;
  publishedAt: string;
  summary: string;
  sentiment: string;
  keywords: string[];
  topics: string[];
  importance: number;
}

export default function RecommendationsPage() {
  const { data: session, status } = useSession();
  const [recommendations, setRecommendations] = useState<RecommendedArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchRecommendations();
    }
  }, [status]);

  const fetchRecommendations = async () => {
    try {
      const response = await fetch('/api/recommendations');
      if (response.ok) {
        const data = await response.json();
        setRecommendations(data);
      }
    } catch (error) {
      console.error('Failed to fetch recommendations:', error);
      toast.error('Failed to load recommendations');
    } finally {
      setLoading(false);
    }
  };

  const refreshRecommendations = async () => {
    try {
      setRefreshing(true);
      await fetchRecommendations();
      toast.success('Recommendations refreshed!');
    } catch (error) {
      toast.error('Failed to refresh recommendations');
    } finally {
      setRefreshing(false);
    }
  };

  const bookmarkArticle = async (articleId: string) => {
    try {
      const response = await fetch('/api/bookmarks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ articleId }),
      });

      if (response.ok) {
        toast.success('Article bookmarked!');
      } else {
        const error = await response.json();
        if (error.message === 'Article already bookmarked') {
          toast.info('Article is already bookmarked');
        } else {
          toast.error('Failed to bookmark article');
        }
      }
    } catch (error) {
      console.error('Bookmark error:', error);
      toast.error('Failed to bookmark article');
    }
  };

  const markAsRead = async (articleId: string) => {
    try {
      await fetch('/api/read-articles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ articleId }),
      });
    } catch (error) {
      console.error('Mark as read error:', error);
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'text-green-600 bg-green-100';
      case 'negative': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getImportanceStars = (importance: number) => {
    const stars = Math.round(importance * 5);
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-3 w-3 ${
          i < stars ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  if (status === 'loading' || loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">AI Recommendations</h1>
          </div>
          <div className="grid gap-4">
            {[...Array(5)].map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-5/6 mb-4" />
                  <div className="flex space-x-2">
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="h-6 w-18" />
                  </div>
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
        <h1 className="text-2xl font-bold mb-4">Please sign in to view recommendations</h1>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid gap-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold flex items-center">
              <Sparkles className="mr-3 h-8 w-8 text-primary" />
              AI Recommendations
            </h1>
            <p className="text-gray-600 mt-2">
              Personalized articles based on your reading habits and preferences
            </p>
          </div>
          <Button onClick={refreshRecommendations} disabled={refreshing}>
            <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>

        {/* Recommendations */}
        {recommendations.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Sparkles className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No recommendations yet</h3>
              <p className="text-gray-600 mb-4">
                Start reading articles to get personalized AI recommendations
              </p>
              <Button asChild>
                <Link href="/dashboard">
                  <BookOpen className="mr-2 h-4 w-4" />
                  Browse Articles
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {recommendations.map((article, index) => (
              <Card key={article.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <Badge variant="secondary" className="text-xs">
                        #{index + 1}
                      </Badge>
                      <div className="flex items-center space-x-1">
                        {getImportanceStars(article.importance)}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className="capitalize">{article.category}</Badge>
                      <Badge variant="outline" className={getSentimentColor(article.sentiment)}>
                        {article.sentiment}
                      </Badge>
                    </div>
                  </div>
                  <CardTitle className="text-xl leading-tight mt-2">
                    {article.title}
                  </CardTitle>
                  <CardDescription className="text-sm">
                    <div className="flex items-center space-x-4 text-gray-500">
                      <span>{article.source}</span>
                      <span>•</span>
                      <span className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {new Date(article.publishedAt).toLocaleDateString()}
                      </span>
                      <span>•</span>
                      <span className="flex items-center">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        {(article.importance * 100).toFixed(0)}% importance
                      </span>
                    </div>
                  </CardDescription>
                </CardHeader>

                <CardContent>
                  <div className="grid md:grid-cols-3 gap-4">
                    {/* Article Image */}
                    {article.urlToImage && (
                      <div className="md:col-span-1">
                        <img
                          src={article.urlToImage}
                          alt={article.title}
                          className="w-full h-48 md:h-32 object-cover rounded-lg"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                    
                    {/* Article Content */}
                    <div className={article.urlToImage ? 'md:col-span-2' : 'md:col-span-3'}>
                      <p className="text-gray-700 mb-3 line-clamp-3">
                        {article.description}
                      </p>
                      
                      {/* AI Summary */}
                      {article.summary && (
                        <div className="bg-blue-50 border-l-4 border-blue-400 p-3 mb-3 rounded-r-lg">
                          <h4 className="font-medium text-blue-800 mb-1 flex items-center">
                            <Sparkles className="h-4 w-4 mr-1" />
                            AI Summary
                          </h4>
                          <p className="text-blue-700 text-sm">{article.summary}</p>
                        </div>
                      )}

                      {/* Keywords and Topics */}
                      <div className="space-y-2 mb-4">
                        {article.keywords && article.keywords.length > 0 && (
                          <div>
                            <span className="text-xs font-medium text-gray-500 mr-2">Keywords:</span>
                            <div className="inline-flex flex-wrap gap-1">
                              {article.keywords.slice(0, 5).map((keyword, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs">
                                  {keyword}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {article.topics && article.topics.length > 0 && (
                          <div>
                            <span className="text-xs font-medium text-gray-500 mr-2">Topics:</span>
                            <div className="inline-flex flex-wrap gap-1">
                              {article.topics.slice(0, 3).map((topic, idx) => (
                                <Badge key={idx} variant="secondary" className="text-xs">
                                  {topic}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center space-x-2">
                        <Button
                          asChild
                          size="sm"
                          onClick={() => markAsRead(article.id)}
                        >
                          <Link href={article.url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4 mr-1" />
                            Read Article
                          </Link>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => bookmarkArticle(article.id)}
                        >
                          <Heart className="h-4 w-4 mr-1" />
                          Bookmark
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}