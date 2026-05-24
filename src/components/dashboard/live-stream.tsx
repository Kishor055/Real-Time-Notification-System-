'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Bell, 
  TrendingUp, 
  AlertTriangle, 
  Terminal, 
  ShieldCheck, 
  CheckCircle2, 
  Trash2, 
  Filter,
  Sparkles,
  Search
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useCollection, useFirestore } from '@/firebase';
import { doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { summarizeNotification } from '@/ai/flows/summarize-notification-flow';

interface Notification {
  id: string;
  topic: 'trading' | 'alerts' | 'monitoring' | 'security' | 'general';
  title: string;
  message: string;
  createdAt: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'read' | 'unread' | 'archived';
  aiSummary?: string;
}

export function LiveStream({ filterAll = false }: { filterAll?: boolean }) {
  const db = useFirestore();
  const [filter, setFilter] = useState('');
  const [topicFilter, setTopicFilter] = useState<string | null>(null);
  const [summarizingId, setSummarizingId] = useState<string | null>(null);

  const { data: events, loading } = useCollection<Notification>('notifications', {
    orderByField: 'createdAt',
    orderDirection: 'desc',
    limitCount: 50
  });

  const markAsRead = (id: string) => {
    if (!db) return;
    updateDoc(doc(db, 'notifications', id), { status: 'read' })
      .catch(err => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: `notifications/${id}`,
          operation: 'update',
          requestResourceData: { status: 'read' }
        }));
      });
  };

  const deleteNotification = (id: string) => {
    if (!db) return;
    deleteDoc(doc(db, 'notifications', id))
      .catch(err => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: `notifications/${id}`,
          operation: 'delete'
        }));
      });
  };

  const handleAISummarize = async (event: Notification) => {
    if (!db) return;
    setSummarizingId(event.id);
    try {
      const { summary } = await summarizeNotification({ notificationContent: event.message });
      updateDoc(doc(db, 'notifications', event.id), { aiSummary: summary });
    } catch (error) {
      console.error('AI Summarization failed', error);
    } finally {
      setSummarizingId(null);
    }
  };

  const filteredEvents = events.filter(e => {
    const matchesSearch = e.title.toLowerCase().includes(filter.toLowerCase()) || 
                         e.message.toLowerCase().includes(filter.toLowerCase());
    const matchesTopic = !topicFilter || e.topic === topicFilter;
    const matchesStatus = filterAll ? true : e.status === 'unread';
    return matchesSearch && matchesTopic && matchesStatus;
  });

  return (
    <Card className="glass-card border-none h-[600px] flex flex-col">
      <CardHeader className="flex flex-col gap-4 shrink-0 pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="font-headline flex items-center gap-2">
              <Bell className="size-4 text-primary animate-pulse" />
              {filterAll ? 'Event History' : 'Live Inbox'}
            </CardTitle>
            <CardDescription>Real-time distributed system telemetry</CardDescription>
          </div>
          <Badge variant="outline" className="border-primary/20 text-primary">
            <span className="size-2 rounded-full bg-primary animate-ping mr-2" />
            Live
          </Badge>
        </div>

        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input 
              placeholder="Search telemetry..." 
              className="pl-10 bg-secondary/20 border-border/40 text-xs"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
          </div>
          <div className="flex gap-1">
            {['trading', 'alerts', 'monitoring', 'security'].map(topic => (
              <Button 
                key={topic}
                variant="ghost" 
                size="sm" 
                className={`text-[9px] h-8 px-2 uppercase font-bold tracking-widest ${topicFilter === topic ? 'bg-primary/20 text-primary' : 'text-muted-foreground'}`}
                onClick={() => setTopicFilter(topicFilter === topic ? null : topic)}
              >
                {topic}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden p-0">
        <ScrollArea className="h-full px-6 pb-6">
          <div className="space-y-4 pt-2">
            {loading && <p className="text-center text-muted-foreground p-8 animate-pulse">Syncing with cluster...</p>}
            {!loading && filteredEvents.length === 0 && (
              <div className="text-center p-12 space-y-2 opacity-50">
                <CheckCircle2 className="size-10 mx-auto text-green-400" />
                <p className="font-headline font-semibold">Inbound Queue Empty</p>
                <p className="text-xs text-muted-foreground">All systems report nominal operation.</p>
              </div>
            )}
            {filteredEvents.map((event) => (
              <div 
                key={event.id} 
                className={`p-4 rounded-lg bg-secondary/30 border border-border/20 hover:border-primary/30 transition-all group animate-slide-in-right ${event.status === 'unread' ? 'border-l-4 border-l-primary' : ''}`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <TopicIcon topic={event.topic} />
                    <span className="font-headline font-bold text-sm tracking-tight">{event.title}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <SeverityBadge severity={event.severity} />
                    <span className="text-[10px] font-code text-muted-foreground">
                      {new Date(event.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </span>
                  </div>
                </div>
                
                <p className="text-sm text-muted-foreground font-body group-hover:text-foreground transition-colors leading-relaxed">
                  {event.message}
                </p>

                {event.aiSummary && (
                  <div className="mt-3 p-3 rounded bg-primary/5 border border-primary/10 flex gap-3 animate-fade-in">
                    <Sparkles className="size-4 text-primary shrink-0" />
                    <p className="text-xs text-primary/80 italic leading-snug">
                      <span className="font-bold uppercase tracking-widest text-[8px] mr-2">AI Summary:</span>
                      {event.aiSummary}
                    </p>
                  </div>
                )}

                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-[9px] font-code text-primary/60 uppercase tracking-widest">Topic: {event.topic}</span>
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" className="size-8 h-8 w-8 hover:bg-primary/10 hover:text-primary" onClick={() => handleAISummarize(event)} disabled={summarizingId === event.id}>
                      <Sparkles className={`size-3.5 ${summarizingId === event.id ? 'animate-spin' : ''}`} />
                    </Button>
                    {event.status === 'unread' && (
                      <Button variant="ghost" size="icon" className="size-8 h-8 w-8 hover:bg-green-400/10 hover:text-green-400" onClick={() => markAsRead(event.id)}>
                        <CheckCircle2 className="size-3.5" />
                      </Button>
                    )}
                    <Button variant="ghost" size="icon" className="size-8 h-8 w-8 hover:bg-destructive/10 hover:text-destructive" onClick={() => deleteNotification(event.id)}>
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

function TopicIcon({ topic }: { topic: Notification['topic'] }) {
  switch (topic) {
    case 'trading': return <TrendingUp className="size-3.5 text-accent" />;
    case 'alerts': return <AlertTriangle className="size-3.5 text-destructive" />;
    case 'monitoring': return <Terminal className="size-3.5 text-primary" />;
    case 'security': return <ShieldCheck className="size-3.5 text-primary" />;
    default: return <Bell className="size-3.5 text-muted-foreground" />;
  }
}

function SeverityBadge({ severity }: { severity: Notification['severity'] }) {
  switch (severity) {
    case 'low': return <Badge variant="secondary" className="text-[9px] h-4 px-1.5 uppercase font-bold tracking-tighter opacity-70">Low</Badge>;
    case 'medium': return <Badge className="text-[9px] h-4 px-1.5 uppercase font-bold tracking-tighter bg-blue-500/10 text-blue-400 border-none">Med</Badge>;
    case 'high': return <Badge className="text-[9px] h-4 px-1.5 uppercase font-bold tracking-tighter bg-orange-500/10 text-orange-400 border-none">High</Badge>;
    case 'critical': return <Badge className="text-[9px] h-4 px-1.5 uppercase font-bold tracking-tighter bg-accent/20 text-accent border-none animate-pulse">Crit</Badge>;
  }
}
