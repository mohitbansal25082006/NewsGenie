// E:\newsgenie\src\app\chat\page.tsx
'use client';
import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  MessageSquare, 
  Plus, 
  Send, 
  Bot, 
  User, 
  BookOpen, 
  Compass, 
  FileText,
  Loader2,
  Trash2,
  Clock,
  ExternalLink,
  RefreshCw,
  Copy,
  ThumbsUp,
  ThumbsDown,
  Globe,
  Search,
  Sparkles,
  Lightbulb,
  TrendingUp
} from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Conversation {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    createdAt: string;
    sources?: string[];
  }[];
}

interface TopicExploration {
  explanation: string;
  relatedTopics: string[];
  suggestedQuestions: string[];
}

interface BriefingData {
  briefing: string;
  articlesCount: number;
  latestArticleDate: string | null;
  generatedAt: string;
  sources: string[];
  categories: string[];
  timeRange: string;
}

export default function ChatPage() {
  const { data: session, status } = useSession();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [topicExploration, setTopicExploration] = useState<TopicExploration | null>(null);
  const [briefing, setBriefing] = useState<BriefingData | null>(null);
  const [activeTab, setActiveTab] = useState('chat');
  const [isMobile, setIsMobile] = useState(false);
  const [searchMode, setSearchMode] = useState(false);
  const [webSearchEnabled, setWebSearchEnabled] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      redirect('/');
    }
  }, [status]);

  useEffect(() => {
    // Check if mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (session) {
      fetchConversations();
    }
  }, [session]);

  useEffect(() => {
    scrollToBottom();
  }, [activeConversation?.messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchConversations = async () => {
    setIsLoadingConversations(true);
    try {
      const response = await fetch('/api/chat/conversations');
      if (response.ok) {
        const data = await response.json();
        setConversations(data);
        if (data.length > 0) {
          setActiveConversation(data[0]);
        }
      } else {
        console.error('Failed to fetch conversations');
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setIsLoadingConversations(false);
    }
  };

  const createNewConversation = async () => {
    try {
      const response = await fetch('/api/chat/conversations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      });
      if (response.ok) {
        const newConversation = await response.json();
        setConversations([newConversation, ...conversations]);
        setActiveConversation(newConversation);
        setMessage('');
      } else {
        console.error('Failed to create conversation');
      }
    } catch (error) {
      console.error('Error creating conversation:', error);
    }
  };

  const sendMessage = async () => {
    if (!message.trim() || !activeConversation || isLoading) return;
    
    setIsLoading(true);
    const userMessage = message;
    setMessage('');
    
    try {
      const response = await fetch(`/api/chat/conversations/${activeConversation.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          message: userMessage,
          webSearchEnabled,
          searchMode
        }),
      });
      
      if (response.ok) {
        const { response: aiResponse, sources } = await response.json();
        
        // Update the active conversation with the new messages
        const updatedConversations = conversations.map(conv => {
          if (conv.id === activeConversation.id) {
            return {
              ...conv,
              messages: [
                ...conv.messages,
                {
                  id: Date.now().toString(),
                  role: 'user' as const,
                  content: userMessage,
                  createdAt: new Date().toISOString(),
                },
                {
                  id: (Date.now() + 1).toString(),
                  role: 'assistant' as const,
                  content: aiResponse,
                  createdAt: new Date().toISOString(),
                  sources
                }
              ],
              updatedAt: new Date().toISOString(),
            };
          }
          return conv;
        });
        
        setConversations(updatedConversations);
        setActiveConversation(updatedConversations.find(c => c.id === activeConversation.id) || null);
      } else {
        console.error('Failed to send message');
        toast.error('Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Error sending message');
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const exploreTopic = async () => {
    if (!message.trim() || isLoading) return;
    
    setIsLoading(true);
    const topic = message;
    setMessage('');
    
    try {
      const response = await fetch('/api/chat/explore-topic', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ topic, webSearchEnabled }),
      });
      
      if (response.ok) {
        const data = await response.json();
        setTopicExploration(data);
        setActiveTab('explore');
      } else {
        console.error('Failed to explore topic');
        toast.error('Failed to explore topic');
      }
    } catch (error) {
      console.error('Error exploring topic:', error);
      toast.error('Error exploring topic');
    } finally {
      setIsLoading(false);
    }
  };

  const generateBriefing = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/chat/personalized-briefing', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ webSearchEnabled }),
      });
      
      if (response.ok) {
        const data = await response.json();
        setBriefing(data);
        setActiveTab('briefing');
      } else {
        console.error('Failed to generate briefing:', await response.text());
        toast.error('Failed to generate briefing');
      }
    } catch (error) {
      console.error('Error generating briefing:', error);
      toast.error('Error generating briefing');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (activeTab === 'chat') {
        sendMessage();
      } else if (activeTab === 'explore') {
        exploreTopic();
      }
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const regenerateResponse = async () => {
    if (!activeConversation || activeConversation.messages.length === 0 || isLoading) return;
    
    // Get the last user message
    const lastUserMessage = activeConversation.messages
      .filter(msg => msg.role === 'user')
      .pop();
    
    if (!lastUserMessage) return;
    
    setIsLoading(true);
    
    try {
      const response = await fetch(`/api/chat/conversations/${activeConversation.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          message: lastUserMessage.content,
          webSearchEnabled,
          searchMode,
          regenerate: true
        }),
      });
      
      if (response.ok) {
        const { response: aiResponse, sources } = await response.json();
        
        // Update the active conversation with the new messages
        const updatedConversations = conversations.map(conv => {
          if (conv.id === activeConversation.id) {
            // Remove the last assistant message and add the new one
            const messagesWithoutLastAssistant = conv.messages.slice(0, -1);
            return {
              ...conv,
              messages: [
                ...messagesWithoutLastAssistant,
                {
                  id: Date.now().toString(),
                  role: 'assistant' as const,
                  content: aiResponse,
                  createdAt: new Date().toISOString(),
                  sources
                }
              ],
              updatedAt: new Date().toISOString(),
            };
          }
          return conv;
        });
        
        setConversations(updatedConversations);
        setActiveConversation(updatedConversations.find(c => c.id === activeConversation.id) || null);
      } else {
        console.error('Failed to regenerate response');
        toast.error('Failed to regenerate response');
      }
    } catch (error) {
      console.error('Error regenerating response:', error);
      toast.error('Error regenerating response');
    } finally {
      setIsLoading(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b shadow-sm p-4">
        <div className="container mx-auto flex flex-col sm:flex-row sm:items-center justify-between">
          <div className="flex items-center space-x-3 mb-4 sm:mb-0">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">NewsGenie AI</h1>
              <p className="text-gray-600 text-sm">Your intelligent news assistant</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Button 
              variant={webSearchEnabled ? "default" : "outline"} 
              size="sm" 
              onClick={() => setWebSearchEnabled(!webSearchEnabled)}
              className="flex items-center"
            >
              <Globe className="h-4 w-4 mr-2" />
              Web Search {webSearchEnabled ? "On" : "Off"}
            </Button>
            <Button onClick={generateBriefing} disabled={isLoading} className="flex items-center">
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <FileText className="h-4 w-4 mr-2" />
              )}
              Daily Briefing
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 container mx-auto px-4 py-6 flex flex-col md:flex-row gap-6 overflow-hidden">
        {/* Sidebar */}
        <div className="w-full md:w-64 flex-shrink-0">
          <Card className="h-full flex flex-col shadow-sm border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Conversations</CardTitle>
                <Button size="sm" variant="ghost" onClick={createNewConversation}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="flex-1 p-0 overflow-hidden">
              <ScrollArea className="h-full">
                {isLoadingConversations ? (
                  <div className="flex items-center justify-center p-4">
                    <Loader2 className="h-5 w-5 animate-spin text-gray-500" />
                  </div>
                ) : conversations.length === 0 ? (
                  <div className="p-4 text-center text-sm text-gray-500">
                    No conversations yet
                  </div>
                ) : (
                  <div className="space-y-1 p-2">
                    {conversations.map((conversation) => (
                      <button
                        key={conversation.id}
                        className={`w-full text-left p-3 rounded-md transition-colors ${
                          activeConversation?.id === conversation.id
                            ? 'bg-blue-100 text-blue-800'
                            : 'hover:bg-gray-100'
                        }`}
                        onClick={() => setActiveConversation(conversation)}
                      >
                        <div className="font-medium truncate">{conversation.title}</div>
                        <div className="text-xs text-gray-500 flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {format(new Date(conversation.updatedAt), 'MMM d')}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col min-h-0">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-3 mb-6 bg-white p-1 rounded-lg shadow-sm">
              <TabsTrigger value="chat" className="flex items-center space-x-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                <MessageSquare className="h-4 w-4" />
                <span>Chat</span>
              </TabsTrigger>
              <TabsTrigger value="explore" className="flex items-center space-x-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                <Compass className="h-4 w-4" />
                <span>Explore</span>
              </TabsTrigger>
              <TabsTrigger value="briefing" className="flex items-center space-x-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                <FileText className="h-4 w-4" />
                <span>Briefing</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="chat" className="flex-1 flex flex-col mt-0">
              <Card className="flex-1 flex flex-col shadow-sm border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center">
                    {activeConversation 
                      ? activeConversation.title 
                      : 'Select a conversation or start a new one'}
                    {activeConversation && (
                      <Badge variant="outline" className="ml-2 text-xs">
                        {activeConversation.messages.length} messages
                      </Badge>
                    )}
                  </CardTitle>
                  <CardDescription>
                    Chat with AI about news and current events
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col p-0">
                  {activeConversation ? (
                    <>
                      <ScrollArea className="flex-1 p-4">
                        {activeConversation.messages.length === 0 ? (
                          <div className="flex items-center justify-center h-full text-gray-500">
                            <div className="text-center max-w-md">
                              <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                              <h3 className="text-lg font-medium mb-2">Start a conversation</h3>
                              <p className="text-sm mb-6">
                                Ask a question about current events or news topics. I can search the web for the latest information.
                              </p>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                <Button 
                                  variant="outline" 
                                  className="justify-start h-auto p-3"
                                  onClick={() => setMessage("What are the latest developments in AI technology?")}
                                >
                                  <Lightbulb className="h-4 w-4 mr-2 flex-shrink-0" />
                                  <span className="text-left">Latest AI developments</span>
                                </Button>
                                <Button 
                                  variant="outline" 
                                  className="justify-start h-auto p-3"
                                  onClick={() => setMessage("What's happening in global politics today?")}
                                >
                                  <Globe className="h-4 w-4 mr-2 flex-shrink-0" />
                                  <span className="text-left">Global politics news</span>
                                </Button>
                                <Button 
                                  variant="outline" 
                                  className="justify-start h-auto p-3"
                                  onClick={() => setMessage("Show me the latest stock market news")}
                                >
                                  <TrendingUp className="h-4 w-4 mr-2 flex-shrink-0" />
                                  <span className="text-left">Stock market updates</span>
                                </Button>
                                <Button 
                                  variant="outline" 
                                  className="justify-start h-auto p-3"
                                  onClick={() => setMessage("What are the top science stories this week?")}
                                >
                                  <BookOpen className="h-4 w-4 mr-2 flex-shrink-0" />
                                  <span className="text-left">Top science stories</span>
                                </Button>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-6">
                            {activeConversation.messages.map((msg, index) => (
                              <div
                                key={msg.id}
                                className={`flex ${
                                  msg.role === 'user' ? 'justify-end' : 'justify-start'
                                }`}
                              >
                                <div
                                  className={`max-w-[80%] md:max-w-[70%] rounded-2xl p-4 ${
                                    msg.role === 'user'
                                      ? 'bg-blue-500 text-white'
                                      : 'bg-gray-100 text-gray-800'
                                  }`}
                                >
                                  <div className="flex items-start space-x-3">
                                    {msg.role === 'assistant' && (
                                      <div className="bg-blue-100 p-2 rounded-full flex-shrink-0">
                                        <Bot className="h-5 w-5 text-blue-600" />
                                      </div>
                                    )}
                                    <div className="min-w-0 flex-1">
                                      <div className="prose prose-sm max-w-none">
                                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                          {msg.content}
                                        </ReactMarkdown>
                                      </div>
                                      
                                      {msg.sources && msg.sources.length > 0 && (
                                        <div className="mt-3 pt-3 border-t border-gray-200">
                                          <p className="text-xs font-medium text-gray-500 mb-2">Sources:</p>
                                          <div className="space-y-1">
                                            {msg.sources.slice(0, 3).map((source, i) => (
                                              <div key={i} className="flex items-center text-xs text-gray-600">
                                                <ExternalLink className="h-3 w-3 mr-1 flex-shrink-0" />
                                                <span className="truncate">{source}</span>
                                              </div>
                                            ))}
                                          </div>
                                        </div>
                                      )}
                                      
                                      <div
                                        className={`text-xs mt-2 ${
                                          msg.role === 'user'
                                            ? 'text-blue-100'
                                            : 'text-gray-500'
                                        } flex items-center justify-between`}
                                      >
                                        <span>{format(new Date(msg.createdAt), 'h:mm a')}</span>
                                        <div className="flex space-x-1">
                                          <button 
                                            onClick={() => copyToClipboard(msg.content)}
                                            className="p-1 rounded hover:bg-gray-200 hover:text-gray-700 transition-colors"
                                          >
                                            <Copy className="h-3 w-3" />
                                          </button>
                                          {msg.role === 'assistant' && (
                                            <>
                                              <button 
                                                className="p-1 rounded hover:bg-gray-200 hover:text-gray-700 transition-colors"
                                              >
                                                <ThumbsUp className="h-3 w-3" />
                                              </button>
                                              <button 
                                                className="p-1 rounded hover:bg-gray-200 hover:text-gray-700 transition-colors"
                                              >
                                                <ThumbsDown className="h-3 w-3" />
                                              </button>
                                            </>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                    {msg.role === 'user' && (
                                      <div className="bg-blue-400 p-2 rounded-full flex-shrink-0">
                                        <User className="h-5 w-5 text-white" />
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                            <div ref={messagesEndRef} />
                          </div>
                        )}
                      </ScrollArea>
                      <div className="border-t p-4 bg-white">
                        <div className="flex space-x-2 mb-3">
                          <Button 
                            variant={searchMode ? "default" : "outline"} 
                            size="sm" 
                            onClick={() => setSearchMode(!searchMode)}
                            className="flex items-center"
                          >
                            <Search className="h-4 w-4 mr-2" />
                            Search Mode {searchMode ? "On" : "Off"}
                          </Button>
                          {activeConversation.messages.length > 0 && (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={regenerateResponse}
                              disabled={isLoading}
                              className="flex items-center"
                            >
                              <RefreshCw className="h-4 w-4 mr-2" />
                              Regenerate
                            </Button>
                          )}
                        </div>
                        <div className="flex space-x-2">
                          <Input
                            ref={inputRef}
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            onKeyDown={handleKeyPress}
                            placeholder="Ask about the latest news or current events..."
                            disabled={isLoading}
                            className="flex-1"
                          />
                          <Button
                            onClick={sendMessage}
                            disabled={!message.trim() || isLoading}
                          >
                            {isLoading ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Send className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                        <div className="text-xs text-gray-500 mt-2">
                          {webSearchEnabled 
                            ? "Web search is enabled - I'll find the latest information from across the internet"
                            : "Web search is disabled - I'll use my knowledge base"}
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-500">
                      <div className="text-center">
                        <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                        <h3 className="text-lg font-medium mb-2">No conversation selected</h3>
                        <p className="text-sm mb-4">
                          Select a conversation from the sidebar or start a new one.
                        </p>
                        <Button onClick={createNewConversation}>
                          <Plus className="h-4 w-4 mr-2" />
                          New Conversation
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="explore" className="flex-1 mt-0">
              <Card className="h-full flex flex-col shadow-sm border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>Explore Topics</CardTitle>
                  <CardDescription>
                    Discover related articles and background information about news topics
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col space-y-6">
                  <div className="flex space-x-2">
                    <Input
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyDown={handleKeyPress}
                      placeholder="Enter a topic to explore..."
                      disabled={isLoading}
                      className="flex-1"
                    />
                    <Button
                      onClick={exploreTopic}
                      disabled={!message.trim() || isLoading}
                    >
                      {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Compass className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  {topicExploration && (
                    <div className="space-y-6 flex-1 overflow-auto">
                      <div>
                        <h3 className="text-lg font-medium mb-2">Explanation</h3>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                            {topicExploration.explanation}
                          </p>
                        </div>
                      </div>
                      {topicExploration.relatedTopics.length > 0 && (
                        <div>
                          <h3 className="text-lg font-medium mb-2">Related Topics</h3>
                          <div className="flex flex-wrap gap-2">
                            {topicExploration.relatedTopics.map((topic, index) => (
                              <Badge key={index} variant="outline" className="text-sm">
                                {topic}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      {topicExploration.suggestedQuestions.length > 0 && (
                        <div>
                          <h3 className="text-lg font-medium mb-2">Suggested Questions</h3>
                          <div className="space-y-2">
                            {topicExploration.suggestedQuestions.map((question, index) => (
                              <div
                                key={index}
                                className="bg-gray-50 p-3 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                                onClick={() => setMessage(question)}
                              >
                                <p className="text-sm text-gray-700 whitespace-pre-wrap">
                                  {question}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="briefing" className="flex-1 mt-0">
              <Card className="h-full flex flex-col shadow-sm border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Personalized Briefing</CardTitle>
                    <CardDescription>
                      Your daily news briefing based on your interests and reading history
                    </CardDescription>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={generateBriefing}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <RefreshCw className="h-4 w-4 mr-2" />
                    )}
                    Refresh
                  </Button>
                </CardHeader>
                <CardContent className="flex-1">
                  {briefing ? (
                    <div className="h-full overflow-auto">
                      <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                        <div className="flex items-center text-sm text-blue-800">
                          <FileText className="h-4 w-4 mr-2" />
                          <span>Generated on {format(new Date(briefing.generatedAt), 'MMMM d, yyyy at h:mm a')}</span>
                        </div>
                        <div className="flex items-center text-sm text-blue-700 mt-1">
                          <span>Based on {briefing.articlesCount} latest articles</span>
                          {briefing.latestArticleDate && (
                            <>
                              <span className="mx-2">•</span>
                              <span>Latest from {format(new Date(briefing.latestArticleDate), 'MMMM d')}</span>
                            </>
                          )}
                        </div>
                        <div className="flex items-center text-sm text-blue-700 mt-1">
                          <span>Categories: {briefing.categories.join(', ')}</span>
                        </div>
                      </div>
                      
                      <div className="prose prose-sm max-w-none">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {briefing.briefing}
                        </ReactMarkdown>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 h-full flex items-center justify-center">
                      <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                      <h3 className="text-lg font-medium mb-2">No briefing available</h3>
                      <p className="text-gray-600 mb-4">
                        Generate your personalized daily briefing to stay updated on news that matters to you.
                      </p>
                      <Button onClick={generateBriefing} disabled={isLoading}>
                        {isLoading ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <FileText className="h-4 w-4 mr-2" />
                            Generate Briefing
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}