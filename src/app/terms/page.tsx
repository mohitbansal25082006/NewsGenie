// src/app/terms/page.tsx
'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  ArrowRight,
  CheckCircle,
  Sparkles,
  FileText,
  Shield,
  Users,
  Globe,
  Download,
  Calendar
} from 'lucide-react';
import Link from 'next/link';
export default function TermsPage() {
  const lastUpdated = "May 15, 2024";
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
      {/* Header */}
      <section className="py-16 md:py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-slate-100 dark:bg-grid-slate-900/[0.05] bg-[length:20px_20px]" />
        <div className="container mx-auto px-4 text-center relative z-10">
          <Badge variant="secondary" className="mb-6">
            <FileText className="h-3 w-3 mr-1" />
            Terms of Service
          </Badge>
          
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
            Terms of <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent">Service</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 mb-10 max-w-3xl mx-auto leading-relaxed">
            The terms and conditions governing your use of NewsGenie
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button asChild size="lg" className="shadow-lg hover:shadow-xl transition-shadow">
              <Link href="/">Back to Home</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-2 hover:bg-slate-50 dark:hover:bg-slate-900">
              <Link href="/privacy">Privacy Policy</Link>
            </Button>
          </div>
        </div>
      </section>
      
      {/* Terms Content */}
      <section className="py-20 bg-white dark:bg-slate-900">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <h2 className="text-3xl font-bold mb-2">Terms of Service</h2>
              <p className="text-slate-600 dark:text-slate-300">Last updated: {lastUpdated}</p>
            </div>
            
            <div className="prose prose-lg dark:prose-invert max-w-none">
              <p className="lead">
                Welcome to NewsGenie! These Terms of Service ("Terms") govern your use of the NewsGenie website, application, and services (collectively, the "Service"). By accessing or using the Service, you agree to be bound by these Terms.
              </p>
              
              <h3>Acceptance of Terms</h3>
              <p>By creating an account or using the Service, you agree to comply with and be bound by these Terms and our Privacy Policy. If you do not agree to these Terms, you may not access or use the Service.</p>
              
              <h3>Changes to Terms</h3>
              <p>We reserve the right to modify these Terms at any time. We will notify you of any changes by posting the revised Terms on this page and updating the "Last updated" date. Your continued use of the Service after any such changes constitutes your acceptance of the new Terms.</p>
              
              <h3>Description of Service</h3>
              <p>NewsGenie is an AI-powered news aggregation platform that curates and delivers personalized news content based on user preferences. The Service includes features such as:</p>
              <ul>
                <li>Personalized news feeds</li>
                <li>AI-powered article summarization</li>
                <li>Sentiment analysis</li>
                <li>Topic clustering</li>
                <li>Bookmarking and reading history</li>
                <li>Notifications and alerts</li>
              </ul>
              
              <h3>User Accounts</h3>
              <p>To use certain features of the Service, you must create an account. You agree to:</p>
              <ul>
                <li>Provide accurate, current, and complete information</li>
                <li>Maintain the security of your account credentials</li>
                <li>Be responsible for all activities that occur under your account</li>
                <li>Notify us immediately of any unauthorized use of your account</li>
              </ul>
              
              <h3>User Conduct</h3>
              <p>You agree not to engage in any of the following prohibited activities:</p>
              <ul>
                <li>Using the Service for any illegal or unauthorized purpose</li>
                <li>Violating any applicable laws or regulations</li>
                <li>Infringing on the rights of others</li>
                <li>Interfering with or disrupting the Service</li>
                <li>Uploading or transmitting viruses or malicious code</li>
                <li>Collecting or harvesting user data without consent</li>
                <li>Impersonating another person or entity</li>
                <li>Engaging in any automated use of the Service</li>
              </ul>
              
              <h3>Intellectual Property Rights</h3>
              <p>The Service and its original content, features, and functionality are and will remain the exclusive property of NewsGenie and its licensors. The Service is protected by copyright, trademark, and other laws of both the United States and foreign countries.</p>
              
              <p>NewsGenie does not claim ownership of any content you submit or make available through the Service. However, by submitting content, you grant NewsGenie a worldwide, non-exclusive, royalty-free license to use, reproduce, modify, adapt, publish, and display such content for the purpose of providing and improving the Service.</p>
              
              <h3>Third-Party Content</h3>
              <p>The Service may include content from third-party news sources and publications. We do not endorse or assume any responsibility for any third-party content. You acknowledge that we are not responsible or liable for any loss or damage of any kind incurred as a result of your use of or reliance on any third-party content.</p>
              
              <h3>Termination</h3>
              <p>We may terminate or suspend your account and access to the Service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.</p>
              
              <p>Upon termination, your right to use the Service will cease immediately. If you wish to terminate your account, you may simply discontinue using the Service.</p>
              
              <h3>Disclaimer of Warranties</h3>
              <p>The Service is provided on an "as is" and "as available" basis, without any warranties of any kind, either express or implied. We disclaim all warranties, including but not limited to implied warranties of merchantability, fitness for a particular purpose, and non-infringement.</p>
              
              <p>We do not warrant that the Service will be uninterrupted, timely, secure, or error-free. We make no warranties about the accuracy, reliability, completeness, or timeliness of any content provided through the Service.</p>
              
              <h3>Limitation of Liability</h3>
              <p>In no event shall NewsGenie, its directors, employees, partners, agents, suppliers, or affiliates be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from:</p>
              <ul>
                <li>Your access to or use of or inability to access or use the Service</li>
                <li>Any conduct or content of any third party on the Service</li>
                <li>Any content obtained from the Service</li>
                <li>Unauthorized access, use, or alteration of your transmissions or content</li>
              </ul>
              
              <h3>Governing Law</h3>
              <p>These Terms shall be governed and construed in accordance with the laws of the State of California, without regard to its conflict of law provisions.</p>
              
              <h3>Dispute Resolution</h3>
              <p>Any legal action of whatever nature brought by either you or NewsGenie (collectively, the "Parties" and individually, a "Party") shall be commenced or prosecuted in the state and federal courts located in San Francisco County, California, and the Parties hereby consent to, and waive all defenses of lack of personal jurisdiction and forum non conveniens with respect to venue and jurisdiction in such state and federal courts.</p>
              
              <h3>Indemnification</h3>
              <p>You agree to indemnify and hold NewsGenie and its parents, subsidiaries, affiliates, officers, employees, agents, partners, and licensors harmless from any claim or demand, including reasonable attorneys' fees, made by any third party due to or arising out of your breach of these Terms or your violation of any law or the rights of a third party.</p>
              
              <h3>Severability</h3>
              <p>If any provision of these Terms is found to be unlawful, void, or unenforceable, that provision will be deemed severable from these Terms and will not affect the validity and enforceability of any remaining provisions.</p>
              
              <h3>Entire Agreement</h3>
              <p>These Terms, together with our Privacy Policy, constitute the entire agreement between you and NewsGenie concerning the Service.</p>
              
              <h3>Contact Us</h3>
              <p>If you have any questions about these Terms, please contact us at:</p>
              <ul>
                <li>Email: legal@newsgenie.com</li>
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
            Questions About Our Terms?
          </h2>
          <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
            Our legal team is here to help you understand our terms and conditions.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button asChild size="lg" variant="secondary" className="bg-white text-blue-600 hover:bg-slate-100">
              <Link href="/contact">Contact Us</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white text-white bg-white/20 hover:bg-white hover:text-blue-600">
              <Link href="/privacy">Privacy Policy</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}