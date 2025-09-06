// src/app/security/page.tsx
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
  Download,
  Server,
  Key,
  Fingerprint,
  AlertTriangle,
  CheckSquare
} from 'lucide-react';
import Link from 'next/link';
export default function SecurityPage() {
  const securityMeasures = [
    {
      title: "Data Encryption",
      description: "All data is encrypted in transit and at rest using industry-standard encryption protocols.",
      icon: Lock
    },
    {
      title: "Secure Authentication",
      description: "Multi-factor authentication and secure session management to protect your account.",
      icon: Key
    },
    {
      title: "Regular Audits",
      description: "Regular security audits and penetration testing to identify and address vulnerabilities.",
      icon: CheckSquare
    },
    {
      title: "Access Controls",
      description: "Strict access controls and least privilege principles to limit data exposure.",
      icon: Eye
    }
  ];
  const certifications = [
    {
      name: "SOC 2 Type II",
      description: "Certified for security, availability, processing integrity, confidentiality, and privacy",
      icon: Shield
    },
    {
      name: "GDPR Compliant",
      description: "Fully compliant with EU General Data Protection Regulation requirements",
      icon: FileText
    },
    {
      name: "ISO 27001",
      description: "Certified for information security management systems",
      icon: Server
    }
  ];
  const incidentResponse = [
    {
      title: "Detection",
      description: "24/7 monitoring and automated threat detection systems"
    },
    {
      title: "Analysis",
      description: "Rapid investigation and assessment of potential security incidents"
    },
    {
      title: "Containment",
      description: "Immediate actions to limit the impact of security incidents"
    },
    {
      title: "Recovery",
      description: "Systematic restoration of services and prevention of recurrence"
    },
    {
      title: "Communication",
      description: "Transparent and timely communication with affected users"
    }
  ];
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
      {/* Header */}
      <section className="py-16 md:py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-slate-100 dark:bg-grid-slate-900/[0.05] bg-[length:20px_20px]" />
        <div className="container mx-auto px-4 text-center relative z-10">
          <Badge variant="secondary" className="mb-6">
            <Shield className="h-3 w-3 mr-1" />
            Security
          </Badge>
          
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
            Security at <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent">NewsGenie</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 mb-10 max-w-3xl mx-auto leading-relaxed">
            How we protect your data and ensure the security of our platform
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
      
      {/* Security Overview */}
      <section className="py-20 bg-white dark:bg-slate-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Our Commitment to Security
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              Security is at the core of everything we do at NewsGenie
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="border-slate-200 dark:border-slate-800">
              <CardHeader>
                <CardTitle className="text-xl flex items-center">
                  <Shield className="h-5 w-5 mr-2" />
                  Security First Approach
                </CardTitle>
                <CardDescription>
                  We've built our platform with security as a foundational principle, not an afterthought.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 dark:text-slate-300">
                  From the ground up, we've implemented security best practices across our entire infrastructure. Our security-first approach ensures that your data is protected at every stage of its lifecycle, from collection to storage to transmission.
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-slate-200 dark:border-slate-800">
              <CardHeader>
                <CardTitle className="text-xl flex items-center">
                  <Fingerprint className="h-5 w-5 mr-2" />
                  Continuous Monitoring
                </CardTitle>
                <CardDescription>
                  Our security team monitors our systems 24/7 to detect and respond to threats.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 dark:text-slate-300">
                  We employ advanced monitoring tools and automated threat detection systems to identify potential security issues in real-time. Our security team is always on standby to respond to incidents and protect our users' data.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
      
      {/* Security Measures */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-900 dark:to-slate-800">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Security Measures
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              The technical measures we implement to keep your data safe
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {securityMeasures.map((measure, index) => (
              <Card key={index} className="border-slate-200 dark:border-slate-800 hover:shadow-lg transition-shadow">
                <CardHeader className="text-center">
                  <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                    <measure.icon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                  </div>
                  <CardTitle className="text-xl">{measure.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600 dark:text-slate-300 text-center">
                    {measure.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
      
      {/* Certifications */}
      <section className="py-20 bg-white dark:bg-slate-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Certifications & Compliance
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              Our commitment to meeting industry standards and regulatory requirements
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {certifications.map((cert, index) => (
              <Card key={index} className="border-slate-200 dark:border-slate-800 hover:shadow-lg transition-shadow">
                <CardHeader className="text-center">
                  <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                    <cert.icon className="h-8 w-8 text-green-600 dark:text-green-400" />
                  </div>
                  <CardTitle className="text-xl">{cert.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600 dark:text-slate-300 text-center">
                    {cert.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
      
      {/* Incident Response */}
      <section className="py-20 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-slate-900 dark:to-slate-800">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Incident Response
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              How we prepare for and respond to security incidents
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <Card className="border-slate-200 dark:border-slate-800">
              <CardHeader>
                <CardTitle className="text-xl flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-2" />
                  Incident Response Plan
                </CardTitle>
                <CardDescription>
                  Our comprehensive approach to handling security incidents
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {incidentResponse.map((step, index) => (
                    <div key={index} className="flex items-start">
                      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                        <span className="font-bold text-blue-600 dark:text-blue-400">{index + 1}</span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg mb-1">{step.title}</h3>
                        <p className="text-slate-600 dark:text-slate-300">{step.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
      
      {/* Vulnerability Disclosure */}
      <section className="py-20 bg-white dark:bg-slate-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Vulnerability Disclosure
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              We welcome responsible disclosure of security vulnerabilities
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <Card className="border-slate-200 dark:border-slate-800">
              <CardHeader>
                <CardTitle className="text-xl">Responsible Disclosure Policy</CardTitle>
                <CardDescription>
                  How to report security vulnerabilities to us
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="prose prose-lg dark:prose-invert max-w-none">
                  <p>
                    We appreciate the efforts of security researchers and the community in helping us maintain the security of our platform. If you believe you've discovered a security vulnerability, we encourage you to report it to us in a responsible manner.
                  </p>
                  
                  <h3>How to Report</h3>
                  <p>
                    Please send your findings to <a href="mailto:security@newsgenie.com" className="text-blue-600 dark:text-blue-400">security@newsgenie.com</a>. Include as much information as possible about the vulnerability, including:
                  </p>
                  <ul>
                    <li>A detailed description of the vulnerability</li>
                    <li>Steps to reproduce the issue</li>
                    <li>Potential impact of the vulnerability</li>
                    <li>Suggested remediation (if applicable)</li>
                  </ul>
                  
                  <h3>What We Ask</h3>
                  <p>
                    To ensure the responsible disclosure process, we ask that you:
                  </p>
                  <ul>
                    <li>Do not exploit the vulnerability beyond what is necessary to demonstrate it</li>
                    <li>Do not disclose the vulnerability to others until it has been resolved</li>
                    <li>Provide us with reasonable time to address the vulnerability before making any public disclosure</li>
                    <li>Do not engage in any activity that could violate applicable laws or regulations</li>
                  </ul>
                  
                  <h3>What We Commit To</h3>
                  <p>
                    In return, we commit to:
                  </p>
                  <ul>
                    <li>Acknowledge receipt of your report within 3 business days</li>
                    <li>Provide an update on our progress within 14 business days</li>
                    <li>Address the vulnerability in a timely manner</li>
                    <li>Give you credit for your discovery (if you wish)</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Questions About Security?
          </h2>
          <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
            Our security team is here to answer your questions and address your concerns.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button asChild size="lg" variant="secondary" className="bg-white text-blue-600 hover:bg-slate-100">
              <Link href="/contact">Contact Security Team</Link>
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