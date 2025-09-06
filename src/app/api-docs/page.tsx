// src/app/api-docs/page.tsx
'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowRight,
  CheckCircle,
  Sparkles,
  Code,
  Database,
  Shield,
  Zap,
  FileText,
  Copy,
  ExternalLink,
  Github,
  BookOpen,
  Settings,
  Key
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
export default function ApiDocsPage() {
  const [copied, setCopied] = useState<string | null>(null);
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(text);
    setTimeout(() => setCopied(null), 2000);
  };
  
  const endpoints = [
    {
      method: "GET",
      path: "/api/news",
      description: "Fetch personalized news articles based on user preferences",
      parameters: [
        { name: "category", type: "string", description: "News category (e.g., technology, business)" },
        { name: "limit", type: "number", description: "Number of articles to return (default: 10)" },
        { name: "page", type: "number", description: "Page number for pagination (default: 1)" }
      ],
      example: `fetch(&apos;/api/news?category=technology&limit=5&apos;)
  .then(response => response.json())
  .then(data => console.log(data));`
    },
    {
      method: "POST",
      path: "/api/preferences",
      description: "Update user news preferences",
      parameters: [
        { name: "categories", type: "array", description: "Array of preferred news categories" },
        { name: "sources", type: "array", description: "Array of preferred news sources" },
        { name: "language", type: "string", description: "Preferred language for news articles" }
      ],
      example: `fetch(&apos;/api/preferences&apos;, {
  method: &apos;POST&apos;,
  headers: {
    &apos;Content-Type&apos;: &apos;application/json&apos;,
  },
  body: JSON.stringify({
    categories: [&apos;technology&apos;, &apos;science&apos;],
    sources: [&apos;techcrunch&apos;, &apos;wired&apos;],
    language: &apos;en&apos;
  }),
})
.then(response => response.json())
.then(data => console.log(data));`
    },
    {
      method: "GET",
      path: "/api/bookmarks",
      description: "Retrieve user&apos;s bookmarked articles",
      parameters: [
        { name: "limit", type: "number", description: "Number of bookmarks to return (default: 10)" },
        { name: "page", type: "number", description: "Page number for pagination (default: 1)" }
      ],
      example: `fetch(&apos;/api/bookmarks?limit=5&apos;)
  .then(response => response.json())
  .then(data => console.log(data));`
    },
    {
      method: "POST",
      path: "/api/bookmarks",
      description: "Add an article to user&apos;s bookmarks",
      parameters: [
        { name: "articleId", type: "string", description: "ID of the article to bookmark" },
        { name: "title", type: "string", description: "Title of the article" },
        { name: "url", type: "string", description: "URL of the article" }
      ],
      example: `fetch(&apos;/api/bookmarks&apos;, {
  method: &apos;POST&apos;,
  headers: {
    &apos;Content-Type&apos;: &apos;application/json&apos;,
  },
  body: JSON.stringify({
    articleId: &apos;12345&apos;,
    title: &apos;Article Title&apos;,
    url: &apos;https://example.com/article&apos;
  }),
})
.then(response => response.json())
.then(data => console.log(data));`
    },
    {
      method: "GET",
      path: "/api/analytics",
      description: "Retrieve user reading analytics",
      parameters: [
        { name: "period", type: "string", description: "Time period for analytics (day, week, month)" }
      ],
      example: `fetch(&apos;/api/analytics?period=week&apos;)
  .then(response => response.json())
  .then(data => console.log(data));`
    },
    {
      method: "GET",
      path: "/api/read-articles",
      description: "Retrieve user&apos;s read articles history",
      parameters: [
        { name: "limit", type: "number", description: "Number of articles to return (default: 10)" },
        { name: "page", type: "number", description: "Page number for pagination (default: 1)" }
      ],
      example: `fetch(&apos;/api/read-articles?limit=5&apos;)
  .then(response => response.json())
  .then(data => console.log(data));`
    }
  ];
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
      {/* Header */}
      <section className="py-16 md:py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-slate-100 dark:bg-grid-slate-900/[0.05] bg-[length:20px_20px]" />
        <div className="container mx-auto px-4 text-center relative z-10">
          <Badge variant="secondary" className="mb-6">
            <Code className="h-3 w-3 mr-1" />
            API Documentation
          </Badge>
          
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent">NewsGenie</span> API
          </h1>
          
          <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 mb-10 max-w-3xl mx-auto leading-relaxed">
            Integrate NewsGenie&apos;s powerful AI capabilities into your applications with our RESTful API
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button asChild size="lg" className="shadow-lg hover:shadow-xl transition-shadow">
              <Link href="/">Back to Home</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-2 hover:bg-slate-50 dark:hover:bg-slate-900">
              <Link href="/dashboard">Go to Dashboard</Link>
            </Button>
          </div>
        </div>
      </section>
      
      {/* API Overview */}
      <section className="py-20 bg-white dark:bg-slate-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              API Overview
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              Everything you need to know about integrating with NewsGenie
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <Card className="border-slate-200 dark:border-slate-800">
              <CardHeader>
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mb-4">
                  <Zap className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <CardTitle>Easy Integration</CardTitle>
                <CardDescription>
                  Simple RESTful API with JSON responses for quick integration
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="border-slate-200 dark:border-slate-800">
              <CardHeader>
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <CardTitle>Secure & Reliable</CardTitle>
                <CardDescription>
                  Industry-standard authentication and robust infrastructure
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="border-slate-200 dark:border-slate-800">
              <CardHeader>
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mb-4">
                  <Database className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <CardTitle>Powerful Features</CardTitle>
                <CardDescription>
                  Access to AI summarization, sentiment analysis, and personalization
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
          
          <Tabs defaultValue="authentication" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="authentication">Authentication</TabsTrigger>
              <TabsTrigger value="endpoints">Endpoints</TabsTrigger>
              <TabsTrigger value="sdks">SDKs</TabsTrigger>
              <TabsTrigger value="examples">Examples</TabsTrigger>
            </TabsList>
            
            <TabsContent value="authentication" className="mt-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Key className="h-5 w-5 mr-2" />
                    Authentication
                  </CardTitle>
                  <CardDescription>
                    All API requests require authentication using an API key
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Getting Your API Key</h3>
                    <p className="text-slate-600 dark:text-slate-300 mb-4">
                      To get started, you&apos;ll need to generate an API key from your dashboard:
                    </p>
                    <ol className="list-decimal pl-5 space-y-2 text-slate-600 dark:text-slate-300">
                      <li>Sign in to your NewsGenie account</li>
                      <li>Navigate to the Dashboard</li>
                      <li>Click on &quot;API Keys&quot; in the sidebar</li>
                      <li>Generate a new API key</li>
                    </ol>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Using Your API Key</h3>
                    <p className="text-slate-600 dark:text-slate-300 mb-4">
                      Include your API key in the Authorization header of your requests:
                    </p>
                    <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-4 font-mono text-sm relative">
                      <pre>Authorization: Bearer YOUR_API_KEY</pre>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="absolute top-2 right-2"
                        onClick={() => copyToClipboard("Authorization: Bearer YOUR_API_KEY")}
                      >
                        {copied === "Authorization: Bearer YOUR_API_KEY" ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Example Request</h3>
                    <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-4 font-mono text-sm relative">
                      <pre>{`fetch(&apos;/api/news?category=technology&apos;, {
  headers: {
    &apos;Authorization&apos;: &apos;Bearer YOUR_API_KEY&apos;
  }
})
.then(response => response.json())
.then(data => console.log(data));`}</pre>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="absolute top-2 right-2"
                        onClick={() => copyToClipboard(`fetch('/api/news?category=technology', {
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY'
  }
})
.then(response => response.json())
.then(data => console.log(data));`)}
                      >
                        {copied === `fetch('/api/news?category=technology', {
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY'
  }
})
.then(response => response.json())
.then(data => console.log(data));` ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="endpoints" className="mt-8">
              <div className="space-y-8">
                {endpoints.map((endpoint, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Badge variant={endpoint.method === "GET" ? "default" : "secondary"} className="mr-3">
                            {endpoint.method}
                          </Badge>
                          <code className="text-lg font-mono">{endpoint.path}</code>
                        </div>
                        <Button size="sm" variant="outline">
                          <ExternalLink className="h-4 w-4 mr-1" />
                          Try It
                        </Button>
                      </div>
                      <CardDescription>
                        {endpoint.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div>
                        <h4 className="font-semibold mb-2">Parameters</h4>
                        <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b border-slate-200 dark:border-slate-700">
                                <th className="text-left py-2">Name</th>
                                <th className="text-left py-2">Type</th>
                                <th className="text-left py-2">Description</th>
                              </tr>
                            </thead>
                            <tbody>
                              {endpoint.parameters.map((param, paramIndex) => (
                                <tr key={paramIndex} className="border-b border-slate-200 dark:border-slate-700 last:border-0">
                                  <td className="py-2 font-mono">{param.name}</td>
                                  <td className="py-2">{param.type}</td>
                                  <td className="py-2">{param.description}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold mb-2">Example</h4>
                        <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-4 font-mono text-sm relative">
                          <pre>{endpoint.example}</pre>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="absolute top-2 right-2"
                            onClick={() => copyToClipboard(endpoint.example)}
                          >
                            {copied === endpoint.example ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="sdks" className="mt-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BookOpen className="h-5 w-5 mr-2" />
                    SDKs & Libraries
                  </CardTitle>
                  <CardDescription>
                    Official SDKs to simplify integration with NewsGenie API
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="border-slate-200 dark:border-slate-800">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">JavaScript/TypeScript</CardTitle>
                          <Badge variant="outline">v1.2.0</Badge>
                        </div>
                        <CardDescription>
                          Official SDK for JavaScript and TypeScript applications
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex items-center space-x-2">
                            <Button size="sm" variant="outline">
                              <Github className="h-4 w-4 mr-1" />
                              GitHub
                            </Button>
                            <Button size="sm" variant="outline">
                              <FileText className="h-4 w-4 mr-1" />
                              Docs
                            </Button>
                          </div>
                          <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-3 font-mono text-sm">
                            <pre>npm install newsgenie-js</pre>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="border-slate-200 dark:border-slate-800">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">Python</CardTitle>
                          <Badge variant="outline">v1.0.5</Badge>
                        </div>
                        <CardDescription>
                          Official SDK for Python applications
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex items-center space-x-2">
                            <Button size="sm" variant="outline">
                              <Github className="h-4 w-4 mr-1" />
                              GitHub
                            </Button>
                            <Button size="sm" variant="outline">
                              <FileText className="h-4 w-4 mr-1" />
                              Docs
                            </Button>
                          </div>
                          <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-3 font-mono text-sm">
                            <pre>pip install newsgenie-python</pre>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="border-slate-200 dark:border-slate-800">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">Ruby</CardTitle>
                          <Badge variant="outline">v0.9.2</Badge>
                        </div>
                        <CardDescription>
                          Official SDK for Ruby applications
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex items-center space-x-2">
                            <Button size="sm" variant="outline">
                              <Github className="h-4 w-4 mr-1" />
                              GitHub
                            </Button>
                            <Button size="sm" variant="outline">
                              <FileText className="h-4 w-4 mr-1" />
                              Docs
                            </Button>
                          </div>
                          <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-3 font-mono text-sm">
                            <pre>gem install newsgenie-ruby</pre>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="border-slate-200 dark:border-slate-800">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">PHP</CardTitle>
                          <Badge variant="outline">v0.8.1</Badge>
                        </div>
                        <CardDescription>
                          Official SDK for PHP applications
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex items-center space-x-2">
                            <Button size="sm" variant="outline">
                              <Github className="h-4 w-4 mr-1" />
                              GitHub
                            </Button>
                            <Button size="sm" variant="outline">
                              <FileText className="h-4 w-4 mr-1" />
                              Docs
                            </Button>
                          </div>
                          <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-3 font-mono text-sm">
                            <pre>composer require newsgenie/php</pre>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="examples" className="mt-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Code className="h-5 w-5 mr-2" />
                    Code Examples
                  </CardTitle>
                  <CardDescription>
                    Practical examples to help you get started quickly
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Fetching News Articles</h3>
                    <Tabs defaultValue="javascript" className="w-full">
                      <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="javascript">JavaScript</TabsTrigger>
                        <TabsTrigger value="python">Python</TabsTrigger>
                        <TabsTrigger value="ruby">Ruby</TabsTrigger>
                        <TabsTrigger value="php">PHP</TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="javascript" className="mt-4">
                        <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-4 font-mono text-sm relative">
                          <pre>{`import { NewsGenie } from &apos;newsgenie-js&apos;;
const client = new NewsGenie({
  apiKey: &apos;YOUR_API_KEY&apos;
});
// Fetch technology news
const articles = await client.news.get({
  category: &apos;technology&apos;,
  limit: 10
});
console.log(articles);`}</pre>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="absolute top-2 right-2"
                            onClick={() => copyToClipboard(`import { NewsGenie } from 'newsgenie-js';
const client = new NewsGenie({
  apiKey: 'YOUR_API_KEY'
});
// Fetch technology news
const articles = await client.news.get({
  category: 'technology',
  limit: 10
});
console.log(articles);`)}
                          >
                            {copied === `import { NewsGenie } from 'newsgenie-js';
const client = new NewsGenie({
  apiKey: 'YOUR_API_KEY'
});
// Fetch technology news
const articles = await client.news.get({
  category: 'technology',
  limit: 10
});
console.log(articles);` ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                          </Button>
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="python" className="mt-4">
                        <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-4 font-mono text-sm relative">
                          <pre>{`import newsgenie
client = newsgenie.NewsGenie(api_key=&apos;YOUR_API_KEY&apos;)
# Fetch technology news
articles = client.news.get(
    category=&apos;technology&apos;,
    limit=10
)
print(articles)`}</pre>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="absolute top-2 right-2"
                            onClick={() => copyToClipboard(`import newsgenie
client = newsgenie.NewsGenie(api_key='YOUR_API_KEY')
# Fetch technology news
articles = client.news.get(
    category='technology',
    limit=10
)
print(articles)`)}
                          >
                            {copied === `import newsgenie
client = newsgenie.NewsGenie(api_key='YOUR_API_KEY')
# Fetch technology news
articles = client.news.get(
    category='technology',
    limit=10
)
print(articles)` ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                          </Button>
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="ruby" className="mt-4">
                        <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-4 font-mono text-sm relative">
                          <pre>{`require &apos;newsgenie&apos;
client = NewsGenie::Client.new(api_key: &apos;YOUR_API_KEY&apos;)
# Fetch technology news
articles = client.news.get(
  category: &apos;technology&apos;,
  limit: 10
)
puts articles`}</pre>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="absolute top-2 right-2"
                            onClick={() => copyToClipboard(`require 'newsgenie'
client = NewsGenie::Client.new(api_key: 'YOUR_API_KEY')
# Fetch technology news
articles = client.news.get(
  category: 'technology',
  limit: 10
)
puts articles`)}
                          >
                            {copied === `require 'newsgenie'
client = NewsGenie::Client.new(api_key: 'YOUR_API_KEY')
# Fetch technology news
articles = client.news.get(
  category: 'technology',
  limit: 10
)
puts articles` ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                          </Button>
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="php" className="mt-4">
                        <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-4 font-mono text-sm relative">
                          <pre>{`use NewsGenie\\Client;
$client = new Client(&apos;YOUR_API_KEY&apos;);
// Fetch technology news
$articles = $client->news()->get([
    &apos;category&apos; => &apos;technology&apos;,
    &apos;limit&apos; => 10
]);
print_r($articles);`}</pre>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="absolute top-2 right-2"
                            onClick={() => copyToClipboard(`use NewsGenie\\Client;
$client = new Client('YOUR_API_KEY');
// Fetch technology news
$articles = $client->news()->get([
    'category' => 'technology',
    'limit' => 10
]);
print_r($articles);`)}
                          >
                            {copied === `use NewsGenie\\Client;
$client = new Client('YOUR_API_KEY');
// Fetch technology news
$articles = $client->news()->get([
    'category' => 'technology',
    'limit' => 10
]);
print_r($articles);` ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                          </Button>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Updating User Preferences</h3>
                    <Tabs defaultValue="javascript" className="w-full">
                      <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="javascript">JavaScript</TabsTrigger>
                        <TabsTrigger value="python">Python</TabsTrigger>
                        <TabsTrigger value="ruby">Ruby</TabsTrigger>
                        <TabsTrigger value="php">PHP</TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="javascript" className="mt-4">
                        <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-4 font-mono text-sm relative">
                          <pre>{`import { NewsGenie } from &apos;newsgenie-js&apos;;
const client = new NewsGenie({
  apiKey: &apos;YOUR_API_KEY&apos;
});
// Update user preferences
const preferences = await client.preferences.update({
  categories: [&apos;technology&apos;, &apos;science&apos;],
  sources: [&apos;techcrunch&apos;, &apos;wired&apos;],
  language: &apos;en&apos;
});
console.log(preferences);`}</pre>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="absolute top-2 right-2"
                            onClick={() => copyToClipboard(`import { NewsGenie } from 'newsgenie-js';
const client = new NewsGenie({
  apiKey: 'YOUR_API_KEY'
});
// Update user preferences
const preferences = await client.preferences.update({
  categories: ['technology', 'science'],
  sources: ['techcrunch', 'wired'],
  language: 'en'
});
console.log(preferences);`)}
                          >
                            {copied === `import { NewsGenie } from 'newsgenie-js';
const client = new NewsGenie({
  apiKey: 'YOUR_API_KEY'
});
// Update user preferences
const preferences = await client.preferences.update({
  categories: ['technology', 'science'],
  sources: ['techcrunch', 'wired'],
  language: 'en'
});
console.log(preferences);` ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                          </Button>
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="python" className="mt-4">
                        <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-4 font-mono text-sm relative">
                          <pre>{`import newsgenie
client = newsgenie.NewsGenie(api_key=&apos;YOUR_API_KEY&apos;)
# Update user preferences
preferences = client.preferences.update(
    categories=[&apos;technology&apos;, &apos;science&apos;],
    sources=[&apos;techcrunch&apos;, &apos;wired&apos;],
    language=&apos;en&apos;
)
print(preferences)`}</pre>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="absolute top-2 right-2"
                            onClick={() => copyToClipboard(`import newsgenie
client = newsgenie.NewsGenie(api_key='YOUR_API_KEY')
# Update user preferences
preferences = client.preferences.update(
    categories=['technology', 'science'],
    sources=['techcrunch', 'wired'],
    language='en'
)
print(preferences)`)}
                          >
                            {copied === `import newsgenie
client = newsgenie.NewsGenie(api_key='YOUR_API_KEY')
# Update user preferences
preferences = client.preferences.update(
    categories=['technology', 'science'],
    sources=['techcrunch', 'wired'],
    language='en'
)
print(preferences)` ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                          </Button>
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="ruby" className="mt-4">
                        <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-4 font-mono text-sm relative">
                          <pre>{`require &apos;newsgenie&apos;
client = NewsGenie::Client.new(api_key: &apos;YOUR_API_KEY&apos;)
# Update user preferences
preferences = client.preferences.update(
  categories: [&apos;technology&apos;, &apos;science&apos;],
  sources: [&apos;techcrunch&apos;, &apos;wired&apos;],
  language: &apos;en&apos;
)
puts preferences`}</pre>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="absolute top-2 right-2"
                            onClick={() => copyToClipboard(`require 'newsgenie'
client = NewsGenie::Client.new(api_key: 'YOUR_API_KEY')
# Update user preferences
preferences = client.preferences.update(
  categories: ['technology', 'science'],
  sources: ['techcrunch', 'wired'],
  language: 'en'
)
puts preferences`)}
                          >
                            {copied === `require 'newsgenie'
client = NewsGenie::Client.new(api_key: 'YOUR_API_KEY')
# Update user preferences
preferences = client.preferences.update(
  categories: ['technology', 'science'],
  sources: ['techcrunch', 'wired'],
  language: 'en'
)
puts preferences` ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                          </Button>
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="php" className="mt-4">
                        <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-4 font-mono text-sm relative">
                          <pre>{`use NewsGenie\\Client;
$client = new Client(&apos;YOUR_API_KEY&apos;);
// Update user preferences
$preferences = $client->preferences()->update([
    &apos;categories&apos; => [&apos;technology&apos;, &apos;science&apos;],
    &apos;sources&apos; => [&apos;techcrunch&apos;, &apos;wired&apos;],
    &apos;language&apos; => &apos;en&apos;
]);
print_r($preferences);`}</pre>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="absolute top-2 right-2"
                            onClick={() => copyToClipboard(`use NewsGenie\\Client;
$client = new Client('YOUR_API_KEY');
// Update user preferences
$preferences = $client->preferences()->update([
    'categories' => ['technology', 'science'],
    'sources' => ['techcrunch', 'wired'],
    'language' => 'en'
]);
print_r($preferences);`)}
                          >
                            {copied === `use NewsGenie\\Client;
$client = new Client('YOUR_API_KEY');
// Update user preferences
$preferences = $client->preferences()->update([
    'categories' => ['technology', 'science'],
    'sources' => ['techcrunch', 'wired'],
    'language' => 'en'
]);
print_r($preferences);` ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                          </Button>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Build with NewsGenie API?
          </h2>
          <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
            Get your API key today and start integrating powerful AI capabilities into your applications.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button asChild size="lg" variant="secondary" className="bg-white text-blue-600 hover:bg-slate-100">
              <Link href="/dashboard">Get API Key</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white text-white bg-white/20 hover:bg-white hover:text-blue-600">
              <Link href="/docs">View Documentation</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}