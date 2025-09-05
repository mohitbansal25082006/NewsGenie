'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Save, Check } from 'lucide-react';
import Link from 'next/link';
import toast, { Toaster } from 'react-hot-toast';

const CATEGORIES = [
  { value: 'general', label: 'General' },
  { value: 'business', label: 'Business' },
  { value: 'entertainment', label: 'Entertainment' },
  { value: 'health', label: 'Health' },
  { value: 'science', label: 'Science' },
  { value: 'sports', label: 'Sports' },
  { value: 'technology', label: 'Technology' },
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
];

const LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Spanish' },
  { value: 'fr', label: 'French' },
  { value: 'de', label: 'German' },
  { value: 'it', label: 'Italian' },
  { value: 'pt', label: 'Portuguese' },
  { value: 'zh', label: 'Chinese' },
  { value: 'ja', label: 'Japanese' },
];

interface UserPreferences {
  interests: string[];
  sources: string[];
  language: string;
  country: string;
  emailNotifications: boolean;
  articlesPerDay: number;
}

export default function PreferencesPage() {
  const { data: session, status } = useSession();
  const [preferences, setPreferences] = useState<UserPreferences>({
    interests: ['general'],
    sources: [],
    language: 'en',
    country: 'us',
    emailNotifications: false,
    articlesPerDay: 20,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Fetch preferences
  const fetchPreferences = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/preferences');
      const data = await response.json();

      if (response.ok) {
        setPreferences(data);
      } else {
        toast.error('Failed to load preferences');
      }
    } catch (error) {
      toast.error('Error loading preferences');
    } finally {
      setLoading(false);
    }
  };

  // Save preferences
  const savePreferences = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/preferences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(preferences),
      });

      if (response.ok) {
        toast.success('Preferences saved successfully!');
      } else {
        toast.error('Failed to save preferences');
      }
    } catch (error) {
      toast.error('Error saving preferences');
    } finally {
      setSaving(false);
    }
  };

  // Toggle interest
  const toggleInterest = (interest: string) => {
    setPreferences(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(c => c !== interest)
        : [...prev.interests, interest],
    }));
  };

  useEffect(() => {
    if (session) {
      fetchPreferences();
    }
  }, [session]);

  // Redirect if not authenticated
  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  if (status === 'unauthenticated') {
    redirect('/');
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-6">
          <Skeleton className="h-8 w-48" />
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

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
          <h1 className="text-3xl font-bold text-gray-900">Preferences</h1>
          <p className="text-gray-600">Customize your news experience</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Categories */}
        <Card>
          <CardHeader>
            <CardTitle>News Categories</CardTitle>
            <CardDescription>
              Select the categories you&apos;re interested in
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {CATEGORIES.map((category) => (
                <div
                  key={category.value}
                  onClick={() => toggleInterest(category.value)}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    preferences.interests.includes(category.value)
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{category.label}</span>
                    {preferences.interests.includes(category.value) && (
                      <Check className="h-4 w-4" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Location Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Location & Language</CardTitle>
            <CardDescription>
              Select your preferred country and language
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Country</label>
                <Select
                  value={preferences.country}
                  onValueChange={(value) =>
                    setPreferences(prev => ({ ...prev, country: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
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

              <div>
                <label className="text-sm font-medium">Language</label>
                <Select
                  value={preferences.language}
                  onValueChange={(value) =>
                    setPreferences(prev => ({ ...prev, language: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LANGUAGES.map((language) => (
                      <SelectItem key={language.value} value={language.value}>
                        {language.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Settings */}
        <Card>
          <CardHeader>
            <CardTitle>General Settings</CardTitle>
            <CardDescription>
              Configure your reading preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium">Email Notifications</h4>
                <p className="text-sm text-gray-500">
                  Receive daily digest of top news
                </p>
              </div>
              <Switch
                checked={preferences.emailNotifications}
                onCheckedChange={(checked) =>
                  setPreferences(prev => ({ ...prev, emailNotifications: checked }))
                }
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium">Articles Per Day</h4>
                <p className="text-sm text-gray-500">
                  Maximum number of articles to show daily
                </p>
              </div>
              <Select
                value={preferences.articlesPerDay.toString()}
                onValueChange={(value) =>
                  setPreferences(prev => ({ ...prev, articlesPerDay: parseInt(value) }))
                }
              >
                <SelectTrigger className="w-[100px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="30">30</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button
            onClick={savePreferences}
            disabled={saving}
            className="min-w-[120px]"
          >
            {saving ? (
              'Saving...'
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}