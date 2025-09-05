// E:\newsgenie\src\app\article\[id]\page.tsx
'use client';
import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, BookmarkPlus, BookmarkCheck, ExternalLink, Share, Clock, User, Calendar } from 'lucide-react';
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
  sentiment?: string;
  keywords?: string[];
}

interface Bookmark {
  id: string;
  articleId: string;
  userId: string;
  createdAt: string;
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
  
  const fetchArticle = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/article/${articleId}`);
      if (response.ok) {
        const data = await response.json();
        setArticle(data);
        // Mark article as read
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
    }
  }, [articleId, session, router]);
  
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
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(article?.url || '');
      toast.success('Link copied to clipboard');
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
            <Badge 
              variant={
                article.sentiment === 'positive' ? 'default' :
                article.sentiment === 'negative' ? 'destructive' : 'secondary'
              }
            >
              {article.sentiment}
            </Badge>
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
                target.style.display = 'none';
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
        <Card>
          <CardContent className="pt-6">
            <div className="prose max-w-none">
              <p className="text-lg font-medium mb-4">{article.description}</p>
              <div className="whitespace-pre-line">{article.content}</div>
            </div>
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