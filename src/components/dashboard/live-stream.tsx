
'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bell, TrendingUp, AlertTriangle, Terminal, ShieldCheck } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useCollection } from '@/firebase';

interface Notification {
  id: string;
  topic: 'trading' | 'alerts' | 'monitoring' | 'security';
  title: string;
  message: string;
  createdAt: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export function LiveStream({ filterAll = false }: { filterAll?: boolean }) {
  const { data: events, loading } = useCollection<Notification>('notifications', {
    orderByField: 'createdAt',
    orderDirection: 'desc',
    limitCount: 50
  });

  return (
    <Card className="glass-card border-none h-[500px] flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between shrink-0">
        <div>
          <CardTitle className="font-headline flex items-center gap-2">
            <Bell className="size-4 text-primary animate-pulse" />
            Live Event Stream
          </CardTitle>
          <CardDescription>Real-time distributed system telemetry</CardDescription>
        </div>
        <Badge variant="outline" className="border-primary/20 text-primary">
          <span className="size-2 rounded-full bg-primary animate-ping mr-2" />
          Live
        </Badge>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden p-0">
        <ScrollArea className="h-full px-6 pb-6">
          <div className="space-y-4 pt-2">
            {loading && <p className="text-center text-muted-foreground p-8 animate-pulse">Syncing with cluster...</p>}
            {!loading && events.length === 0 && (
              <p className="text-center text-muted-foreground p-8">No active events in current buffer.</p>
            )}
            {events.map((event) => (
              <div 
                key={event.id} 
                className="p-4 rounded-lg bg-secondary/30 border border-border/20 hover:border-primary/30 transition-all group animate-slide-in-right"
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
                <p className="text-sm text-muted-foreground line-clamp-2 font-body group-hover:text-foreground transition-colors">
                  {event.message}
                </p>
                <div className="mt-3 flex items-center gap-3">
                  <span className="text-[9px] font-code text-primary/60 uppercase tracking-widest">Topic: {event.topic}</span>
                  <div className="h-1 flex-1 bg-border/20 rounded-full overflow-hidden">
                    <div className="h-full bg-primary/40 animate-pulse w-full" />
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
