'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Area, AreaChart
} from 'recharts';
import { 
  BookOpen, 
  TrendingUp, 
  Clock, 
  Heart, 
  Download,
  Calendar,
  Target,
  Activity
} from 'lucide-react';
import { toast } from 'sonner';

interface Analytics {
  totalRead: number;
  totalBookmarks: number;
  readingStreak: number;
  avgReadingTime: number;
  favoriteCategory: string;
  categoryBreakdown: any[];
  readingTrend: any[];
  topTopics: any[];
  sentimentBreakdown: any[];
  weeklyActivity: any[];
}

export default function AnalyticsPage() {
  const { data: session, status } = useSession();
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [exportingPDF, setExportingPDF] = useState(false);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchAnalytics();
    }
  }, [status]);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch('/api/analytics');
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  const exportAnalytics = async () => {
    try {
      setExportingPDF(true);
      const response = await fetch('/api/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type: 'analytics', format: 'pdf' }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = 'analytics-report.pdf';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        toast.success('Analytics report exported successfully!');
      }
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Failed to export analytics report');
    } finally {
      setExportingPDF(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">Analytics</h1>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div className="h-4 bg-gray-300 rounded w-24"></div>
                  <div className="h-4 w-4 bg-gray-300 rounded"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-6 bg-gray-300 rounded w-16 mb-1"></div>
                  <div className="h-3 bg-gray-300 rounded w-32"></div>
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
        <h1 className="text-2xl font-bold mb-4">Please sign in to view analytics</h1>
      </div>
    );
  }

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid gap-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
            <p className="text-gray-600 mt-2">Track your reading habits and preferences</p>
          </div>
          <Button onClick={exportAnalytics} disabled={exportingPDF}>
            <Download className="mr-2 h-4 w-4" />
            {exportingPDF ? 'Exporting...' : 'Export Report'}
          </Button>
        </div>

        {/* Key Metrics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Articles Read</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics?.totalRead || 0}</div>
              <p className="text-xs text-muted-foreground">
                Total articles consumed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Bookmarks</CardTitle>
              <Heart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics?.totalBookmarks || 0}</div>
              <p className="text-xs text-muted-foreground">
                Saved for later
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Reading Streak</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics?.readingStreak || 0}</div>
              <p className="text-xs text-muted-foreground">
                Days in a row
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Reading Time</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics?.avgReadingTime || 0}m</div>
              <p className="text-xs text-muted-foreground">
                Per article
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Analytics */}
        <Tabs defaultValue="categories" className="space-y-4">
          <TabsList>
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="trends">Reading Trends</TabsTrigger>
            <TabsTrigger value="topics">Top Topics</TabsTrigger>
            <TabsTrigger value="sentiment">Sentiment</TabsTrigger>
          </TabsList>

          <TabsContent value="categories">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Category Breakdown</CardTitle>
                  <CardDescription>Your reading distribution by category</CardDescription>
                </CardHeader>
                <CardContent>
                  {analytics?.categoryBreakdown && analytics.categoryBreakdown.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={analytics.categoryBreakdown}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {analytics.categoryBreakdown.map((entry: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      No reading data available yet
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Favorite Category</CardTitle>
                  <CardDescription>Your most read category</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <div className="text-4xl font-bold text-primary mb-2">
                      {analytics?.favoriteCategory || 'None'}
                    </div>
                    <Badge variant="secondary" className="capitalize">
                      Top Choice
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="trends">
            <Card>
              <CardHeader>
                <CardTitle>Reading Activity</CardTitle>
                <CardDescription>Your reading pattern over time</CardDescription>
              </CardHeader>
              <CardContent>
                {analytics?.readingTrend && analytics.readingTrend.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={analytics.readingTrend}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Area type="monotone" dataKey="articles" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    Start reading to see your activity trends
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="topics">
            <Card>
              <CardHeader>
                <CardTitle>Top Topics</CardTitle>
                <CardDescription>Topics you read about most</CardDescription>
              </CardHeader>
              <CardContent>
                {analytics?.topTopics && analytics.topTopics.length > 0 ? (
                  <div className="space-y-4">
                    {analytics.topTopics.map((topic: any, index: number) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Badge variant="outline">{index + 1}</Badge>
                          <span className="font-medium">{topic.name}</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Progress value={(topic.count / analytics.topTopics[0].count) * 100} className="w-24" />
                          <span className="text-sm text-gray-600 w-12">{topic.count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    Read more articles to see your top topics
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sentiment">
            <Card>
              <CardHeader>
                <CardTitle>Reading Sentiment</CardTitle>
                <CardDescription>Emotional tone of articles you read</CardDescription>
              </CardHeader>
              <CardContent>
                {analytics?.sentimentBreakdown && analytics.sentimentBreakdown.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={analytics.sentimentBreakdown}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="sentiment" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    Sentiment analysis will appear as you read more articles
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Weekly Activity */}
        {analytics?.weeklyActivity && analytics.weeklyActivity.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Weekly Activity</CardTitle>
              <CardDescription>Your reading pattern by day of the week</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={analytics.weeklyActivity}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="articles" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}