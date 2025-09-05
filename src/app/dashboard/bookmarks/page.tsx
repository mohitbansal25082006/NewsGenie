'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, ExternalLink, BookmarkCheck, Calendar, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';
import toast, { Toaster } from 'react-hot-toast';

interface BookmarkedArticle {
  id: string;
  createdAt: string;
  article: {
    id: string;
    title: string;
    description: string;
    url: string;
    urlToImage: string;
    publishedAt: string;
    source: string;
    author: string;
    summary?: string;
    sentiment?: string;
    keywords?: string[];
  };
}

export default function BookmarksPage() {
  const { data: session, status } = useSession();
  const [bookmarks, setBookmarks] = useState<BookmarkedArticle[]>([]);
  const [loading, setLoading] = useState(true);

  // Redirect if not authenticated
  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  if (status === 'unauthenticated') {
    redirect('/');
  }

  // Fetch bookmarks
  const fetchBookmarks = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/bookmarks');
      const data = await response.json();

      if (response.ok) {
        setBookmarks(data);
      } else {
        toast.error('Failed to fetch bookmarks');
      }
    } catch (error) {
      toast.error('Error fetching bookmarks');
    } finally {
      setLoading(false);
    }
  };

  // Remove bookmark
  const removeBookmark = async (articleId: string) => {
    try {
      const response = await fetch(`/api/bookmarks?articleId=${articleId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setBookmarks(prev => prev.filter(b => b.article.id !== articleId));
        toast.success('Bookmark removed');
      } else {
        toast.error('Failed to remove bookmark');
      }
    } catch (error) {
      toast.error('Error removing bookmark');
    }
  };

  useEffect(() => {
    if (session) {
      fetchBookmarks();
    }
  }, [session]);

  // Bookmark Card Component
  const BookmarkCard = ({ bookmark }: { bookmark: BookmarkedArticle }) => {
    const { article } = bookmark;
    
    return (
      <Card className="mb-4 hover:shadow-lg transition-shadow">
        <CardContent className="p-0">
          <div className="flex flex-col md:flex-row">
            {article.urlToImage && (
              <div className="md:w-1/3">
                <img 
                  src={article.urlToImage} 
                  alt={article.title}
                  className="w-full h-48 md:h-full object-cover rounded-t-lg md:rounded-l-lg md:rounded-t-none"
                />
              </div>
            )}
            <div className={`p-6 ${article.urlToImage ? 'md:w-2/3' : 'w-full'}`}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2 mb-2">
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
                  <Badge variant="outline">
                    <BookmarkCheck className="h-3 w-3 mr-1" />
                    Saved {format(new Date(bookmark.createdAt), 'MMM d')}
                  </Badge>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeBookmark(article.id)}
                  className="text-red-600 hover:text-red-800"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              
              <h3 className="text-lg font-semibold mb-2 line-clamp-2">
                {article.title}
              </h3>
              
              <p className="text-gray-600 mb-3 line-clamp-2">
                {article.description}
              </p>
              
              {article.summary && (
                <div className="bg-blue-50 p-3 rounded-md mb-3">
                  <p className="text-sm text-blue-800">
                    <strong>AI Summary:</strong> {article.summary}
                  </p>
                </div>
              )}
              
              {article.keywords && article.keywords.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {article.keywords.slice(0, 3).map((keyword, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {keyword}
                    </Badge>
                  ))}
                </div>
              )}
              
              <div className="flex items-center justify-between text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {format(new Date(article.publishedAt), 'MMM d, yyyy')}
                  {article.author && (
                    <>
                      <span>•</span>
                      <span>{article.author}</span>
                    </>
                  )}
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                >
                  <a 
                    href={article.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-1"
                  >
                    Read Article <ExternalLink className="h-3 w-3" />
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Toaster position="top-right" />
      
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link href="/dashboard">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Bookmarks</h1>
          <p className="text-gray-600">
            {bookmarks.length} saved article{bookmarks.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Bookmarks List */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="flex space-x-4">
                  <Skeleton className="h-24 w-24 rounded" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : bookmarks.length > 0 ? (
        <div className="space-y-4">
          {bookmarks.map((bookmark) => (
            <BookmarkCard key={bookmark.id} bookmark={bookmark} />
          ))}
        </div>
      ) : (
        <Alert>
          <AlertDescription>
            You haven't bookmarked any articles yet. Start exploring news and bookmark articles you'd like to read later!
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}