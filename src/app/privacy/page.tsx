// src/app/privacy/page.tsx
'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  ArrowRight,
  CheckCircle,
  Sparkles,
  Shield,
  Lock,
  Eye,
  Database,
  FileText,
  Mail,
  Calendar,
  Download
} from 'lucide-react';
import Link from 'next/link';

export default function PrivacyPolicyPage() {
  const lastUpdated = "May 15, 2024";
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
      {/* Header */}
      <section className="py-16 md:py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-slate-100 dark:bg-grid-slate-900/[0.05] bg-[length:20px_20px]" />
        <div className="container mx-auto px-4 text-center relative z-10">
          <Badge variant="secondary" className="mb-6">
            <Shield className="h-3 w-3 mr-1" />
            Privacy Policy
          </Badge>
          
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
            Privacy <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent">Policy</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 mb-10 max-w-3xl mx-auto leading-relaxed">
            How NewsGenie collects, uses, and protects your personal information
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button asChild size="lg" className="shadow-lg hover:shadow-xl transition-shadow">
              <Link href="/">Back to Home</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-2 hover:bg-slate-50 dark:hover:bg-slate-900">
              <Link href="/terms">Terms of Service</Link>
            </Button>
          </div>
        </div>
      </section>
      
      {/* Privacy Policy Content */}
      <section className="py-20 bg-white dark:bg-slate-900">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <h2 className="text-3xl font-bold mb-2">Privacy Policy</h2>
              <p className="text-slate-600 dark:text-slate-300">Last updated: {lastUpdated}</p>
            </div>
            
            <div className="prose prose-lg dark:prose-invert max-w-none">
              <p className="lead">
                At NewsGenie, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our service.
              </p>
              
              <h3>Information We Collect</h3>
              <p>We collect several types of information from and about users of our service, including:</p>
              
              <h4>Personal Information</h4>
              <ul>
                <li><strong>Account Information:</strong> When you create an account, we collect your name, email address, and profile picture.</li>
                <li><strong>Authentication Data:</strong> We collect information about your sign-in method (Google, GitHub) and unique identifiers.</li>
                <li><strong>Contact Information:</strong> If you contact us directly, we may collect your name, email address, and the content of your message.</li>
              </ul>
              
              <h4>Usage Information</h4>
              <ul>
                <li><strong>Reading History:</strong> We track which articles you read, how long you spend reading them, and your interactions (likes, bookmarks).</li>
                <li><strong>Preferences:</strong> We store your news preferences, selected categories, and preferred sources.</li>
                <li><strong>Device Information:</strong> We collect information about the device you use to access our service, including hardware model, operating system, and browser information.</li>
                <li><strong>Log Data:</strong> Our servers automatically record information when you access our service, including your IP address, browser type, and access times.</li>
              </ul>
              
              <h4>Cookies and Tracking Technologies</h4>
              <p>We use cookies and similar tracking technologies to collect information about your activity on our service, including:</p>
              <ul>
                <li><strong>Authentication Cookies:</strong> To keep you signed in to your account.</li>
                <li><strong>Preference Cookies:</strong> To remember your settings and preferences.</li>
                <li><strong>Analytics Cookies:</strong> To understand how you use our service and improve it.</li>
              </ul>
              
              <h3>How We Use Your Information</h3>
              <p>We use the information we collect for various purposes, including:</p>
              <ul>
                <li><strong>To Provide and Maintain Our Service:</strong> To deliver personalized news content and maintain your account.</li>
                <li><strong>To Personalize Your Experience:</strong> To curate news articles based on your interests and reading habits.</li>
                <li><strong>To Improve Our Service:</strong> To analyze usage patterns and improve our features and functionality.</li>
                <li><strong>To Communicate With You:</strong> To send you updates, security alerts, and support messages.</li>
                <li><strong>To Ensure Security:</strong> To protect against fraud, abuse, and security threats.</li>
              </ul>
              
              <h3>How We Share Your Information</h3>
              <p>We do not sell your personal information. We only share your information in the following circumstances:</p>
              <ul>
                <li><strong>With Service Providers:</strong> We share information with third-party service providers who perform services on our behalf, such as hosting, data analysis, and email delivery.</li>
                <li><strong>For Legal Reasons:</strong> We may disclose your information if required by law or to protect our rights, property, or safety.</li>
                <li><strong>With Your Consent:</strong> We may share your information with your consent or at your direction.</li>
              </ul>
              
              <h3>Data Security</h3>
              <p>We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. These measures include:</p>
              <ul>
                <li>Encryption of data in transit and at rest</li>
                <li>Secure authentication mechanisms</li>
                <li>Regular security assessments</li>
                <li>Employee training on data protection</li>
              </ul>
              
              <h3>Your Rights</h3>
              <p>Depending on your jurisdiction, you may have the following rights regarding your personal information:</p>
              <ul>
                <li><strong>Access:</strong> You can request a copy of the personal information we hold about you.</li>
                <li><strong>Correction:</strong> You can request that we correct inaccurate or incomplete information.</li>
                <li><strong>Deletion:</strong> You can request that we delete your personal information, subject to certain exceptions.</li>
                <li><strong>Portability:</strong> You can request a copy of your information in a portable format.</li>
                <li><strong>Objection:</strong> You can object to our use of your personal information for certain purposes.</li>
              </ul>
              
              <h3>Children&apos;s Privacy</h3>
              <p>Our service is not intended for children under the age of 13. We do not knowingly collect personal information from children under 13. If we become aware that we have collected personal information from a child under 13, we will take steps to delete it.</p>
              
              <h3>Changes to This Privacy Policy</h3>
              <p>We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the &quot;Last updated&quot; date. You are advised to review this Privacy Policy periodically for any changes.</p>
              
              <h3>Contact Us</h3>
              <p>If you have any questions about this Privacy Policy, please contact us at:</p>
              <ul>
                <li>Email: privacy@newsgenie.com</li>
                <li>Mail: 123 News Street, San Francisco, CA 94105</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Questions About Your Privacy?
          </h2>
          <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
            Our privacy team is here to help you understand how we protect your data.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button asChild size="lg" variant="secondary" className="bg-white text-blue-600 hover:bg-slate-100">
              <Link href="/contact">Contact Us</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white text-white bg-white/20 hover:bg-white hover:text-blue-600">
              <Link href="/dashboard">Manage Your Data</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
