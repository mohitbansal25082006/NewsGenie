'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Sparkles,
  Target,
  FileText,
  Bell,
  Users,
  Brain,
  BarChart3,
  BookOpen,
  Zap
} from 'lucide-react';
import Link from 'next/link';

export default function HowItWorksPage() {
  const steps = [
    {
      title: "Connect & Customize",
      description: "Sign in and tell us your interests. Our AI learns from your preferences to create a personalized news experience.",
      icon: Users,
      color: "blue"
    },
    {
      title: "AI Analysis",
      description: "Our AI processes thousands of articles, extracting summaries, analyzing sentiment, and identifying trending topics.",
      icon: Brain,
      color: "purple"
    },
    {
      title: "Stay Informed",
      description: "Receive your curated news feed with insights, summaries, and trends tailored specifically to your interests.",
      icon: BookOpen,
      color: "green"
    }
  ];

  const features = [
    {
      title: "Personalized News Feed",
      description: "AI-curated content based on your interests and reading habits",
      icon: Target
    },
    {
      title: "Real-time Updates",
      description: "Instant notifications for breaking news and trending topics",
      icon: Bell
    },
    {
      title: "Smart Summaries",
      description: "Concise summaries of long articles to save you time",
      icon: FileText
    },
    {
      title: "Sentiment Analysis",
      description: "Understand the emotional tone and bias of news articles",
      icon: BarChart3
    },
    {
      title: "Trend Detection",
      description: "Identify emerging topics and rising sentiment shifts",
      icon: Zap
    },
    {
      title: "Cross-Platform Sync",
      description: "Access your news feed seamlessly across all devices",
      icon: Users
    }
  ];

  const getColorClasses = (color: string) => {
    switch(color) {
      case "blue": return "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400";
      case "purple": return "bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400";
      case "green": return "bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400";
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
            How It Works
          </Badge>
          
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
            How <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent">NewsGenie</span> Works
          </h1>
          
          <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 mb-10 max-w-3xl mx-auto leading-relaxed">
            Three simple steps to transform your news consumption experience with AI-powered intelligence
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button asChild size="lg" className="shadow-lg hover:shadow-xl transition-shadow">
              <Link href="/">Back to Home</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-2 border-blue-600 text-blue-600 hover:bg-blue-50 dark:border-blue-400 dark:text-blue-400 dark:hover:bg-blue-400/10">
              <Link href="/features">View Features</Link>
            </Button>
          </div>
        </div>
      </section>
      
      {/* Steps Section */}
      <section className="py-20 bg-white dark:bg-slate-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Simple Process, Powerful Results
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              Get started in minutes and experience the difference AI makes in news consumption
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {steps.map((step, index) => (
              <div key={index} className="text-center group">
                <div className={`w-24 h-24 ${getColorClasses(step.color)} rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform shadow-lg`}>
                  <step.icon className="h-12 w-12" />
                </div>
                <div className="bg-blue-500 text-white rounded-full w-10 h-10 flex items-center justify-center mx-auto -mt-16 mb-4 border-4 border-white dark:border-slate-900 z-10 relative">
                  <span className="text-xl font-bold">{index + 1}</span>
                </div>
                <h3 className="text-xl font-semibold mb-4">{step.title}</h3>
                <p className="text-slate-600 dark:text-slate-300">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-900 dark:to-slate-800">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
              <Target className="h-3 w-3 mr-1" />
              Key Features
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              What Makes NewsGenie Different
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              Discover the features that set us apart from traditional news platforms
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-slate-200 dark:border-slate-800">
                <CardHeader>
                  <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <feature.icon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>
      
      {/* Technology Section */}
      <section className="py-20 bg-white dark:bg-slate-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Powered by Advanced Technology
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              Our platform leverages cutting-edge AI and machine learning technologies
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-lg">
                  <Brain className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Natural Language Processing</h3>
                  <p className="text-slate-600 dark:text-slate-300">
                    Our advanced NLP models understand context, extract key information, and generate human-like summaries.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="bg-purple-100 dark:bg-purple-900 p-3 rounded-lg">
                  <BarChart3 className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Machine Learning</h3>
                  <p className="text-slate-600 dark:text-slate-300">
                    Personalized recommendations improve over time as our system learns from your reading habits.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="bg-green-100 dark:bg-green-900 p-3 rounded-lg">
                  <Zap className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Real-time Processing</h3>
                  <p className="text-slate-600 dark:text-slate-300">
                    Our infrastructure processes thousands of articles per minute to deliver the latest news instantly.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-900 rounded-2xl shadow-xl p-8 border border-slate-200 dark:border-slate-700">
              <h3 className="text-2xl font-bold mb-6">Technology Stack</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-700 rounded-lg">
                  <span className="font-medium">Frontend</span>
                  <Badge variant="secondary">Next.js, Tailwind CSS</Badge>
                </div>
                <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-700 rounded-lg">
                  <span className="font-medium">Backend</span>
                  <Badge variant="secondary">Node.js, Next.js API</Badge>
                </div>
                <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-700 rounded-lg">
                  <span className="font-medium">Database</span>
                  <Badge variant="secondary">Neon (PostgreSQL)</Badge>
                </div>
                <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-700 rounded-lg">
                  <span className="font-medium">AI & NLP</span>
                  <Badge variant="secondary">OpenAI API</Badge>
                </div>
                <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-700 rounded-lg">
                  <span className="font-medium">Authentication</span>
                  <Badge variant="secondary">OAuth 2.0</Badge>
                </div>
                <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-700 rounded-lg">
                  <span className="font-medium">Deployment</span>
                  <Badge variant="secondary">Vercel</Badge>
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
            Ready to Get Started?
          </h2>
          <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
            Join thousands of users who have already transformed their news experience with NewsGenie.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button asChild size="lg" variant="secondary" className="bg-white text-blue-600 hover:bg-slate-100">
              <Link href="/dashboard">Get Started</Link>
            </Button>
            <Button 
              asChild 
              size="lg" 
              variant="outline" 
              className="border-2 border-white text-white bg-white/10 hover:bg-white/20 dark:border-blue-400 dark:text-blue-400 dark:bg-blue-400/10 dark:hover:bg-blue-400/20"
            >
              <Link href="/docs">View Documentation</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
