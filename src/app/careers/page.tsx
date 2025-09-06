// src/app/careers/page.tsx
'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  ArrowRight,
  CheckCircle,
  Sparkles,
  Users,
  MapPin,
  Clock,
  DollarSign,
  Briefcase,
  Heart,
  Shield,
  Zap,
  BookOpen,
  Github,
  Twitter,
  Linkedin,
  Mail
} from 'lucide-react';
import Link from 'next/link';

export default function CareersPage() {
  const jobs = [
    {
      title: "Senior Machine Learning Engineer",
      department: "Engineering",
      location: "Remote",
      type: "Full-time",
      salary: "$140k - $180k",
      description: "We&apos;re looking for an experienced ML engineer to help build and improve our AI-powered news analysis systems.",
      requirements: [
        "5+ years of experience in machine learning",
        "Strong Python skills and experience with ML frameworks",
        "Experience with NLP and text analysis",
        "Ability to work in a fast-paced environment"
      ],
      benefits: [
        "Competitive salary and equity",
        "Flexible working hours",
        "Professional development budget",
        "Health, dental, and vision insurance"
      ]
    },
    {
      title: "Frontend Developer",
      department: "Engineering",
      location: "San Francisco, CA",
      type: "Full-time",
      salary: "$120k - $150k",
      description: "Join our frontend team to build beautiful, responsive user interfaces for our news platform.",
      requirements: [
        "3+ years of experience with React/Next.js",
        "Strong TypeScript skills",
        "Experience with responsive design",
        "Passion for creating great user experiences"
      ],
      benefits: [
        "Competitive salary and equity",
        "Flexible working hours",
        "Professional development budget",
        "Health, dental, and vision insurance"
      ]
    },
    {
      title: "Product Designer",
      department: "Design",
      location: "Remote",
      type: "Full-time",
      salary: "$110k - $140k",
      description: "Help shape the future of news consumption by designing intuitive and engaging user experiences.",
      requirements: [
        "4+ years of product design experience",
        "Strong portfolio of digital products",
        "Experience with design systems",
        "Ability to collaborate with cross-functional teams"
      ],
      benefits: [
        "Competitive salary and equity",
        "Flexible working hours",
        "Professional development budget",
        "Health, dental, and vision insurance"
      ]
    },
    {
      title: "Content Strategist",
      department: "Content",
      location: "New York, NY",
      type: "Full-time",
      salary: "$90k - $120k",
      description: "Shape our content strategy and help users discover the most relevant news for their interests.",
      requirements: [
        "3+ years of content strategy experience",
        "Strong writing and editing skills",
        "Understanding of media landscape",
        "Data-driven approach to content decisions"
      ],
      benefits: [
        "Competitive salary and equity",
        "Flexible working hours",
        "Professional development budget",
        "Health, dental, and vision insurance"
      ]
    }
  ];

  const benefits = [
    {
      title: "Health & Wellness",
      description: "Comprehensive health, dental, and vision insurance for you and your family.",
      icon: Heart
    },
    {
      title: "Flexible Work",
      description: "Remote-friendly culture with flexible hours and work arrangements.",
      icon: Clock
    },
    {
      title: "Professional Growth",
      description: "Annual budget for conferences, courses, and professional development.",
      icon: BookOpen
    },
    {
      title: "Competitive Compensation",
      description: "Competitive salaries and equity packages for all full-time employees.",
      icon: DollarSign
    },
    {
      title: "Inclusive Culture",
      description: "Diverse and inclusive workplace where everyone belongs.",
      icon: Users
    },
    {
      title: "Work-Life Balance",
      description: "Generous PTO and flexible time off when you need it.",
      icon: Shield
    }
  ];

  const values = [
    {
      title: "Innovation",
      description: "We push boundaries and explore new possibilities in AI and news."
    },
    {
      title: "Integrity",
      description: "We act with honesty and transparency in all we do."
    },
    {
      title: "Collaboration",
      description: "We work together across teams to achieve our goals."
    },
    {
      title: "User-Focused",
      description: "Our users are at the center of every decision we make."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
      {/* Header */}
      <section className="py-16 md:py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-slate-100 dark:bg-grid-slate-900/[0.05] bg-[length:20px_20px]" />
        <div className="container mx-auto px-4 text-center relative z-10">
          <Badge variant="secondary" className="mb-6">
            <Briefcase className="h-3 w-3 mr-1" />
            Careers
          </Badge>
          
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
            Join <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent">NewsGenie</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 mb-10 max-w-3xl mx-auto leading-relaxed">
            Help us revolutionize how people consume news with AI-powered personalization and insights
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
      
      {/* Open Positions */}
      <section className="py-20 bg-white dark:bg-slate-900" id="open-positions">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Open Positions
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              Join our team and help shape the future of news consumption
            </p>
          </div>
          
          <div className="grid grid-cols-1 gap-8">
            {jobs.map((job, index) => (
              <Card key={index} className="border-slate-200 dark:border-slate-800 hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                    <div>
                      <CardTitle className="text-2xl mb-1">{job.title}</CardTitle>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <Badge variant="outline" className="flex items-center">
                          <Briefcase className="h-3 w-3 mr-1" />
                          {job.department}
                        </Badge>
                        <Badge variant="outline" className="flex items-center">
                          <MapPin className="h-3 w-3 mr-1" />
                          {job.location}
                        </Badge>
                        <Badge variant="outline" className="flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {job.type}
                        </Badge>
                        <Badge variant="outline" className="flex items-center">
                          <DollarSign className="h-3 w-3 mr-1" />
                          {job.salary}
                        </Badge>
                      </div>
                    </div>
                    <Button className="mt-4 md:mt-0">
                      Apply Now
                      <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                  <CardDescription className="text-base">
                    {job.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-semibold mb-3">Requirements</h3>
                      <ul className="space-y-2">
                        {job.requirements.map((req, reqIndex) => (
                          <li key={reqIndex} className="flex items-start">
                            <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                            <span className="text-sm">{req}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-3">Benefits</h3>
                      <ul className="space-y-2">
                        {job.benefits.map((benefit, benefitIndex) => (
                          <li key={benefitIndex} className="flex items-start">
                            <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                            <span className="text-sm">{benefit}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="mt-12 text-center">
            <p className="text-slate-600 dark:text-slate-300 mb-6">
              Don&apos;t see a position that fits your skills? We&apos;re always looking for talented people.
            </p>
            <Button variant="outline" size="lg">
              Send Us Your Resume
            </Button>
          </div>
        </div>
      </section>
      
      {/* Benefits Section */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-900 dark:to-slate-800">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Why Work With Us
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              We offer competitive benefits and a culture that values innovation and growth
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <Card key={index} className="border-slate-200 dark:border-slate-800 hover:shadow-lg transition-shadow">
                <CardHeader className="text-center">
                  <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                    <benefit.icon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                  </div>
                  <CardTitle className="text-xl">{benefit.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600 dark:text-slate-300 text-center">
                    {benefit.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
      
      {/* Culture Section */}
      <section className="py-20 bg-white dark:bg-slate-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Our Culture
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              The values that guide how we work together
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <Card key={index} className="border-slate-200 dark:border-slate-800 hover:shadow-lg transition-shadow">
                <CardHeader className="text-center">
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Zap className="h-6 w-6 text-purple-600 dark:text-purple-400" />
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
      
      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Join Us?
          </h2>
          <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
            We&apos;re looking for passionate people to help us revolutionize news consumption.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button asChild size="lg" variant="secondary" className="bg-white text-blue-600 hover:bg-slate-100">
              <Link href="#open-positions">View Open Positions</Link>
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
