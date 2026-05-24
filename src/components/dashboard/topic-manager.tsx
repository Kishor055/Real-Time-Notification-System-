
'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Zap, TrendingUp, AlertTriangle, ShieldCheck, Terminal, Users } from 'lucide-react';

const TOPICS = [
  { id: 'trading', name: 'Trading Alerts', icon: TrendingUp, subscribers: 4212, active: true },
  { id: 'alerts', name: 'Critical Alerts', icon: AlertTriangle, subscribers: 844, active: true },
  { id: 'monitoring', name: 'System Monitoring', icon: Terminal, subscribers: 112, active: false },
  { id: 'security', name: 'Security Audits', icon: ShieldCheck, subscribers: 56, active: false },
];

export function TopicManager() {
  const [topics, setTopics] = useState(TOPICS);

  const toggleTopic = (id: string) => {
    setTopics(prev => prev.map(t => t.id === id ? { ...t, active: !t.active } : t));
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <Card className="glass-card border-none">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="font-headline flex items-center gap-2">
                <Zap className="size-5 text-primary" />
                Topic Orchestrator
              </CardTitle>
              <CardDescription>Manage dynamic room subscriptions for low-latency dispatch.</CardDescription>
            </div>
            <Button size="sm" className="bg-primary hover:bg-primary/80">Create New Channel</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {topics.map((topic) => (
              <div 
                key={topic.id} 
                className={`p-6 rounded-xl border transition-all duration-300 flex flex-col gap-4 ${
                  topic.active 
                    ? 'glass-indigo border-primary/40 bg-primary/5' 
                    : 'bg-secondary/20 border-border/40 opacity-70 grayscale-[0.5]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${topic.active ? 'bg-primary text-white' : 'bg-secondary text-muted-foreground'}`}>
                      <topic.icon className="size-5" />
                    </div>
                    <div>
                      <h4 className="font-headline font-bold text-lg">{topic.name}</h4>
                      <p className="text-xs text-muted-foreground font-body">ID: {topic.id}</p>
                    </div>
                  </div>
                  <Switch 
                    checked={topic.active} 
                    onCheckedChange={() => toggleTopic(topic.id)}
                  />
                </div>

                <div className="flex items-center justify-between mt-auto">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Users className="size-3" />
                    <span className="text-xs font-code">{topic.subscribers.toLocaleString()} subscribers</span>
                  </div>
                  <Badge variant={topic.active ? 'default' : 'secondary'} className="text-[10px] uppercase tracking-widest font-bold">
                    {topic.active ? 'Active' : 'Paused'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="glass-card border-none border-dashed border-primary/20">
        <CardContent className="py-10 text-center flex flex-col items-center gap-4">
          <div className="size-12 rounded-full bg-secondary flex items-center justify-center">
            <Terminal className="size-6 text-muted-foreground" />
          </div>
          <h3 className="font-headline text-xl font-bold">Redis Pub/Sub Synchronizer</h3>
          <p className="text-sm text-muted-foreground max-w-md">
            NovaPulse utilizes a shared Redis backplane to synchronize message state across multiple server instances for horizontal scaling.
          </p>
          <div className="flex gap-4">
            <Badge variant="outline" className="border-primary/20 text-primary">Backplane: 1.2M events/sec</Badge>
            <Badge variant="outline" className="border-accent/20 text-accent">Sync Delay: &lt; 2ms</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
