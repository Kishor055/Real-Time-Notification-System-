
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bell, Clock, Terminal, TrendingUp, AlertTriangle, ShieldCheck } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Event {
  id: string;
  topic: 'trading' | 'alerts' | 'monitoring' | 'security';
  title: string;
  message: string;
  time: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

const INITIAL_EVENTS: Event[] = [
  { id: '1', topic: 'trading', title: 'BTC/USD Liquidation', message: 'Significant buy wall detected at $65k. Volume spike observed.', time: '14:20:05', severity: 'medium' },
  { id: '2', topic: 'security', title: 'Intrusion Detected', message: 'Failed login attempts from unknown IP 192.168.1.42.', time: '14:21:12', severity: 'high' },
  { id: '3', topic: 'monitoring', title: 'CPU Threshold', message: 'Node-14 cluster utilization exceeded 85%. Scaling initiated.', time: '14:22:30', severity: 'low' },
  { id: '4', topic: 'alerts', title: 'System Outage', message: 'Websocket gateway in US-EAST-1 experiencing intermittent drops.', time: '14:23:45', severity: 'critical' },
];

export function LiveStream({ filterAll = false }: { filterAll?: boolean }) {
  const [events, setEvents] = useState<Event[]>(INITIAL_EVENTS);

  useEffect(() => {
    const interval = setInterval(() => {
      const types: Event['topic'][] = ['trading', 'alerts', 'monitoring', 'security'];
      const severities: Event['severity'][] = ['low', 'medium', 'high', 'critical'];
      const newEvent: Event = {
        id: Math.random().toString(36).substr(2, 9),
        topic: types[Math.floor(Math.random() * types.length)],
        severity: severities[Math.floor(Math.random() * severities.length)],
        title: 'New Dynamic Event',
        message: 'Real-time telemetry update processed by NovaPulse cluster.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      };
      setEvents(prev => [newEvent, ...prev].slice(0, 20));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

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
                    <span className="text-[10px] font-code text-muted-foreground">{event.time}</span>
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

function TopicIcon({ topic }: { topic: Event['topic'] }) {
  switch (topic) {
    case 'trading': return <TrendingUp className="size-3.5 text-accent" />;
    case 'alerts': return <AlertTriangle className="size-3.5 text-destructive" />;
    case 'monitoring': return <Terminal className="size-3.5 text-primary" />;
    case 'security': return <ShieldCheck className="size-3.5 text-primary" />;
  }
}

function SeverityBadge({ severity }: { severity: Event['severity'] }) {
  switch (severity) {
    case 'low': return <Badge variant="secondary" className="text-[9px] h-4 px-1.5 uppercase font-bold tracking-tighter opacity-70">Low</Badge>;
    case 'medium': return <Badge className="text-[9px] h-4 px-1.5 uppercase font-bold tracking-tighter bg-blue-500/10 text-blue-400 border-none">Med</Badge>;
    case 'high': return <Badge className="text-[9px] h-4 px-1.5 uppercase font-bold tracking-tighter bg-orange-500/10 text-orange-400 border-none">High</Badge>;
    case 'critical': return <Badge className="text-[9px] h-4 px-1.5 uppercase font-bold tracking-tighter bg-accent/20 text-accent border-none animate-pulse">Crit</Badge>;
  }
}
