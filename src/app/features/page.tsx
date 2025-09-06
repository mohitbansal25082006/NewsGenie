// src/app/features/page.tsx
'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Brain, 
  BarChart3, 
  TrendingUp, 
  Users, 
  Zap, 
  BookOpen,
  CheckCircle,
  Sparkles,
  Target,
  FileText,
  Clock,
  Bell,
  Lightbulb
} from 'lucide-react';
import Link from 'next/link';

export default function FeaturesPage() {
  const features = [
    {
      title: "AI-Powered Summaries",
      description: "Get the essence of long articles in seconds with intelligent summarization",
      icon: Brain,
      color: "blue",
      points: [
        "Key points extraction",
        "Context preservation",
        "Time-saving insights"
      ]
    },
    {
      title: "Sentiment Analysis",
      description: "Understand the emotional tone and bias of news articles instantly",
      icon: BarChart3,
      color: "green",
      points: [
        "Positive/Negative/Neutral detection",
        "Bias identification",
        "Emotional context"
      ]
    },
    {
      title: "Trending Topics",
      description: "Stay ahead with real-time analysis of emerging stories and trends",
      icon: TrendingUp,
      color: "purple",
      points: [
        "Real-time trend detection",
        "Topic clustering",
        "Popularity metrics"
      ]
    },
    {
      title: "Personalization",
      description: "Tailored news feed based on your reading habits and interests",
      icon: Users,
      color: "orange",
      points: [
        "Interest-based filtering",
        "Learning algorithms",
        "Custom preferences"
      ]
    },
    {
      title: "Real-time Updates",
      description: "Breaking news alerts and instant notifications for important stories",
      icon: Zap,
      color: "red",
      points: [
        "Breaking news alerts",
        "Custom notifications",
        "Priority filtering"
      ]
    },
    {
      title: "Smart Bookmarking",
      description: "Save and organize articles with intelligent categorization",
      icon: BookOpen,
      color: "indigo",
      points: [
        "Auto-categorization",
        "Search & filter",
        "Reading progress"
      ]
    }
  ];

  const getColorClasses = (color: string) => {
    switch(color) {
      case "blue": return "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400";
      case "green": return "bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400";
      case "purple": return "bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400";
      case "orange": return "bg-orange-100 dark:bg-orange-900 text-orange-600 dark:text-orange-400";
      case "red": return "bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400";
      case "indigo": return "bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400";
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
            <Sparkles className="h-3 w-3 mr-1" />
            Advanced Features
          </Badge>
          
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
            Powerful Features for <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent">Modern News Consumption</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 mb-10 max-w-3xl mx-auto leading-relaxed">
            Experience news consumption reimagined with cutting-edge AI technology and intelligent features designed for the modern reader.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button asChild size="lg" className="shadow-lg hover:shadow-xl transition-shadow">
              <Link href="/">Back to Home</Link>
            </Button>
            <Button 
              asChild 
              size="lg" 
              variant="outline" 
              className="border-2 border-blue-600 text-blue-600 bg-transparent hover:bg-blue-600 hover:text-white dark:border-white dark:text-white dark:hover:bg-white dark:hover:text-blue-600"
            >
              <Link href="/how-it-works">How It Works</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-white dark:bg-slate-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Why Choose NewsGenie?
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              Discover the features that make NewsGenie the most intelligent news platform
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-slate-200 dark:border-slate-800">
                <CardHeader>
                  <div className={`w-16 h-16 ${getColorClasses(feature.color)} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <feature.icon className="h-8 w-8" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
                    {feature.points.map((point, pointIndex) => (
                      <li key={pointIndex} className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                        {point}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Advanced Features Section */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-900 dark:to-slate-800">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
              <Target className="h-3 w-3 mr-1" />
              Advanced Capabilities
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Next-Level News Intelligence
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              Experience the future of news consumption with our advanced AI features
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-lg">
                  <Lightbulb className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Intelligent Conversations</h3>
                  <p className="text-slate-600 dark:text-slate-300">
                    Ask questions about news topics, get summaries, or request deeper analysis with our AI chat assistant.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="bg-purple-100 dark:bg-purple-900 p-3 rounded-lg">
                  <Target className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Personalized Insights</h3>
                  <p className="text-slate-600 dark:text-slate-300">
                    Receive tailored insights based on your interests and reading history for a truly personalized experience.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="bg-green-100 dark:bg-green-900 p-3 rounded-lg">
                  <FileText className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">In-depth Analysis</h3>
                  <p className="text-slate-600 dark:text-slate-300">
                    Get comprehensive analysis of news trends, sentiment patterns, and topic evolution over time.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 border border-slate-200 dark:border-slate-700">
              <h3 className="text-2xl font-bold mb-6">Advanced AI Features</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-lg">
                      <Bell className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <span className="font-medium">Smart Notifications</span>
                  </div>
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </div>
                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="bg-purple-100 dark:bg-purple-900 p-2 rounded-lg">
                      <BarChart3 className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <span className="font-medium">Predictive Analytics</span>
                  </div>
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </div>
                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="bg-green-100 dark:bg-green-900 p-2 rounded-lg">
                      <Brain className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                    <span className="font-medium">Contextual Understanding</span>
                  </div>
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </div>
                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="bg-amber-100 dark:bg-amber-900 p-2 rounded-lg">
                      <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                    </div>
                    <span className="font-medium">Real-time Processing</span>
                  </div>
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Transform Your News Experience?
          </h2>
          <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
            Join thousands of users who have already upgraded their news consumption with NewsGenie.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button asChild size="lg" variant="secondary" className="bg-white text-blue-600 hover:bg-slate-100">
              <Link href="/dashboard">Get Started</Link>
            </Button>
            <Button 
              asChild 
              size="lg" 
              variant="outline" 
              className="border-2 border-white text-white bg-transparent hover:bg-white hover:text-blue-600"
            >
              <Link href="/api-docs">View Documentation</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}