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
  ExternalLink
} from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';
import { toast } from 'react-hot-toast';

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
  }[];
}

interface TopicExploration {
  explanation: string;
  relatedTopics: string[];
  suggestedQuestions: string[];
}

export default function ChatPage() {
  const { data: session, status } = useSession();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [topicExploration, setTopicExploration] = useState<TopicExploration | null>(null);
  const [briefing, setBriefing] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('chat');
  const [isMobile, setIsMobile] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
        body: JSON.stringify({ message: userMessage }),
      });

      if (response.ok) {
        const { response: aiResponse } = await response.json();
        
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
        body: JSON.stringify({ topic }),
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
      const response = await fetch('/api/chat/personalized-briefing');
      if (response.ok) {
        const data = await response.json();
        setBriefing(data.briefing);
        setActiveTab('briefing');
      } else {
        console.error('Failed to generate briefing');
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
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b p-4">
        <div className="container mx-auto flex flex-col sm:flex-row sm:items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">AI Assistant</h1>
            <p className="text-gray-600 text-sm">Chat with AI about news, explore topics, and get personalized briefings.</p>
          </div>
          <div className="flex items-center space-x-3 mt-4 sm:mt-0">
            <Button onClick={generateBriefing} disabled={isLoading}>
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
          <Card className="h-full flex flex-col">
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
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="chat" className="flex items-center space-x-2">
                <MessageSquare className="h-4 w-4" />
                <span>Chat</span>
              </TabsTrigger>
              <TabsTrigger value="explore" className="flex items-center space-x-2">
                <Compass className="h-4 w-4" />
                <span>Explore</span>
              </TabsTrigger>
              <TabsTrigger value="briefing" className="flex items-center space-x-2">
                <FileText className="h-4 w-4" />
                <span>Briefing</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="chat" className="flex-1 flex flex-col mt-0">
              <Card className="flex-1 flex flex-col">
                <CardHeader className="pb-3">
                  <CardTitle>
                    {activeConversation 
                      ? activeConversation.title 
                      : 'Select a conversation or start a new one'}
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
                              <p className="text-sm">
                                Ask a question about current events or news topics.
                              </p>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {activeConversation.messages.map((msg) => (
                              <div
                                key={msg.id}
                                className={`flex ${
                                  msg.role === 'user' ? 'justify-end' : 'justify-start'
                                }`}
                              >
                                <div
                                  className={`max-w-[80%] md:max-w-[70%] rounded-lg p-3 ${
                                    msg.role === 'user'
                                      ? 'bg-blue-500 text-white'
                                      : 'bg-gray-100 text-gray-800'
                                  }`}
                                >
                                  <div className="flex items-start space-x-2">
                                    {msg.role === 'assistant' && (
                                      <Bot className="h-5 w-5 mt-0.5 text-blue-500 flex-shrink-0" />
                                    )}
                                    <div className="min-w-0">
                                      <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                                      <div
                                        className={`text-xs mt-1 ${
                                          msg.role === 'user'
                                            ? 'text-blue-100'
                                            : 'text-gray-500'
                                        }`}
                                      >
                                        {format(new Date(msg.createdAt), 'h:mm a')}
                                      </div>
                                    </div>
                                    {msg.role === 'user' && (
                                      <User className="h-5 w-5 mt-0.5 text-blue-200 flex-shrink-0" />
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                            <div ref={messagesEndRef} />
                          </div>
                        )}
                      </ScrollArea>
                      <div className="border-t p-4">
                        <div className="flex space-x-2">
                          <Input
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            onKeyDown={handleKeyPress}
                            placeholder="Type your message..."
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
              <Card className="h-full flex flex-col">
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
              <Card className="h-full flex flex-col">
                <CardHeader>
                  <CardTitle>Personalized Briefing</CardTitle>
                  <CardDescription>
                    Your daily news briefing based on your interests and reading history
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  {briefing ? (
                    <div className="prose max-w-none h-full overflow-auto">
                      <p className="whitespace-pre-line leading-relaxed">{briefing}</p>
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