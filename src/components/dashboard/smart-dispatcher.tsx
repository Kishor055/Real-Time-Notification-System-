
'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Loader2, Bot, Send, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { suggestNotificationRouting } from '@/ai/flows/suggest-notification-routing-flow';
import type { SuggestNotificationRoutingOutput } from '@/ai/flows/suggest-notification-routing-flow';
import { useFirestore, useUser } from '@/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export function SmartDispatcher() {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<SuggestNotificationRoutingOutput | null>(null);
  const { db } = useFirestore();
  const { user } = useUser();

  const handleAnalyze = async () => {
    if (!input.trim()) return;
    setIsLoading(true);
    try {
      const data = await suggestNotificationRouting({
        messageContent: input,
        eventType: 'manual_dispatch',
        sourceSystem: 'NovaPulse UI',
        severity: 'medium'
      });
      setResult(data);
    } catch (error) {
      console.error('AI Analysis failed', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDispatch = () => {
    if (!result || !db) return;

    const notificationData = {
      userId: user?.uid || 'anonymous',
      title: result.categorization + " Event",
      message: result.summary,
      topic: result.suggestedRoutes[0]?.toLowerCase() || 'general',
      severity: result.priorityLevel,
      status: 'unread',
      createdAt: new Date().toISOString(),
      aiCategory: result.categorization,
      aiPriority: result.priorityLevel,
      aiSummary: result.summary
    };

    addDoc(collection(db, 'notifications'), notificationData)
      .then(() => {
        setResult(null);
        setInput('');
      })
      .catch(async (error) => {
        const permissionError = new FirestorePermissionError({
          path: 'notifications',
          operation: 'create',
          requestResourceData: notificationData
        });
        errorEmitter.emit('permission-error', permissionError);
      });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in">
      <Card className="glass-card border-none">
        <CardHeader>
          <div className="size-10 rounded-full bg-primary/20 flex items-center justify-center mb-2">
            <Bot className="size-6 text-primary" />
          </div>
          <CardTitle className="font-headline">AI Smart Dispatcher</CardTitle>
          <CardDescription>
            Input raw notification content and let NovaPulse AI determine priority, categorization, and routing paths.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea 
            placeholder="Paste raw log data or alert message here..."
            className="min-h-[200px] bg-secondary/20 border-border/40 font-body text-sm resize-none focus:border-primary/50"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
        </CardContent>
        <CardFooter>
          <Button 
            className="w-full font-headline font-bold tracking-tight" 
            disabled={isLoading || !input.trim()}
            onClick={handleAnalyze}
          >
            {isLoading ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyzing Intelligence...</>
            ) : (
              <><Send className="mr-2 h-4 w-4" /> Run Smart Dispatch</>
            )}
          </Button>
        </CardFooter>
      </Card>

      <div className="space-y-4">
        {!result && !isLoading && (
          <div className="h-full flex flex-col items-center justify-center p-8 text-center glass-card rounded-xl border-dashed border-border/40 opacity-50">
            <AlertCircle className="size-12 mb-4 text-muted-foreground" />
            <p className="font-headline font-semibold">Ready for Analysis</p>
            <p className="text-sm text-muted-foreground">Submit data to see AI insights</p>
          </div>
        )}

        {isLoading && (
          <div className="h-full flex flex-col items-center justify-center p-8 text-center glass-card rounded-xl">
            <Loader2 className="size-12 mb-4 text-primary animate-spin" />
            <p className="font-headline font-semibold">Synthesizing Context...</p>
            <p className="text-sm text-muted-foreground">Analyzing clusters and routing tables</p>
          </div>
        )}

        {result && (
          <Card className="glass-card border-none overflow-hidden animate-slide-in-right">
            <div className="h-1 bg-gradient-to-r from-primary to-accent" />
            <CardHeader>
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="border-primary/20 text-primary uppercase font-code">
                  Analysis Complete
                </Badge>
                <div className="flex gap-2">
                  <Badge className="bg-primary/20 text-primary border-none">{result.categorization}</Badge>
                  <Badge className={`border-none ${
                    result.priorityLevel === 'critical' ? 'bg-accent/20 text-accent' : 'bg-secondary text-muted-foreground'
                  }`}>
                    {result.priorityLevel.toUpperCase()}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="text-[10px] text-muted-foreground uppercase tracking-widest mb-2">Concise Summary</h4>
                <p className="text-sm font-body text-foreground leading-relaxed italic">
                  "{result.summary}"
                </p>
              </div>

              <div>
                <h4 className="text-[10px] text-muted-foreground uppercase tracking-widest mb-3">Optimal Routing Paths</h4>
                <div className="flex flex-wrap gap-2">
                  {result.suggestedRoutes.map((route, i) => (
                    <div key={i} className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-secondary/50 border border-border/20 text-xs font-code">
                      <ArrowRight className="size-3 text-primary" />
                      {route}
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-border/20">
                <div className="flex items-center gap-2 text-green-400 text-xs">
                  <CheckCircle2 className="size-4" />
                  <span>Validation passed. System ready for automatic dispatch.</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex gap-2">
              <Button variant="outline" className="flex-1 border-primary/20 hover:bg-primary/10" onClick={() => setResult(null)}>
                Clear
              </Button>
              <Button className="flex-1" onClick={handleDispatch}>
                Broadcast Notification
              </Button>
            </CardFooter>
          </Card>
        )}
      </div>
    </div>
  );
}
