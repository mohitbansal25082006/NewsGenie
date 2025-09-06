// src/app/contact/page.tsx
'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Mail,
  MapPin,
  Phone,
  Clock,
  Send,
  MessageSquare,
  Users,
  Github,
  Twitter,
  Linkedin
} from 'lucide-react';
import Link from 'next/link';

export default function ContactPage() {
  const contactInfo = [
    {
      icon: Mail,
      title: "Email Us",
      description: "For general inquiries and support",
      value: "hello@newsgenie.com"
    },
    {
      icon: Phone,
      title: "Call Us",
      description: "Monday to Friday, 9am to 5pm PST",
      value: "+1 (555) 123-4567"
    },
    {
      icon: MapPin,
      title: "Visit Us",
      description: "Our headquarters location",
      value: "123 News Street, San Francisco, CA 94105"
    }
  ];

  const team = [
    { name: "Support Team", role: "General Inquiries", email: "support@newsgenie.com" },
    { name: "Sales Team", role: "Business Partnerships", email: "sales@newsgenie.com" },
    { name: "Press Team", role: "Media Inquiries", email: "press@newsgenie.com" },
    { name: "HR Team", role: "Careers & Recruitment", email: "careers@newsgenie.com" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
      {/* Header */}
      <section className="py-16 md:py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-slate-100 dark:bg-grid-slate-900/[0.05] bg-[length:20px_20px]" />
        <div className="container mx-auto px-4 text-center relative z-10">
          <Badge variant="secondary" className="mb-6">
            <MessageSquare className="h-3 w-3 mr-1" />
            Contact Us
          </Badge>
          
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
            Get in <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent">Touch</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 mb-10 max-w-3xl mx-auto leading-relaxed">
            We&apos;d love to hear from you. Send us a message and we&apos;ll respond as soon as possible.
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
      
      {/* Contact Form */}
      <section className="py-20 bg-white dark:bg-slate-900">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-12">
            {/* Contact Form */}
            <div className="lg:w-1/2">
              <Card className="border-slate-200 dark:border-slate-800">
                <CardHeader>
                  <CardTitle className="text-2xl">Send Us a Message</CardTitle>
                  <CardDescription>
                    Fill out the form below and we&apos;ll get back to you as soon as possible.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="firstName" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        First Name
                      </label>
                      <Input id="firstName" placeholder="John" />
                    </div>
                    <div>
                      <label htmlFor="lastName" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Last Name
                      </label>
                      <Input id="lastName" placeholder="Doe" />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Email Address
                    </label>
                    <Input id="email" type="email" placeholder="john@example.com" />
                  </div>
                  
                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Subject
                    </label>
                    <Input id="subject" placeholder="How can we help you?" />
                  </div>
                  
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Message
                    </label>
                    <Textarea id="message" rows={5} placeholder="Your message here..." />
                  </div>
                  
                  <Button className="w-full">
                    Send Message
                    <Send className="h-4 w-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            </div>
            
            {/* Contact Info */}
            <div className="lg:w-1/2">
              <div className="space-y-8">
                <div>
                  <h2 className="text-2xl font-bold mb-6">Contact Information</h2>
                  <div className="space-y-6">
                    {contactInfo.map((info, index) => (
                      <Card key={index} className="border-slate-200 dark:border-slate-800">
                        <CardContent className="p-6">
                          <div className="flex items-start">
                            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                              <info.icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-lg">{info.title}</h3>
                              <p className="text-slate-600 dark:text-slate-300 text-sm mb-1">{info.description}</p>
                              <p className="font-medium">{info.value}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h2 className="text-2xl font-bold mb-6">Business Hours</h2>
                  <Card className="border-slate-200 dark:border-slate-800">
                    <CardContent className="p-6">
                      <div className="flex items-start">
                        <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                          <Clock className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg mb-2">Our Support Hours</h3>
                          <ul className="space-y-1 text-slate-600 dark:text-slate-300">
                            <li className="flex justify-between">
                              <span>Monday - Friday</span>
                              <span>9:00 AM - 5:00 PM PST</span>
                            </li>
                            <li className="flex justify-between">
                              <span>Saturday</span>
                              <span>10:00 AM - 2:00 PM PST</span>
                            </li>
                            <li className="flex justify-between">
                              <span>Sunday</span>
                              <span>Closed</span>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <div>
                  <h2 className="text-2xl font-bold mb-6">Connect With Us</h2>
                  <Card className="border-slate-200 dark:border-slate-800">
                    <CardContent className="p-6">
                      <div className="flex items-start">
                        <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                          <Users className="h-6 w-6 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg mb-2">Follow Us</h3>
                          <p className="text-slate-600 dark:text-slate-300 mb-4">
                            Stay updated with our latest news and announcements.
                          </p>
                          <div className="flex space-x-3">
                            <Button size="sm" variant="outline" className="rounded-full">
                              <Twitter className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline" className="rounded-full">
                              <Linkedin className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline" className="rounded-full">
                              <Github className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Team Contacts */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-900 dark:to-slate-800">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Contact Our Teams
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              Reach out to the right team for your specific needs
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <Card key={index} className="border-slate-200 dark:border-slate-800 hover:shadow-lg transition-shadow">
                <CardHeader className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 text-white text-xl font-bold">
                    {member.name.charAt(0)}
                  </div>
                  <CardTitle className="text-xl">{member.name}</CardTitle>
                  <CardDescription>
                    {member.role}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-center">
                    <Button variant="outline" size="sm" className="flex items-center">
                      <Mail className="h-4 w-4 mr-2" />
                      {member.email}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
      
      {/* FAQ Section */}
      <section className="py-20 bg-white dark:bg-slate-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              Quick answers to common questions
            </p>
          </div>
          
          <div className="max-w-3xl mx-auto space-y-4">
            <Card className="border-slate-200 dark:border-slate-800">
              <CardHeader>
                <CardTitle className="text-lg">How can I reset my password?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 dark:text-slate-300">
                  To reset your password, go to the login page and click on &quot;Forgot Password&quot;. Enter your email address and we&apos;ll send you instructions to reset your password.
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-slate-200 dark:border-slate-800">
              <CardHeader>
                <CardTitle className="text-lg">How do I update my preferences?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 dark:text-slate-300">
                  You can update your preferences by going to your account settings and selecting &quot;Preferences&quot;. From there, you can choose your interests, preferred sources, and notification settings.
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-slate-200 dark:border-slate-800">
              <CardHeader>
                <CardTitle className="text-lg">How do I report an issue?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 dark:text-slate-300">
                  If you encounter any issues while using NewsGenie, please contact our support team at support@newsgenie.com with a detailed description of the problem.
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-slate-200 dark:border-slate-800">
              <CardHeader>
                <CardTitle className="text-lg">How can I partner with NewsGenie?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 dark:text-slate-300">
                  For partnership inquiries, please contact our sales team at sales@newsgenie.com. We&apos;d love to explore collaboration opportunities.
                </p>
              </CardContent>
            </Card>
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
              <Link href="/dashboard">Sign Up Now</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white text-white bg-white/20 hover:bg-white hover:text-blue-600">
              <Link href="/about">Learn More</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
