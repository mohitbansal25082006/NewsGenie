// src/app/blog/page.tsx
'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  ArrowRight,
  CheckCircle,
  Sparkles,
  Calendar,
  Clock,
  User,
  Search,
  Filter,
  Tag,
  BookOpen,
  MessageSquare,
  Heart,
  Share2,
  BookmarkPlus
} from 'lucide-react';
import Link from 'next/link';

export default function BlogPage() {
  const blogPosts = [
    {
      title: "The Future of AI in News Consumption",
      excerpt: "Exploring how artificial intelligence is transforming the way we discover, consume, and interact with news content in the digital age.",
      author: "Alex Johnson",
      date: "May 15, 2024",
      readTime: "5 min read",
      category: "AI & Technology",
      tags: ["AI", "News", "Future Trends"],
      image: "AI"
    },
    {
      title: "Understanding Media Bias in the Digital Era",
      excerpt: "A comprehensive look at media bias, how to identify it, and what NewsGenie is doing to provide balanced news perspectives.",
      author: "Sarah Chen",
      date: "May 8, 2024",
      readTime: "7 min read",
      category: "Media Ethics",
      tags: ["Media Bias", "Journalism", "Ethics"],
      image: "MB"
    },
    {
      title: "How Personalization Algorithms Work",
      excerpt: "Deep dive into the technology behind NewsGenie's personalization engine and how it learns your preferences over time.",
      author: "Michael Rodriguez",
      date: "May 1, 2024",
      readTime: "6 min read",
      category: "Technology",
      tags: ["Algorithms", "Personalization", "Machine Learning"],
      image: "AL"
    },
    {
      title: "The Importance of News Literacy",
      excerpt: "Why news literacy matters more than ever and how you can develop critical thinking skills to evaluate information.",
      author: "Emma Thompson",
      date: "April 24, 2024",
      readTime: "4 min read",
      category: "Education",
      tags: ["Literacy", "Critical Thinking", "Education"],
      image: "NL"
    },
    {
      title: "Behind the Scenes: Building NewsGenie",
      excerpt: "A look at the challenges, decisions, and technologies that went into creating NewsGenie's AI-powered news platform.",
      author: "Alex Johnson",
      date: "April 17, 2024",
      readTime: "8 min read",
      category: "Company",
      tags: ["Development", "Behind the Scenes", "Technology"],
      image: "BS"
    },
    {
      title: "The Evolution of News Consumption",
      excerpt: "From print newspapers to digital feeds: how news consumption has changed over the decades and what's next.",
      author: "Sarah Chen",
      date: "April 10, 2024",
      readTime: "6 min read",
      category: "History",
      tags: ["History", "Evolution", "Media"],
      image: "EV"
    }
  ];

  const categories = [
    "All",
    "AI & Technology",
    "Media Ethics",
    "Technology",
    "Education",
    "Company",
    "History"
  ];

  const popularTags = [
    "AI",
    "News",
    "Personalization",
    "Machine Learning",
    "Journalism",
    "Ethics",
    "Algorithms",
    "Critical Thinking"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
      {/* Header */}
      <section className="py-16 md:py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-slate-100 dark:bg-grid-slate-900/[0.05] bg-[length:20px_20px]" />
        <div className="container mx-auto px-4 text-center relative z-10">
          <Badge variant="secondary" className="mb-6">
            <BookOpen className="h-3 w-3 mr-1" />
            Blog
          </Badge>
          
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
            The <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent">NewsGenie</span> Blog
          </h1>
          
          <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 mb-10 max-w-3xl mx-auto leading-relaxed">
            Insights, updates, and perspectives on AI, news consumption, and the future of media
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button asChild size="lg" className="shadow-lg hover:shadow-xl transition-shadow">
              <Link href="/">Back to Home</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-2 hover:bg-slate-50 dark:hover:bg-slate-900">
              <Link href="/about">About Us</Link>
            </Button>
          </div>
        </div>
      </section>
      
      {/* Blog Content */}
      <section className="py-20 bg-white dark:bg-slate-900">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Main Content */}
            <div className="lg:w-2/3">
              <div className="mb-8">
                <h2 className="text-3xl font-bold mb-6">Latest Articles</h2>
                
                <div className="grid grid-cols-1 gap-8">
                  {blogPosts.map((post, index) => (
                    <Card key={index} className="border-slate-200 dark:border-slate-800 hover:shadow-lg transition-shadow overflow-hidden">
                      <div className="md:flex">
                        <div className="md:w-1/3 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 flex items-center justify-center p-6">
                          <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                            {post.image}
                          </div>
                        </div>
                        <div className="md:w-2/3">
                          <CardHeader>
                            <div className="flex items-center justify-between mb-2">
                              <Badge variant="outline">{post.category}</Badge>
                              <div className="flex items-center text-sm text-slate-500 dark:text-slate-400">
                                <Clock className="h-4 w-4 mr-1" />
                                {post.readTime}
                              </div>
                            </div>
                            <CardTitle className="text-xl mb-2">{post.title}</CardTitle>
                            <CardDescription className="text-base">
                              {post.excerpt}
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center text-sm text-slate-500 dark:text-slate-400">
                                <User className="h-4 w-4 mr-1" />
                                {post.author}
                              </div>
                              <div className="flex items-center text-sm text-slate-500 dark:text-slate-400">
                                <Calendar className="h-4 w-4 mr-1" />
                                {post.date}
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-2 mb-4">
                              {post.tags.map((tag, tagIndex) => (
                                <Badge key={tagIndex} variant="secondary" className="text-xs">
                                  <Tag className="h-3 w-3 mr-1" />
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                            <div className="flex justify-between items-center">
                              <Button size="sm" variant="outline">
                                Read More
                                <ArrowRight className="h-4 w-4 ml-1" />
                              </Button>
                              <div className="flex space-x-2">
                                <Button size="sm" variant="ghost" className="rounded-full">
                                  <Heart className="h-4 w-4" />
                                </Button>
                                <Button size="sm" variant="ghost" className="rounded-full">
                                  <BookmarkPlus className="h-4 w-4" />
                                </Button>
                                <Button size="sm" variant="ghost" className="rounded-full">
                                  <Share2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
                
                <div className="mt-8 flex justify-center">
                  <Button variant="outline" className="w-full md:w-auto">
                    Load More Articles
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Sidebar */}
            <div className="lg:w-1/3">
              {/* Search */}
              <Card className="mb-8 border-slate-200 dark:border-slate-800">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <Search className="h-5 w-5 mr-2" />
                    Search
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="relative">
                    <Input placeholder="Search articles..." className="pr-10" />
                    <Button size="sm" variant="ghost" className="absolute right-0 top-0 h-full px-3">
                      <Search className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
              
              {/* Categories */}
              <Card className="mb-8 border-slate-200 dark:border-slate-800">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <Filter className="h-5 w-5 mr-2" />
                    Categories
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {categories.map((category, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <Button variant="ghost" className="justify-start p-0 h-auto hover:bg-transparent">
                          {category}
                        </Button>
                        {index === 0 && <Badge variant="secondary">{blogPosts.length}</Badge>}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              
              {/* Popular Tags */}
              <Card className="mb-8 border-slate-200 dark:border-slate-800">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <Tag className="h-5 w-5 mr-2" />
                    Popular Tags
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {popularTags.map((tag, index) => (
                      <Badge key={index} variant="outline" className="hover:bg-blue-50 dark:hover:bg-blue-900/50 cursor-pointer">
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
              
              {/* Newsletter */}
              <Card className="border-slate-200 dark:border-slate-800 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <MessageSquare className="h-5 w-5 mr-2" />
                    Subscribe to Newsletter
                  </CardTitle>
                  <CardDescription>
                    Get the latest articles and insights delivered to your inbox
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Input placeholder="Your email address" />
                    <Button className="w-full">Subscribe</Button>
                    <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
                      We respect your privacy. Unsubscribe at any time.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Stay Updated
          </h2>
          <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
            Subscribe to our newsletter for the latest insights on AI, news consumption, and media trends.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-md mx-auto">
            <Input placeholder="Your email address" className="bg-white/20 border-white text-white placeholder:text-white/70" />
            <Button size="lg" variant="secondary" className="bg-white text-blue-600 hover:bg-slate-100">
              Subscribe
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}