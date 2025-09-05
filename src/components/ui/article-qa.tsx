// E:\newsgenie\src\components\ui\article-qa.tsx
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageSquare, Send, Bot, User, Loader2, BookOpen } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';

interface Article {
  id: string;
  title: string;
  content: string;
  url: string;
  publishedAt: string;
  source: string;
  author: string;
}

interface QAMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: Date;
}

export function ArticleQA({ article }: { article: Article }) {
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState<QAMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const askQuestion = async () => {
    if (!question.trim() || isLoading) return;

    setIsLoading(true);
    const userQuestion = question;
    setQuestion('');

    // Add user message
    const userMessage: QAMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: userQuestion,
      createdAt: new Date(),
    };
    setMessages([...messages, userMessage]);

    try {
      const response = await fetch('/api/chat/article-qa', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          articleId: article.id,
          question: userQuestion,
        }),
      });

      if (response.ok) {
        const { answer } = await response.json();
        
        // Add assistant message
        const assistantMessage: QAMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: answer,
          createdAt: new Date(),
        };
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        console.error('Failed to get answer');
        toast.error('Failed to get answer');
      }
    } catch (error) {
      console.error('Error asking question:', error);
      toast.error('Error asking question');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      askQuestion();
    }
  };

  return (
    <Card className="mt-4">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center">
              <BookOpen className="h-5 w-5 mr-2" />
              Article Q&A
            </CardTitle>
            <CardDescription>
              Ask questions about this article
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? 'Collapse' : 'Expand'}
          </Button>
        </div>
      </CardHeader>
      {isExpanded && (
        <CardContent className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">{article.title}</h4>
            <div className="flex items-center text-sm text-gray-500">
              <span>{article.source}</span>
              <span className="mx-2">•</span>
              <span>{format(new Date(article.publishedAt), 'MMM d, yyyy')}</span>
              {article.author && (
                <>
                  <span className="mx-2">•</span>
                  <span>{article.author}</span>
                </>
              )}
            </div>
          </div>

          <Separator />

          {messages.length > 0 && (
            <ScrollArea className="h-64 p-2 border rounded-lg">
              <div className="space-y-4">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${
                      msg.role === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg p-3 ${
                        msg.role === 'user'
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      <div className="flex items-start space-x-2">
                        {msg.role === 'assistant' && (
                          <Bot className="h-5 w-5 mt-0.5 text-blue-500" />
                        )}
                        <div>
                          <p className="whitespace-pre-wrap">{msg.content}</p>
                          <div
                            className={`text-xs mt-1 ${
                              msg.role === 'user'
                                ? 'text-blue-100'
                                : 'text-gray-500'
                            }`}
                          >
                            {format(msg.createdAt, 'h:mm a')}
                          </div>
                        </div>
                        {msg.role === 'user' && (
                          <User className="h-5 w-5 mt-0.5 text-blue-200" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}

          <div className="flex space-x-2">
            <Input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Ask a question about this article..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button
              onClick={askQuestion}
              disabled={!question.trim() || isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  );
}