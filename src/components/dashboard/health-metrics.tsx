
'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import { Badge } from '@/components/ui/badge';
import { Activity, Server, Zap, Globe } from 'lucide-react';

const DATA = [
  { name: 'US-EAST', load: 65, color: '#6366f1' },
  { name: 'US-WEST', load: 42, color: '#6366f1' },
  { name: 'EU-WEST', load: 88, color: '#f0abfc' },
  { name: 'AP-SOUTH', load: 30, color: '#6366f1' },
  { name: 'SA-EAST', load: 15, color: '#6366f1' },
];

export function HealthMetrics({ expanded = false }: { expanded?: boolean }) {
  return (
    <div className={expanded ? 'space-y-6' : 'space-y-4'}>
      <Card className="glass-card border-none">
        <CardHeader>
          <CardTitle className="font-headline flex items-center gap-2">
            <Activity className="size-4 text-primary" />
            Cluster Load
          </CardTitle>
          <CardDescription>Regional gateway distribution</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={DATA}>
                <XAxis dataKey="name" fontSize={10} axisLine={false} tickLine={false} tick={{ fill: '#6b7280' }} />
                <Tooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }} 
                  contentStyle={{ backgroundColor: '#161b22', border: '1px solid #30363d', borderRadius: '8px', fontSize: '10px' }}
                />
                <Bar dataKey="load" radius={[4, 4, 0, 0]}>
                  {DATA.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} fillOpacity={0.8} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="glass-card border-none">
        <CardHeader>
          <CardTitle className="font-headline flex items-center gap-2">
            <Server className="size-4 text-accent" />
            Active Nodes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <NodeStatus name="Gateway-A" status="online" type="primary" />
          <NodeStatus name="Gateway-B" status="online" type="primary" />
          <NodeStatus name="Relay-Alpha" status="online" type="accent" />
          <NodeStatus name="Relay-Beta" status="maintenance" type="muted" />
        </CardContent>
      </Card>

      {expanded && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="glass-card border-none">
            <CardHeader>
              <CardTitle className="text-sm font-headline">Edge Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-8">
                <Globe className="size-16 text-primary/20 mb-4" />
                <p className="text-3xl font-bold font-headline">1.4ms</p>
                <p className="text-xs text-muted-foreground">P99 Edge Latency</p>
              </div>
            </CardContent>
          </Card>
          <Card className="glass-card border-none">
            <CardHeader>
              <CardTitle className="text-sm font-headline">Pub/Sub Backbone</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-8">
                <Zap className="size-16 text-accent/20 mb-4" />
                <p className="text-3xl font-bold font-headline">12.8M</p>
                <p className="text-xs text-muted-foreground">Daily Operations</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

function NodeStatus({ name, status, type }: { name: string, status: 'online' | 'offline' | 'maintenance', type: 'primary' | 'accent' | 'muted' }) {
  return (
    <div className="flex items-center justify-between p-2 rounded-md bg-white/5 border border-white/5">
      <div className="flex items-center gap-3">
        <div className={`size-2 rounded-full ${status === 'online' ? 'bg-green-400' : status === 'maintenance' ? 'bg-yellow-400' : 'bg-red-400'} animate-pulse`} />
        <span className="text-sm font-code">{name}</span>
      </div>
      <Badge variant="outline" className={`text-[9px] border-none uppercase ${
        type === 'primary' ? 'bg-primary/10 text-primary' : type === 'accent' ? 'bg-accent/10 text-accent' : 'bg-muted text-muted-foreground'
      }`}>
        {status}
      </Badge>
    </div>
  );
}
