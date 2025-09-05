// E:\newsgenie\src\app\dashboard\preferences\page.tsx
'use client';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'react-hot-toast';
import { Loader2, Save, Plus, X, Info, Clock, Bell, Mail, Globe, BookOpen } from 'lucide-react';
const CATEGORIES = [
  'general', 'business', 'entertainment', 'health', 
  'science', 'sports', 'technology'
];
const LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Spanish' },
  { value: 'fr', label: 'French' },
  { value: 'de', label: 'German' },
  { value: 'it', label: 'Italian' },
  { value: 'pt', label: 'Portuguese' },
  { value: 'ru', label: 'Russian' },
  { value: 'ja', label: 'Japanese' },
  { value: 'zh', label: 'Chinese' },
];
const COUNTRIES = [
  { value: 'us', label: 'United States' },
  { value: 'gb', label: 'United Kingdom' },
  { value: 'ca', label: 'Canada' },
  { value: 'au', label: 'Australia' },
  { value: 'in', label: 'India' },
  { value: 'de', label: 'Germany' },
  { value: 'fr', label: 'France' },
  { value: 'jp', label: 'Japan' },
  { value: 'br', label: 'Brazil' },
  { value: 'ru', label: 'Russia' },
];
const POPULAR_SOURCES = [
  'bbc-news', 'cnn', 'fox-news', 'the-wall-street-journal', 'the-new-york-times',
  'reuters', 'associated-press', 'bloomberg', 'the-washington-post', 'nbc-news'
];
export default function PreferencesPage() {
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Preferences state
  const [interests, setInterests] = useState<string[]>([]);
  const [sources, setSources] = useState<string[]>([]);
  const [language, setLanguage] = useState('en');
  const [country, setCountry] = useState('us');
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [articlesPerDay, setArticlesPerDay] = useState(20);
  
  // Notification settings
  const [notifyBreakingNews, setNotifyBreakingNews] = useState(true);
  const [notifyNewArticles, setNotifyNewArticles] = useState(true);
  const [notifyDigest, setNotifyDigest] = useState(false);
  const [digestTime, setDigestTime] = useState('08:00');
  
  // New inputs
  const [newInterest, setNewInterest] = useState('');
  const [newSource, setNewSource] = useState('');
  
  useEffect(() => {
    if (status === 'unauthenticated') {
      redirect('/');
    }
  }, [status]);
  
  useEffect(() => {
    if (session) {
      fetchPreferences();
    }
  }, [session]);
  
  const fetchPreferences = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/preferences');
      if (response.ok) {
        const data = await response.json();
        setInterests(data.interests || []);
        setSources(data.sources || []);
        setLanguage(data.language || 'en');
        setCountry(data.country || 'us');
        setEmailNotifications(data.emailNotifications || false);
        setArticlesPerDay(data.articlesPerDay || 20);
        setNotifyBreakingNews(data.notifyBreakingNews ?? true);
        setNotifyNewArticles(data.notifyNewArticles ?? true);
        setNotifyDigest(data.notifyDigest ?? false);
        setDigestTime(data.digestTime || '08:00');
      }
    } catch (error) {
      console.error('Error fetching preferences:', error);
      toast.error('Failed to load preferences');
    } finally {
      setLoading(false);
    }
  };
  
  const savePreferences = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/preferences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          interests,
          sources,
          language,
          country,
          emailNotifications,
          articlesPerDay,
          notifyBreakingNews,
          notifyNewArticles,
          notifyDigest,
          digestTime,
        }),
      });
      
      if (response.ok) {
        toast.success('Preferences saved successfully');
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to save preferences');
      }
    } catch (error) {
      console.error('Error saving preferences:', error);
      toast.error('Error saving preferences');
    } finally {
      setSaving(false);
    }
  };
  
  const addInterest = () => {
    if (newInterest && !interests.includes(newInterest)) {
      setInterests([...interests, newInterest]);
      setNewInterest('');
    }
  };
  
  const removeInterest = (interest: string) => {
    setInterests(interests.filter(i => i !== interest));
  };
  
  const addSource = () => {
    if (newSource && !sources.includes(newSource)) {
      setSources([...sources, newSource]);
      setNewSource('');
    }
  };
  
  const removeSource = (source: string) => {
    setSources(sources.filter(s => s !== source));
  };
  
  const addPopularSource = (source: string) => {
    if (!sources.includes(source)) {
      setSources([...sources, source]);
    }
  };
  
  const handleKeyPress = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === 'Enter') {
      action();
    }
  };
  
  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-gray-600">Loading preferences...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Preferences</h1>
            <p className="text-gray-600 mt-1">
              Customize your news feed and notification settings.
            </p>
          </div>
          <div className="flex items-center space-x-3 mt-4 sm:mt-0">
            <Button onClick={savePreferences} disabled={saving}>
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Save Preferences
            </Button>
          </div>
        </div>
        
        <Tabs defaultValue="content" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="content">Content Preferences</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="account">Account Settings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="content" className="space-y-6">
            {/* Interests */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BookOpen className="h-5 w-5 mr-2" />
                  Your Interests
                </CardTitle>
                <CardDescription>
                  Select topics you&apos;re interested in to personalize your news feed.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {interests.map((interest) => (
                    <Badge key={interest} variant="secondary" className="flex items-center gap-1">
                      {interest}
                      <button 
                        onClick={() => removeInterest(interest)}
                        className="ml-1 rounded-full hover:bg-gray-200"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add an interest..."
                    value={newInterest}
                    onChange={(e) => setNewInterest(e.target.value)}
                    onKeyPress={(e) => handleKeyPress(e, addInterest)}
                  />
                  <Button type="button" onClick={addInterest}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="mt-4">
                  <h4 className="text-sm font-medium mb-2">Popular Categories</h4>
                  <div className="flex flex-wrap gap-2">
                    {CATEGORIES.map((category) => (
                      <Badge 
                        key={category} 
                        variant="outline" 
                        className="cursor-pointer hover:bg-gray-100"
                        onClick={() => !interests.includes(category) && setInterests([...interests, category])}
                      >
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* News Sources */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Globe className="h-5 w-5 mr-2" />
                  News Sources
                </CardTitle>
                <CardDescription>
                  Select your preferred news sources. If none are selected, we&apos;ll show articles from all sources.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {sources.map((source) => (
                    <Badge key={source} variant="secondary" className="flex items-center gap-1">
                      {source}
                      <button 
                        onClick={() => removeSource(source)}
                        className="ml-1 rounded-full hover:bg-gray-200"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a source..."
                    value={newSource}
                    onChange={(e) => setNewSource(e.target.value)}
                    onKeyPress={(e) => handleKeyPress(e, addSource)}
                  />
                  <Button type="button" onClick={addSource}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="mt-4">
                  <h4 className="text-sm font-medium mb-2">Popular Sources</h4>
                  <div className="flex flex-wrap gap-2">
                    {POPULAR_SOURCES.map((source) => (
                      <Badge 
                        key={source} 
                        variant="outline" 
                        className="cursor-pointer hover:bg-gray-100"
                        onClick={() => addPopularSource(source)}
                      >
                        {source.replace('-', ' ')}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Language and Country */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Globe className="h-5 w-5 mr-2" />
                  Language &amp; Region
                </CardTitle>
                <CardDescription>
                  Set your preferred language and region for news content.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <h3 className="text-lg font-medium">Language</h3>
                    <Select value={language} onValueChange={setLanguage}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                      <SelectContent>
                        {LANGUAGES.map((lang) => (
                          <SelectItem key={lang.value} value={lang.value}>
                            {lang.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="text-lg font-medium">Country</h3>
                    <Select value={country} onValueChange={setCountry}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select country" />
                      </SelectTrigger>
                      <SelectContent>
                        {COUNTRIES.map((country) => (
                          <SelectItem key={country.value} value={country.value}>
                            {country.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Content Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BookOpen className="h-5 w-5 mr-2" />
                  Content Settings
                </CardTitle>
                <CardDescription>
                  Control how much content you see each day.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-medium">Articles Per Day</h4>
                  <div className="flex items-center space-x-2">
                    <Input
                      type="number"
                      min="5"
                      max="100"
                      value={articlesPerDay}
                      onChange={(e) => setArticlesPerDay(parseInt(e.target.value) || 20)}
                      className="w-24"
                    />
                    <span className="text-sm text-gray-600">articles</span>
                  </div>
                  <p className="text-xs text-gray-500">
                    We&apos;ll show you up to this many articles per day in your feed.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="notifications" className="space-y-6">
            {/* Notification Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Bell className="h-5 w-5 mr-2" />
                  Notification Settings
                </CardTitle>
                <CardDescription>
                  Choose which notifications you&apos;d like to receive.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Breaking News</h4>
                    <p className="text-sm text-gray-600">
                      Get notified about breaking news in your interests
                    </p>
                  </div>
                  <Switch
                    checked={notifyBreakingNews}
                    onCheckedChange={setNotifyBreakingNews}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">New Articles</h4>
                    <p className="text-sm text-gray-600">
                      Get notified when new articles are published in your interests
                    </p>
                  </div>
                  <Switch
                    checked={notifyNewArticles}
                    onCheckedChange={setNotifyNewArticles}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Daily Digest</h4>
                    <p className="text-sm text-gray-600">
                      Receive a daily summary of top stories
                    </p>
                  </div>
                  <Switch
                    checked={notifyDigest}
                    onCheckedChange={setNotifyDigest}
                  />
                </div>
                
                {notifyDigest && (
                  <div className="ml-4 mt-2 space-y-2">
                    <h4 className="font-medium">Digest Time</h4>
                    <div className="flex items-center space-x-2">
                      <Input
                        type="time"
                        value={digestTime}
                        onChange={(e) => setDigestTime(e.target.value)}
                        className="w-32"
                      />
                      <Clock className="h-4 w-4 text-gray-500" />
                    </div>
                    <p className="text-xs text-gray-500">
                      You&apos;ll receive your daily digest at this time.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Email Notifications */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Mail className="h-5 w-5 mr-2" />
                  Email Notifications
                </CardTitle>
                <CardDescription>
                  Manage your email notification preferences.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Email Notifications</h4>
                    <p className="text-sm text-gray-600">
                      Receive email notifications for important updates
                    </p>
                  </div>
                  <Switch
                    checked={emailNotifications}
                    onCheckedChange={setEmailNotifications}
                  />
                </div>
                
                {emailNotifications && (
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-start">
                      <Info className="h-5 w-5 text-blue-500 mt-0.5 mr-2" />
                      <div>
                        <h4 className="font-medium text-blue-800">Email Notifications</h4>
                        <p className="text-sm text-blue-700 mt-1">
                          We&apos;ll send notifications to your registered email address: {session?.user?.email}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="account" className="space-y-6">
            {/* Account Information */}
            <Card>
              <CardHeader>
                <CardTitle>Account Information</CardTitle>
                <CardDescription>
                  View and manage your account details.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Name</h4>
                    <p className="text-sm">{session?.user?.name || 'Not provided'}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Email</h4>
                    <p className="text-sm">{session?.user?.email || 'Not provided'}</p>
                  </div>
                </div>
                <div className="mt-6">
                  <Button variant="outline" onClick={() => window.open('/api/auth/signout', '_self')}>
                    Sign Out
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            {/* Data Management */}
            <Card>
              <CardHeader>
                <CardTitle>Data Management</CardTitle>
                <CardDescription>
                  Manage your personal data and account settings.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-yellow-50 rounded-lg">
                  <div className="flex items-start">
                    <Info className="h-5 w-5 text-yellow-500 mt-0.5 mr-2" />
                    <div>
                      <h4 className="font-medium text-yellow-800">Data Deletion</h4>
                      <p className="text-sm text-yellow-700 mt-1">
                        If you&apos;d like to delete your account and all associated data, please contact support.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}