'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';
import { Search, BookmarkPlus, BookmarkCheck, ExternalLink, TrendingUp, Calendar, Heart, Eye, Settings, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';
import toast, { Toaster } from 'react-hot-toast';

interface Article {
  id: string;
  title: string;
  description: string;
  url: string;
  urlToImage: string;
  publishedAt: string;
  source: { name: string };
  author: string;
  summary?: string;
  sentiment?: string;
  keywords?: string[];
}

interface Analytics {
  readingStats: { date: string; count: number }[];
  categoryDistribution: Record<string, number>;
  sentimentDistribution: Record<string, number>;
  totalRead: number;
  totalBookmarks: number;
  todayRead: number;
}

const CATEGORIES = [
  'general', 'business', 'entertainment', 'health', 
  'science', 'sports', 'technology'
];

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1'];

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const [articles, setArticles] = useState<Article[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [category, setCategory] = useState('general');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Article[]>([]);
  const [searching, setSearching] = useState(false);

  // Redirect if not authenticated
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    redirect('/');
  }

  // Fetch news articles
  const fetchNews = async (selectedCategory = category, query = '') => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        category: selectedCategory,
        pageSize: '20',
      });

      if (query) {
        params.append('q', query);
      }

      const response = await fetch(`/api/news?${params.toString()}`);
      const data = await response.json();

      if (response.ok) {
        if (query) {
          setSearchResults(data.articles || []);
        } else {
          setArticles(data.articles || []);
        }
      } else {
        console.error('News fetch error:', data);
        toast.error(data.error || 'Failed to fetch news');
      }
    } catch (error) {
      console.error('Fetch error:', error);
      toast.error('Error fetching news');
    } finally {
      setLoading(false);
      setSearching(false);
    }
  };

  // Fetch analytics
  const fetchAnalytics = async () => {
    setAnalyticsLoading(true);
    try {
      const response = await fetch('/api/analytics');
      const data = await response.json();

      if (response.ok) {
        setAnalytics(data);
      } else {
        console.error('Analytics fetch error:', data);
        toast.error(data.error || 'Failed to fetch analytics');
      }
    } catch (error) {
      console.error('Analytics error:', error);
      toast.error('Error fetching analytics');
    } finally {
      setAnalyticsLoading(false);
    }
  };

  // Fetch bookmarks
  const fetchBookmarks = async () => {
    try {
      const response = await fetch('/api/bookmarks');
      const data = await response.json();

      if (response.ok) {
        setBookmarks(data.map((b: any) => b.articleId));
      } else {
        console.error('Bookmarks fetch error:', data);
      }
    } catch (error) {
      console.error('Error fetching bookmarks:', error);
    }
  };

  // Toggle bookmark
  const toggleBookmark = async (articleId: string) => {
    try {
      const isBookmarked = bookmarks.includes(articleId);
      
      if (isBookmarked) {
        const response = await fetch(`/api/bookmarks?articleId=${articleId}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          setBookmarks(prev => prev.filter(id => id !== articleId));
          toast.success('Bookmark removed');
        } else {
          const data = await response.json();
          toast.error(data.error || 'Failed to remove bookmark');
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
          setBookmarks(prev => [...prev, articleId]);
          toast.success('Article bookmarked');
        } else {
          const data = await response.json();
          toast.error(data.error || 'Failed to bookmark article');
        }
      }
    } catch (error) {
      console.error('Bookmark error:', error);
      toast.error('Error updating bookmark');
    }
  };

  // Mark article as read
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
      console.error('Error marking article as read:', error);
    }
  };

  // Handle search
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      toast.error('Please enter a search term');
      return;
    }

    setSearching(true);
    await fetchNews(category, searchQuery);
  };

  // Clear search
  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
  };

  // Handle category change
  const handleCategoryChange = (newCategory: string) => {
    setCategory(newCategory);
    setSearchQuery('');
    setSearchResults([]);
    fetchNews(newCategory);
  };

  // Load data on component mount
  useEffect(() => {
    if (session) {
      fetchNews();
      fetchAnalytics();
      fetchBookmarks();
    }
  }, [session]);

  // Article Card Component
  const ArticleCard = ({ article }: { article: Article }) => {
    const isBookmarked = bookmarks.includes(article.id);
    
    return (
      <Card className="mb-4 hover:shadow-lg transition-shadow duration-200">
        <CardContent className="p-0">
          <div className="flex flex-col md:flex-row">
            {article.urlToImage && (
              <div className="md:w-1/3">
                <img 
                  src={article.urlToImage} 
                  alt={article.title}
                  className="w-full h-48 md:h-full object-cover rounded-t-lg md:rounded-l-lg md:rounded-t-none"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
              </div>
            )}
            <div className={`p-6 ${article.urlToImage ? 'md:w-2/3' : 'w-full'}`}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <Badge variant="secondary" className="text-xs">
                    {article.source.name}
                  </Badge>
                  {article.sentiment && (
                    <Badge 
                      variant={
                        article.sentiment === 'positive' ? 'default' :
                        article.sentiment === 'negative' ? 'destructive' : 'secondary'
                      }
                      className="text-xs"
                    >
                      {article.sentiment}
                    </Badge>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleBookmark(article.id)}
                  className="ml-2 flex-shrink-0"
                  title={isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
                >
                  {isBookmarked ? (
                    <BookmarkCheck className="h-4 w-4 text-blue-600" />
                  ) : (
                    <BookmarkPlus className="h-4 w-4" />
                  )}
                </Button>
              </div>
              
              <h3 className="text-lg font-semibold mb-2 line-clamp-2 leading-tight">
                {article.title}
              </h3>
              
              {article.description && (
                <p className="text-gray-600 mb-3 line-clamp-2 text-sm">
                  {article.description}
                </p>
              )}
              
              {article.summary && (
                <div className="bg-blue-50 border-l-4 border-blue-400 p-3 rounded-r-md mb-3">
                  <p className="text-sm text-blue-800">
                    <strong className="font-medium">AI Summary:</strong> {article.summary}
                  </p>
                </div>
              )}
              
              {article.keywords && article.keywords.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {article.keywords.slice(0, 4).map((keyword, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {keyword}
                    </Badge>
                  ))}
                  {article.keywords.length > 4 && (
                    <Badge variant="outline" className="text-xs">
                      +{article.keywords.length - 4} more
                    </Badge>
                  )}
                </div>
              )}
              
              <div className="flex items-center justify-between text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>{format(new Date(article.publishedAt), 'MMM d, yyyy')}</span>
                  {article.author && (
                    <>
                      <span>•</span>
                      <span className="truncate max-w-[120px]">{article.author}</span>
                    </>
                  )}
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                  onClick={() => markAsRead(article.id)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  <a 
                    href={article.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-1"
                  >
                    Read More <ExternalLink className="h-3 w-3" />
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  // Loading Skeleton
  const LoadingSkeleton = () => (
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => (
        <Card key={i}>
          <CardContent className="p-6">
            <div className="flex space-x-4">
              <Skeleton className="h-24 w-24 rounded flex-shrink-0" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <div className="flex space-x-2">
                  <Skeleton className="h-3 w-12" />
                  <Skeleton className="h-3 w-12" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  // Analytics Charts
  const renderAnalytics = () => {
    if (analyticsLoading) {
      return (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-4 w-[120px]" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-[60px]" />
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[...Array(3)].map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-4 w-[200px]" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-[200px]" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      );
    }

    if (!analytics) return null;

    const categoryData = Object.entries(analytics.categoryDistribution).map(([key, value]) => ({
      name: key.charAt(0).toUpperCase() + key.slice(1),
      value,
    }));

    const sentimentData = Object.entries(analytics.sentimentDistribution).map(([key, value]) => ({
      name: key.charAt(0).toUpperCase() + key.slice(1),
      value,
    }));

    return (
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Articles Read Today</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.todayRead}</div>
              <p className="text-xs text-muted-foreground">
                {analytics.todayRead > 0 ? '+' : ''}
                {analytics.todayRead} from yesterday
              </p>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Articles Read</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.totalRead}</div>
              <p className="text-xs text-muted-foreground">
                All time reading count
              </p>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Saved Bookmarks</CardTitle>
              <Heart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.totalBookmarks}</div>
              <p className="text-xs text-muted-foreground">
                Articles saved for later
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {analytics.readingStats.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Reading Activity (Last 7 Days)</CardTitle>
                <CardDescription>Your daily reading pattern</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={analytics.readingStats}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 12 }}
                      tickFormatter={(date) => format(new Date(date), 'MMM d')}
                    />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip 
                      labelFormatter={(date) => format(new Date(date), 'MMM d, yyyy')}
                      formatter={(value) => [value, 'Articles Read']}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="count" 
                      stroke="#8884d8" 
                      strokeWidth={2}
                      dot={{ fill: '#8884d8' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
          
          {categoryData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Category Distribution</CardTitle>
                <CardDescription>Your reading interests</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
          
          {sentimentData.length > 0 && (
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-lg">Sentiment Analysis</CardTitle>
                <CardDescription>Emotional tone of articles you read</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={sentimentData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Empty State for Analytics */}
        {analytics.totalRead === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <div className="text-gray-500">
                <TrendingUp className="h-12 w-12 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No reading data yet</h3>
                <p className="text-sm">
                  Start reading articles to see your analytics here. Click on articles in the news feed to begin!
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-right" />
      
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-1">
              Welcome back, {session?.user?.name || 'User'}! Stay informed with personalized news.
            </p>
          </div>
          <div className="flex items-center space-x-3 mt-4 sm:mt-0">
            <Link href="/dashboard/bookmarks">
              <Button variant="outline" size="sm">
                <Heart className="h-4 w-4 mr-2" />
                Bookmarks ({bookmarks.length})
              </Button>
            </Link>
            <Link href="/dashboard/preferences">
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Preferences
              </Button>
            </Link>
          </div>
        </div>

        <Tabs defaultValue="news" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="news" className="flex items-center space-x-2">
              <Search className="h-4 w-4" />
              <span>News Feed</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4" />
              <span>Analytics</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="news" className="space-y-6">
            {/* Controls */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <form onSubmit={handleSearch} className="flex gap-2">
                      <Input
                        type="text"
                        placeholder="Search news articles..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="flex-1"
                      />
                      <Button type="submit" disabled={searching}>
                        {searching ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Search className="h-4 w-4" />
                        )}
                      </Button>
                      {searchQuery && (
                        <Button type="button" variant="outline" onClick={clearSearch}>
                          Clear
                        </Button>
                      )}
                    </form>
                  </div>
                  
                  <Select value={category} onValueChange={handleCategoryChange}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat.charAt(0).toUpperCase() + cat.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Search Results */}
            {searchQuery && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold">
                    Search Results for "{searchQuery}"
                  </h2>
                  <Badge variant="secondary">
                    {searchResults.length} result{searchResults.length !== 1 ? 's' : ''}
                  </Badge>
                </div>
                
                {searching ? (
                  <LoadingSkeleton />
                ) : searchResults.length > 0 ? (
                  <div className="space-y-4">
                    {searchResults.map((article) => (
                      <ArticleCard key={article.url} article={article} />
                    ))}
                  </div>
                ) : (
                  <Alert>
                    <Search className="h-4 w-4" />
                    <AlertDescription>
                      No articles found for "{searchQuery}". Try different keywords or browse by category.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}

            {/* News Feed */}
            {!searchQuery && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold capitalize">
                    {category} News
                  </h2>
                  <Badge variant="secondary">
                    {articles.length} article{articles.length !== 1 ? 's' : ''}
                  </Badge>
                </div>
                
                {loading ? (
                  <LoadingSkeleton />
                ) : articles.length > 0 ? (
                  <div className="space-y-4">
                    {articles.map((article) => (
                      <ArticleCard key={article.url} article={article} />
                    ))}
                  </div>
                ) : (
                  <Alert>
                    <AlertDescription>
                      No articles found for {category} category. Try a different category or check back later.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-4">Your Reading Analytics</h2>
              <p className="text-gray-600 mb-6">
                Track your reading habits and discover insights about your news consumption patterns.
              </p>
              {renderAnalytics()}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}