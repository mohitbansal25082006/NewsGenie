// src/app/about/page.tsx
'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  ArrowRight,
  CheckCircle,
  Sparkles,
  Users,
  Brain,
  BarChart3,
  TrendingUp,
  Target,
  Globe,
  Shield,
  Zap,
  BookOpen,
  Github,
  Twitter,
  Linkedin,
  Mail
} from 'lucide-react';
import Link from 'next/link';
export default function AboutPage() {
  const team = [
    {
      name: "Alex Johnson",
      role: "CEO & Founder",
      bio: "Former data scientist with a passion for AI and journalism. Alex founded NewsGenie to revolutionize how people consume news.",
      image: "AJ"
    },
    {
      name: "Sarah Chen",
      role: "CTO",
      bio: "Machine learning expert with 10+ years of experience building AI systems. Sarah leads our technical vision and product development.",
      image: "SC"
    },
    {
      name: "Michael Rodriguez",
      role: "Head of Product",
      bio: "Product strategist with a background in media and technology. Michael ensures NewsGenie delivers exceptional user experiences.",
      image: "MR"
    },
    {
      name: "Emma Thompson",
      role: "Lead Designer",
      bio: "UX/UI designer focused on creating intuitive and beautiful interfaces. Emma shapes how users interact with NewsGenie.",
      image: "ET"
    }
  ];
  const values = [
    {
      title: "Integrity",
      description: "We are committed to providing accurate, unbiased news from reputable sources.",
      icon: Shield
    },
    {
      title: "Innovation",
      description: "We continuously push the boundaries of AI to enhance news consumption.",
      icon: Brain
    },
    {
      title: "User-Centric",
      description: "Our users are at the heart of every decision we make and feature we build.",
      icon: Users
    },
    {
      title: "Transparency",
      description: "We believe in being open about our processes, sources, and algorithms.",
      icon: Globe
    }
  ];
  const timeline = [
    {
      year: "2022",
      title: "NewsGenie Founded",
      description: "Alex Johnson founded NewsGenie with a vision to transform news consumption using AI."
    },
    {
      year: "2023",
      title: "Beta Launch",
      description: "Launched our beta version with core features: personalized feeds and AI summaries."
    },
    {
      year: "2023",
      title: "Series A Funding",
      description: "Raised $5M in Series A funding to expand our team and accelerate development."
    },
    {
      year: "2024",
      title: "Public Launch",
      description: "Officially launched NewsGenie to the public with advanced AI features and analytics."
    }
  ];
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
      {/* Header */}
      <section className="py-16 md:py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-slate-100 dark:bg-grid-slate-900/[0.05] bg-[length:20px_20px]" />
        <div className="container mx-auto px-4 text-center relative z-10">
          <Badge variant="secondary" className="mb-6">
            <Sparkles className="h-3 w-3 mr-1" />
            About Us
          </Badge>
          
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
            About <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent">NewsGenie</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 mb-10 max-w-3xl mx-auto leading-relaxed">
            We're on a mission to revolutionize how people consume news with AI-powered personalization and insights
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button asChild size="lg" className="shadow-lg hover:shadow-xl transition-shadow">
              <Link href="/">Back to Home</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-2 hover:bg-slate-50 dark:hover:bg-slate-900">
              <Link href="/contact">Contact Us</Link>
            </Button>
          </div>
        </div>
      </section>
      
      {/* Mission Section */}
      <section className="py-20 bg-white dark:bg-slate-900">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Our Mission
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-300 mb-8">
              At NewsGenie, we believe everyone deserves access to news that's relevant, reliable, and tailored to their interests. We're using cutting-edge AI to transform information overload into actionable insights, helping people stay informed efficiently while exploring the stories that matter most to them.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">10M+</div>
                <div className="text-slate-600 dark:text-slate-300">Articles Processed</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-purple-600 mb-2">500K+</div>
                <div className="text-slate-600 dark:text-slate-300">Active Users</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-green-600 mb-2">98%</div>
                <div className="text-slate-600 dark:text-slate-300">Satisfaction Rate</div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Values Section */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-900 dark:to-slate-800">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Our Values
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              The principles that guide everything we do at NewsGenie
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <Card key={index} className="border-slate-200 dark:border-slate-800 hover:shadow-lg transition-shadow">
                <CardHeader className="text-center">
                  <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                    <value.icon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                  </div>
                  <CardTitle className="text-xl">{value.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600 dark:text-slate-300 text-center">
                    {value.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
      
      {/* Team Section */}
      <section className="py-20 bg-white dark:bg-slate-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Meet Our Team
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              The passionate people behind NewsGenie
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <Card key={index} className="border-slate-200 dark:border-slate-800 hover:shadow-lg transition-shadow">
                <CardHeader className="text-center">
                  <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 text-white text-2xl font-bold">
                    {member.image}
                  </div>
                  <CardTitle className="text-xl">{member.name}</CardTitle>
                  <CardDescription className="text-base">
                    {member.role}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600 dark:text-slate-300 text-sm">
                    {member.bio}
                  </p>
                  <div className="flex justify-center space-x-3 mt-4">
                    <Button size="sm" variant="ghost" className="rounded-full">
                      <Twitter className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" className="rounded-full">
                      <Linkedin className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" className="rounded-full">
                      <Github className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
      
      {/* Timeline Section */}
      <section className="py-20 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-slate-900 dark:to-slate-800">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Our Journey
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              Key milestones in NewsGenie's evolution
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-blue-200 dark:bg-blue-800"></div>
              
              {timeline.map((item, index) => (
                <div key={index} className={`mb-12 flex ${index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'} items-center`}>
                  <div className="w-1/2 px-8">
                    <Card className="border-slate-200 dark:border-slate-800">
                      <CardHeader>
                        <Badge variant="secondary" className="w-fit mb-2">{item.year}</Badge>
                        <CardTitle className="text-xl">{item.title}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-slate-600 dark:text-slate-300">
                          {item.description}
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                  <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold z-10 relative">
                    {index + 1}
                  </div>
                  <div className="w-1/2 px-8"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      
      {/* Contact CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Join Our Mission
          </h2>
          <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
            We're always looking for talented people to help us revolutionize news consumption.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button asChild size="lg" variant="secondary" className="bg-white text-blue-600 hover:bg-slate-100">
              <Link href="/careers">View Open Positions</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white text-white bg-white/20 hover:bg-white hover:text-blue-600">
              <Link href="/contact">Contact Us</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}