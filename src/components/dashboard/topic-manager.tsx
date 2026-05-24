
'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Zap, TrendingUp, AlertTriangle, ShieldCheck, Terminal, Users } from 'lucide-react';
import { useCollection, useFirestore } from '@/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

interface Topic {
  id: string;
  name: string;
  active: boolean;
  subscribersCount: number;
}

export function TopicManager() {
  const { db } = useFirestore();
  const { data: topics, loading } = useCollection<Topic>('topics');

  const toggleTopic = (id: string, currentActive: boolean) => {
    if (!db) return;
    const docRef = doc(db, 'topics', id);
    updateDoc(docRef, { active: !currentActive })
      .catch(async (error) => {
        const permissionError = new FirestorePermissionError({
          path: `topics/${id}`,
          operation: 'update',
          requestResourceData: { active: !currentActive }
        });
        errorEmitter.emit('permission-error', permissionError);
      });
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
          {loading && <p className="text-center py-10 animate-pulse text-muted-foreground">Synchronizing orchestration state...</p>}
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
                      <TopicIcon name={topic.name} />
                    </div>
                    <div>
                      <h4 className="font-headline font-bold text-lg">{topic.name}</h4>
                      <p className="text-xs text-muted-foreground font-body">ID: {topic.id}</p>
                    </div>
                  </div>
                  <Switch 
                    checked={topic.active} 
                    onCheckedChange={() => toggleTopic(topic.id, topic.active)}
                  />
                </div>

                <div className="flex items-center justify-between mt-auto">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Users className="size-3" />
                    <span className="text-xs font-code">{topic.subscribersCount.toLocaleString()} subscribers</span>
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
          <h3 className="font-headline text-xl font-bold">Real-time Pub/Sub Backbone</h3>
          <p className="text-sm text-muted-foreground max-w-md">
            NovaPulse utilizes Firestore's real-time SDK to synchronize message state across all active client instances instantly.
          </p>
          <div className="flex gap-4">
            <Badge variant="outline" className="border-primary/20 text-primary">Latency: &lt; 200ms</Badge>
            <Badge variant="outline" className="border-accent/20 text-accent">Availability: 99.99%</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function TopicIcon({ name }: { name: string }) {
  const n = name.toLowerCase();
  if (n.includes('trading')) return <TrendingUp className="size-5" />;
  if (n.includes('alert')) return <AlertTriangle className="size-5" />;
  if (n.includes('security')) return <ShieldCheck className="size-5" />;
  return <Terminal className="size-5" />;
}
