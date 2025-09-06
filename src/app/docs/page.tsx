// src/app/docs/page.tsx
'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowRight,
  CheckCircle,
  Sparkles,
  BookOpen,
  Code,
  Database,
  Shield,
  Zap,
  FileText,
  Copy,
  ExternalLink,
  Github,
  Settings,
  Key,
  Users,
  Brain,
  BarChart3,
  TrendingUp
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
export default function DocsPage() {
  const [copied, setCopied] = useState<string | null>(null);
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(text);
    setTimeout(() => setCopied(null), 2000);
  };
  
  const guides = [
    {
      title: "Getting Started",
      description: "Learn how to set up NewsGenie and start personalizing your news feed",
      icon: Zap,
      color: "blue",
      content: `Welcome to NewsGenie! This guide will walk you through setting up your account and customizing your news preferences.
1. **Sign Up**: Create an account using your Google or GitHub credentials.
2. **Select Interests**: Choose the news categories that interest you most.
3. **Customize Preferences**: Fine-tune your news sources and notification settings.
4. **Start Reading**: Enjoy your personalized news feed with AI-powered insights.`
    },
    {
      title: "Personalization Guide",
      description: "Learn how to get the most out of NewsGenie&apos;s personalization features",
      icon: Users,
      color: "purple",
      content: `NewsGenie&apos;s AI learns from your reading habits to deliver increasingly relevant content. Here&apos;s how to optimize your experience:
1. **Rate Articles**: Use the thumbs up/down buttons to provide feedback on article relevance.
2. **Update Interests**: Regularly review and update your interest categories.
3. **Bookmark Important Articles**: Save articles you want to reference later.
4. **Adjust Notification Settings**: Customize when and how you receive news alerts.`
    },
    {
      title: "AI Features Guide",
      description: "Discover how to leverage NewsGenie&apos;s advanced AI capabilities",
      icon: Brain,
      color: "green",
      content: `NewsGenie&apos;s AI features transform how you consume news:
1. **Article Summaries**: Toggle between full articles and AI-generated summaries.
2. **Sentiment Analysis**: View sentiment scores to understand the emotional tone of articles.
3. **Topic Clustering**: Explore related articles grouped by topic.
4. **Trend Detection**: Identify emerging topics and rising sentiment shifts.`
    },
    {
      title: "Analytics Dashboard",
      description: "Learn how to interpret your reading analytics and trends",
      icon: BarChart3,
      color: "orange",
      content: `Your analytics dashboard provides insights into your reading habits:
1. **Reading Statistics**: Track articles read, time spent, and categories explored.
2. **Trend Analysis**: See how your interests evolve over time.
3. **Source Preferences**: Understand which news sources you engage with most.
4. **Sentiment Trends**: Analyze the sentiment of articles you typically read.`
    }
  ];
  const getColorClasses = (color: string) => {
    switch(color) {
      case "blue": return "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400";
      case "purple": return "bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400";
      case "green": return "bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400";
      case "orange": return "bg-orange-100 dark:bg-orange-900 text-orange-600 dark:text-orange-400";
      default: return "bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400";
    }
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
      {/* Header */}
      <section className="py-16 md:py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-slate-100 dark:bg-grid-slate-900/[0.05] bg-[length:20px_20px]" />
        <div className="container mx-auto px-4 text-center relative z-10">
          <Badge variant="secondary" className="mb-6">
            <BookOpen className="h-3 w-3 mr-1" />
            Documentation
          </Badge>
          
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent">NewsGenie</span> Documentation
          </h1>
          
          <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 mb-10 max-w-3xl mx-auto leading-relaxed">
            Everything you need to know to get the most out of NewsGenie&apos;s AI-powered news platform
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button asChild size="lg" className="shadow-lg hover:shadow-xl transition-shadow">
              <Link href="/">Back to Home</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-2 hover:bg-slate-50 dark:hover:bg-slate-900">
              <Link href="/api-docs">API Documentation</Link>
            </Button>
          </div>
        </div>
      </section>
      
      {/* Documentation Overview */}
      <section className="py-20 bg-white dark:bg-slate-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Documentation Overview
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              Comprehensive guides to help you master NewsGenie
            </p>
          </div>
          
          <Tabs defaultValue="guides" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="guides">User Guides</TabsTrigger>
              <TabsTrigger value="features">Features</TabsTrigger>
              <TabsTrigger value="api">API Reference</TabsTrigger>
              <TabsTrigger value="faq">FAQ</TabsTrigger>
            </TabsList>
            
            <TabsContent value="guides" className="mt-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {guides.map((guide, index) => (
                  <Card key={index} className="border-slate-200 dark:border-slate-800 hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start space-x-4">
                        <div className={`w-12 h-12 ${getColorClasses(guide.color)} rounded-lg flex items-center justify-center flex-shrink-0`}>
                          <guide.icon className="h-6 w-6" />
                        </div>
                        <div>
                          <CardTitle className="text-xl">{guide.title}</CardTitle>
                          <CardDescription className="text-base">
                            {guide.description}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="prose prose-sm dark:prose-invert max-w-none">
                        <p className="whitespace-pre-line">{guide.content}</p>
                      </div>
                      <div className="mt-4">
                        <Button size="sm" variant="outline">
                          Read Full Guide
                          <ArrowRight className="h-4 w-4 ml-1" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="features" className="mt-8">
              <div className="space-y-8">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Brain className="h-5 w-5 mr-2" />
                      AI-Powered Features
                    </CardTitle>
                    <CardDescription>
                      Learn about NewsGenie&apos;s advanced AI capabilities
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Article Summarization</h3>
                        <p className="text-slate-600 dark:text-slate-300">
                          NewsGenie uses advanced NLP to generate concise summaries of long articles, highlighting key points while preserving context.
                        </p>
                        <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-4">
                          <h4 className="font-medium mb-2">How to use:</h4>
                          <ol className="list-decimal pl-5 space-y-1 text-sm">
                            <li>Open any article in your feed</li>
                            <li>Click the &quot;Summary&quot; toggle button</li>
                            <li>View the AI-generated summary</li>
                          </ol>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Sentiment Analysis</h3>
                        <p className="text-slate-600 dark:text-slate-300">
                          Each article is analyzed for emotional tone, providing insights into bias and sentiment to help you understand the full context.
                        </p>
                        <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-4">
                          <h4 className="font-medium mb-2">Sentiment indicators:</h4>
                          <ul className="space-y-1 text-sm">
                            <li className="flex items-center"><div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div> Positive</li>
                            <li className="flex items-center"><div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div> Neutral</li>
                            <li className="flex items-center"><div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div> Negative</li>
                          </ul>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Topic Clustering</h3>
                        <p className="text-slate-600 dark:text-slate-300">
                          Related articles are automatically grouped by topic, allowing you to explore different perspectives on the same story.
                        </p>
                        <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-4">
                          <h4 className="font-medium mb-2">Finding related articles:</h4>
                          <ol className="list-decimal pl-5 space-y-1 text-sm">
                            <li>Open an article</li>
                            <li>Scroll to the &quot;Related Articles&quot; section</li>
                            <li>Click on any article to explore</li>
                          </ol>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Trend Detection</h3>
                        <p className="text-slate-600 dark:text-slate-300">
                          NewsGenie identifies emerging topics and rising sentiment shifts, keeping you ahead of the curve on important stories.
                        </p>
                        <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-4">
                          <h4 className="font-medium mb-2">Viewing trends:</h4>
                          <ol className="list-decimal pl-5 space-y-1 text-sm">
                            <li>Navigate to your Dashboard</li>
                            <li>Click on the &quot;Trends&quot; tab</li>
                            <li>Explore trending topics by category</li>
                          </ol>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Users className="h-5 w-5 mr-2" />
                      Personalization Features
                    </CardTitle>
                    <CardDescription>
                      Learn how to customize your NewsGenie experience
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Interest Selection</h3>
                        <p className="text-slate-600 dark:text-slate-300">
                          Choose from a wide range of news categories to tailor your feed to your interests.
                        </p>
                        <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-4">
                          <h4 className="font-medium mb-2">Available categories:</h4>
                          <div className="flex flex-wrap gap-2">
                            {['Technology', 'Business', 'Science', 'Health', 'Politics', 'Sports', 'Entertainment', 'World'].map((category) => (
                              <Badge key={category} variant="outline">{category}</Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Source Preferences</h3>
                        <p className="text-slate-600 dark:text-slate-300">
                          Select your preferred news sources or let NewsGenie curate from a diverse range of reputable outlets.
                        </p>
                        <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-4">
                          <h4 className="font-medium mb-2">Popular sources:</h4>
                          <ul className="space-y-1 text-sm">
                            <li>• TechCrunch</li>
                            <li>• The New York Times</li>
                            <li>• BBC News</li>
                            <li>• Reuters</li>
                            <li>• The Guardian</li>
                          </ul>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Reading History</h3>
                        <p className="text-slate-600 dark:text-slate-300">
                          NewsGenie learns from your reading habits to improve recommendations over time.
                        </p>
                        <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-4">
                          <h4 className="font-medium mb-2">How it works:</h4>
                          <ul className="list-disc pl-5 space-y-1 text-sm">
                            <li>Articles you read are tracked</li>
                            <li>Time spent reading is measured</li>
                            <li>Interactions (likes, bookmarks) are recorded</li>
                            <li>AI uses this data to refine recommendations</li>
                          </ul>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Notification Settings</h3>
                        <p className="text-slate-600 dark:text-slate-300">
                          Customize when and how you receive news alerts to match your preferences.
                        </p>
                        <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-4">
                          <h4 className="font-medium mb-2">Notification options:</h4>
                          <ul className="list-disc pl-5 space-y-1 text-sm">
                            <li>Breaking news alerts</li>
                            <li>Daily digest emails</li>
                            <li>Trending topic notifications</li>
                            <li>Custom keyword alerts</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="api" className="mt-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Code className="h-5 w-5 mr-2" />
                    API Reference
                  </CardTitle>
                  <CardDescription>
                    Technical documentation for NewsGenie&apos;s API
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600 dark:text-slate-300 mb-6">
                    For detailed API documentation, including endpoints, authentication, and code examples, please visit our API documentation page.
                  </p>
                  <Button asChild size="lg">
                    <Link href="/api-docs">View API Documentation</Link>
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="faq" className="mt-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileText className="h-5 w-5 mr-2" />
                    Frequently Asked Questions
                  </CardTitle>
                  <CardDescription>
                    Answers to common questions about NewsGenie
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="border-b border-slate-200 dark:border-slate-700 pb-4">
                      <h3 className="text-lg font-semibold mb-2">How does NewsGenie curate news?</h3>
                      <p className="text-slate-600 dark:text-slate-300">
                        NewsGenie uses advanced AI algorithms to analyze thousands of articles from reputable sources, identify key themes, and present summaries based on your interests. Our system continuously learns from your reading habits to improve recommendations over time.
                      </p>
                    </div>
                    
                    <div className="border-b border-slate-200 dark:border-slate-700 pb-4">
                      <h3 className="text-lg font-semibold mb-2">Is my data secure?</h3>
                      <p className="text-slate-600 dark:text-slate-300">
                        Absolutely. We use industry-standard encryption and security practices to protect your data. We never share your personal information with third parties without your explicit consent, and you have full control over your data through your account settings.
                      </p>
                    </div>
                    
                    <div className="border-b border-slate-200 dark:border-slate-700 pb-4">
                      <h3 className="text-lg font-semibold mb-2">Can I customize my news feed?</h3>
                      <p className="text-slate-600 dark:text-slate-300">
                        Yes! NewsGenie offers extensive customization options. You can select your interests, choose preferred news sources, set notification preferences, and provide feedback on articles to help our AI better understand your preferences.
                      </p>
                    </div>
                    
                    <div className="border-b border-slate-200 dark:border-slate-700 pb-4">
                      <h3 className="text-lg font-semibold mb-2">How accurate is the sentiment analysis?</h3>
                      <p className="text-slate-600 dark:text-slate-300">
                        Our sentiment analysis has over 92% accuracy and continuously improves through machine learning. It analyzes the emotional tone of articles, identifying positive, negative, or neutral sentiment to provide additional context.
                      </p>
                    </div>
                    
                    <div className="border-b border-slate-200 dark:border-slate-700 pb-4">
                      <h3 className="text-lg font-semibold mb-2">What sources does NewsGenie use?</h3>
                      <p className="text-slate-600 dark:text-slate-300">
                        NewsGenie aggregates news from a wide range of reputable sources, including major international publications, specialized industry outlets, and local news providers. We prioritize sources with strong editorial standards and diverse perspectives.
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold mb-2">How do I report an issue or provide feedback?</h3>
                      <p className="text-slate-600 dark:text-slate-300">
                        We welcome your feedback! You can report issues or share suggestions through the &quot;Feedback&quot; option in your account settings, or by contacting our support team directly at support@newsgenie.com.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Still Have Questions?
          </h2>
          <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
            Our support team is here to help you make the most of NewsGenie.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button asChild size="lg" variant="secondary" className="bg-white text-blue-600 hover:bg-slate-100">
              <Link href="/contact">Contact Support</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white text-white bg-white/20 hover:bg-white hover:text-blue-600">
              <Link href="/dashboard">Go to Dashboard</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}