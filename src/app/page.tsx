// E:\newsgenie\src\app\page.tsx
'use client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  BookOpen, 
  Brain, 
  TrendingUp, 
  Users, 
  Zap, 
  Shield, 
  Globe, 
  BarChart3,
  Sparkles,
  Newspaper,
  ArrowRight,
  Github,
  Chrome,
  MessageSquare,
  Star,
  Quote,
  CheckCircle,
  HelpCircle,
  Lightbulb,
  Target,
  FileText,
  Clock,
  Award,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import Link from 'next/link';
import { useSession, signIn } from 'next-auth/react';
import { toast } from 'sonner';
import { useState } from 'react';
export default function HomePage() {
  const { data: session } = useSession();
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  
  const handleSignIn = async (provider: string) => {
    try {
      await signIn(provider, { callbackUrl: "/dashboard" });
      toast.success("Signing you in...");
    } catch (error) {
      toast.error("Failed to sign in. Please try again.");
    }
  };
  const toggleFaq = (index: number) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };
  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Journalist",
      content: "NewsGenie has completely transformed how I consume news. The AI summaries save me hours every week.",
      rating: 5
    },
    {
      name: "Michael Chen",
      role: "Tech Entrepreneur",
      content: "The sentiment analysis feature is incredibly accurate. It helps me understand the real story behind the headlines.",
      rating: 5
    },
    {
      name: "Emma Rodriguez",
      role: "Research Analyst",
      content: "As someone who needs to stay on top of trends, NewsGenie's trending topics feature is indispensable.",
      rating: 4
    }
  ];
  const faqs = [
    {
      question: "How does NewsGenie curate news?",
      answer: "Our AI analyzes thousands of articles from reputable sources, identifies key themes, and presents summaries based on your interests."
    },
    {
      question: "Is my data secure?",
      answer: "Absolutely. We use industry-standard encryption and never share your personal data with third parties."
    },
    {
      question: "Can I customize my news feed?",
      answer: "Yes! NewsGenie learns from your reading habits and allows you to customize topics, sources, and frequency of updates."
    },
    {
      question: "How accurate is the sentiment analysis?",
      answer: "Our sentiment analysis has over 92% accuracy and continuously improves through machine learning."
    }
  ];
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
      {/* Hero Section */}
      <section className="py-8 md:py-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-slate-100 dark:bg-grid-slate-900/[0.05] bg-[length:20px_20px]" />
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="max-w-4xl mx-auto">
            <Badge variant="secondary" className="mb-4 animate-pulse">
              <Sparkles className="h-3 w-3 mr-1" />
              Powered by AI
            </Badge>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
              News That{" "}
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent">
                Adapts
              </span>{" "}
              to You
            </h1>
            
            <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 mb-8 max-w-3xl mx-auto leading-relaxed">
              Stop scrolling through irrelevant headlines. Get AI-curated news summaries, 
              sentiment analysis, and trending insights tailored to your interests.
            </p>
            
            {!session && (
              <div className="mb-12">
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <Button 
                    size="lg"
                    className="flex items-center space-x-2 shadow-lg hover:shadow-xl transition-shadow"
                    onClick={() => handleSignIn("google")}
                  >
                    <Chrome className="h-5 w-5" />
                    <span>Continue with Google</span>
                  </Button>
                  <Button 
                    size="lg"
                    variant="outline"
                    className="flex items-center space-x-2 border-2 hover:bg-slate-50 dark:hover:bg-slate-900"
                    onClick={() => handleSignIn("github")}
                  >
                    <Github className="h-5 w-5" />
                    <span>Continue with GitHub</span>
                  </Button>
                </div>
              </div>
            )}
            
            {session && (
              <div className="mb-12">
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <Button asChild size="lg" className="shadow-lg hover:shadow-xl transition-shadow">
                    <Link href="/dashboard">Go to Dashboard</Link>
                  </Button>
                </div>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto text-sm text-slate-500 dark:text-slate-400">
              <div className="flex items-center justify-center gap-2 bg-white/50 dark:bg-slate-900/50 p-3 rounded-lg backdrop-blur-sm">
                <Shield className="h-4 w-4 text-green-500" />
                Free to start
              </div>
              <div className="flex items-center justify-center gap-2 bg-white/50 dark:bg-slate-900/50 p-3 rounded-lg backdrop-blur-sm">
                <Zap className="h-4 w-4 text-blue-500" />
                AI-powered insights
              </div>
              <div className="flex items-center justify-center gap-2 bg-white/50 dark:bg-slate-900/50 p-3 rounded-lg backdrop-blur-sm">
                <Globe className="h-4 w-4 text-purple-500" />
                Global news sources
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section id="features" className="py-20 bg-white dark:bg-slate-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Why Choose NewsGenie?
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              Experience news consumption reimagined with cutting-edge AI technology
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-slate-200 dark:border-slate-800">
              <CardHeader>
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Brain className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle>AI-Powered Summaries</CardTitle>
                <CardDescription>
                  Get the essence of long articles in seconds with intelligent summarization
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                  <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" /> Key points extraction</li>
                  <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" /> Context preservation</li>
                  <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" /> Time-saving insights</li>
                </ul>
              </CardContent>
            </Card>
            <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-slate-200 dark:border-slate-800">
              <CardHeader>
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <BarChart3 className="h-6 w-6 text-green-600" />
                </div>
                <CardTitle>Sentiment Analysis</CardTitle>
                <CardDescription>
                  Understand the emotional tone and bias of news articles instantly
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                  <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" /> Positive/Negative/Neutral detection</li>
                  <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" /> Bias identification</li>
                  <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" /> Emotional context</li>
                </ul>
              </CardContent>
            </Card>
            <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-slate-200 dark:border-slate-800">
              <CardHeader>
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <TrendingUp className="h-6 w-6 text-purple-600" />
                </div>
                <CardTitle>Trending Topics</CardTitle>
                <CardDescription>
                  Stay ahead with real-time analysis of emerging stories and trends
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                  <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" /> Real-time trend detection</li>
                  <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" /> Topic clustering</li>
                  <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" /> Popularity metrics</li>
                </ul>
              </CardContent>
            </Card>
            <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-slate-200 dark:border-slate-800">
              <CardHeader>
                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Users className="h-6 w-6 text-orange-600" />
                </div>
                <CardTitle>Personalization</CardTitle>
                <CardDescription>
                  Tailored news feed based on your reading habits and interests
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                  <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" /> Interest-based filtering</li>
                  <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" /> Learning algorithms</li>
                  <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" /> Custom preferences</li>
                </ul>
              </CardContent>
            </Card>
            <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-slate-200 dark:border-slate-800">
              <CardHeader>
                <div className="w-12 h-12 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Zap className="h-6 w-6 text-red-600" />
                </div>
                <CardTitle>Real-time Updates</CardTitle>
                <CardDescription>
                  Breaking news alerts and instant notifications for important stories
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                  <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" /> Breaking news alerts</li>
                  <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" /> Custom notifications</li>
                  <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" /> Priority filtering</li>
                </ul>
              </CardContent>
            </Card>
            <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-slate-200 dark:border-slate-800">
              <CardHeader>
                <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <BookOpen className="h-6 w-6 text-indigo-600" />
                </div>
                <CardTitle>Smart Bookmarking</CardTitle>
                <CardDescription>
                  Save and organize articles with intelligent categorization
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                  <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" /> Auto-categorization</li>
                  <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" /> Search & filter</li>
                  <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" /> Reading progress</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
      {/* AI Chat & Insights Section */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-900 dark:to-slate-800">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
              <MessageSquare className="h-3 w-3 mr-1" />
              AI Assistant
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              AI Chat & Insights
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              Interact with our AI to get deeper insights and personalized news analysis
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
            
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-6 border border-slate-200 dark:border-slate-700">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-2 rounded-full">
                    <MessageSquare className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-medium">NewsGenie AI</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Online now</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="bg-slate-100 dark:bg-slate-700 rounded-lg p-4 max-w-[80%]">
                    <p className="text-sm">Hello! I'm your AI news assistant. How can I help you today?</p>
                  </div>
                  
                  <div className="bg-slate-100 dark:bg-slate-700 rounded-lg p-4 max-w-[80%] ml-auto">
                    <p className="text-sm">Can you summarize the latest tech news?</p>
                  </div>
                  
                  <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-4 max-w-[80%] border border-blue-200 dark:border-blue-800">
                    <p className="text-sm">Certainly! Here's a summary of today's top tech stories: [AI-generated summary would appear here]</p>
                  </div>
                </div>
                
                <div className="pt-4 flex items-center space-x-2">
                  <input 
                    type="text" 
                    placeholder="Ask me anything..." 
                    className="flex-1 bg-slate-100 dark:bg-slate-700 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled
                  />
                  <Button size="sm" disabled>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Testimonials Section */}
      <section className="py-20 bg-white dark:bg-slate-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4 bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200">
              <Star className="h-3 w-3 mr-1" />
              Testimonials
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              What Our Users Say
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              Join thousands of satisfied users who have transformed their news experience
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-slate-200 dark:border-slate-800 hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={`h-4 w-4 ${i < testimonial.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-300 dark:text-slate-600'}`} 
                      />
                    ))}
                  </div>
                  <Quote className="h-8 w-8 text-slate-300 dark:text-slate-600 mb-2" />
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600 dark:text-slate-300 mb-6 italic">
                    "{testimonial.content}"
                  </p>
                  <div className="flex items-center">
                    <div className="bg-slate-200 dark:bg-slate-700 rounded-full w-10 h-10 flex items-center justify-center mr-3">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        {testimonial.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-medium">{testimonial.name}</h4>
                      <p className="text-sm text-slate-500 dark:text-slate-400">{testimonial.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
      
      {/* How It Works Section */}
      <section id="how-it-works" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              How NewsGenie Works
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              Three simple steps to transform your news consumption experience
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center group">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform shadow-lg">
                <span className="text-2xl font-bold text-white">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-4">Connect & Customize</h3>
              <p className="text-slate-600 dark:text-slate-300">
                Sign in and tell us your interests. Our AI learns from your preferences 
                to create a personalized news experience.
              </p>
            </div>
            <div className="text-center group">
              <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform shadow-lg">
                <span className="text-2xl font-bold text-white">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-4">AI Analysis</h3>
              <p className="text-slate-600 dark:text-slate-300">
                Our AI processes thousands of articles, extracting summaries, 
                analyzing sentiment, and identifying trending topics.
              </p>
            </div>
            <div className="text-center group">
              <div className="w-20 h-20 bg-gradient-to-r from-pink-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform shadow-lg">
                <span className="text-2xl font-bold text-white">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-4">Stay Informed</h3>
              <p className="text-slate-600 dark:text-slate-300">
                Receive your curated news feed with insights, summaries, and trends 
                tailored specifically to your interests.
              </p>
            </div>
          </div>
        </div>
      </section>
      {/* FAQ Section */}
      <section className="py-20 bg-slate-50 dark:bg-slate-900/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4 bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
              <HelpCircle className="h-3 w-3 mr-1" />
              FAQ
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              Everything you need to know about NewsGenie
            </p>
          </div>
          
          <div className="max-w-3xl mx-auto space-y-4">
            {faqs.map((faq, index) => (
              <Card key={index} className="border-slate-200 dark:border-slate-800 overflow-hidden">
                <CardHeader 
                  className="cursor-pointer" 
                  onClick={() => toggleFaq(index)}
                >
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg">{faq.question}</CardTitle>
                    {expandedFaq === index ? (
                      <ChevronUp className="h-5 w-5 text-slate-500" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-slate-500" />
                    )}
                  </div>
                </CardHeader>
                {expandedFaq === index && (
                  <CardContent>
                    <p className="text-slate-600 dark:text-slate-300">{faq.answer}</p>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="border-t bg-white dark:bg-slate-950">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  NewsGenie
                </span>
              </div>
              <p className="text-slate-600 dark:text-slate-300">
                AI-powered news aggregation for the modern world.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                <li><a href="#features" className="hover:text-blue-600 transition-colors">Features</a></li>
                <li><a href="#how-it-works" className="hover:text-blue-600 transition-colors">How It Works</a></li>
                <li><a href="#" className="hover:text-blue-600 transition-colors">API</a></li>
                <li><a href="#" className="hover:text-blue-600 transition-colors">Documentation</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                <li><a href="#" className="hover:text-blue-600 transition-colors">About</a></li>
                <li><a href="#" className="hover:text-blue-600 transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-blue-600 transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-blue-600 transition-colors">Contact</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                <li><a href="#" className="hover:text-blue-600 transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-blue-600 transition-colors">Terms</a></li>
                <li><a href="#" className="hover:text-blue-600 transition-colors">Security</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t mt-12 pt-8 text-center text-sm text-slate-600 dark:text-slate-300">
            <p>&copy; 2024 NewsGenie. All rights reserved. Built with ❤️ using Next.js 15 & AI.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}