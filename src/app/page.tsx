
'use client';

import React, { useState, useEffect } from 'react';
import { 
  AppWindow, 
  Activity, 
  Zap, 
  ShieldCheck, 
  Settings, 
  History, 
  Radio, 
  Bell, 
  Cpu, 
  BarChart3, 
  LayoutDashboard,
  Bot,
  Terminal,
  Server,
  Users
} from 'lucide-react';
import { Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarGroup, SidebarGroupLabel, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { SmartDispatcher } from '@/components/dashboard/smart-dispatcher';
import { LiveStream } from '@/components/dashboard/live-stream';
import { HealthMetrics } from '@/components/dashboard/health-metrics';
import { TopicManager } from '@/components/dashboard/topic-manager';

export default function NovaPulseDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [connectionCount, setConnectionCount] = useState(12482);
  const [latency, setLatency] = useState(4);

  useEffect(() => {
    const interval = setInterval(() => {
      setConnectionCount(prev => prev + Math.floor(Math.random() * 21) - 10);
      setLatency(prev => Math.max(2, Math.min(12, prev + (Math.random() * 2 - 1))));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex h-screen w-full bg-[#0f101a] text-foreground">
      {/* Sidebar Component */}
      <Sidebar collapsible="icon" className="border-r border-border/40">
        <SidebarHeader className="p-4 flex flex-row items-center gap-2">
          <div className="size-8 rounded-lg bg-primary flex items-center justify-center shadow-[0_0_15px_rgba(99,102,241,0.5)]">
            <Radio className="size-5 text-white" />
          </div>
          <span className="font-headline font-bold text-xl tracking-tight bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent group-data-[collapsible=icon]:hidden">
            NovaPulse
          </span>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel className="font-headline uppercase tracking-widest text-[10px] text-muted-foreground/60">System</SidebarGroupLabel>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={() => setActiveTab('overview')} isActive={activeTab === 'overview'}>
                  <LayoutDashboard className="size-4" />
                  <span>Overview</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={() => setActiveTab('health')} isActive={activeTab === 'health'}>
                  <Activity className="size-4" />
                  <span>Presence & Health</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>

          <SidebarGroup>
            <SidebarGroupLabel className="font-headline uppercase tracking-widest text-[10px] text-muted-foreground/60">Orchestration</SidebarGroupLabel>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={() => setActiveTab('dispatcher')} isActive={activeTab === 'dispatcher'}>
                  <Bot className="size-4" />
                  <span>Smart Dispatcher</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={() => setActiveTab('topics')} isActive={activeTab === 'topics'}>
                  <Zap className="size-4" />
                  <span>Topic Channels</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>

          <SidebarGroup>
            <SidebarGroupLabel className="font-headline uppercase tracking-widest text-[10px] text-muted-foreground/60">Archive</SidebarGroupLabel>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={() => setActiveTab('history')} isActive={activeTab === 'history'}>
                  <History className="size-4" />
                  <span>Event Persistence</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={() => setActiveTab('api')} isActive={activeTab === 'api'}>
                  <Terminal className="size-4" />
                  <span>Push API Explorer</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>

      <SidebarInset className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 border-b border-border/40 flex items-center justify-between px-6 glass shrink-0">
          <div className="flex items-center gap-4">
            <SidebarTrigger />
            <div className="h-4 w-px bg-border/40" />
            <h2 className="font-headline font-semibold text-lg">
              {activeTab === 'overview' && 'System Command Center'}
              {activeTab === 'health' && 'Cluster Health Monitor'}
              {activeTab === 'dispatcher' && 'AI Dispatcher Lab'}
              {activeTab === 'topics' && 'Topic Orchestration'}
              {activeTab === 'history' && 'Event Ledger'}
              {activeTab === 'api' && 'API Integration'}
            </h2>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex flex-col items-end group">
              <span className="text-[10px] text-muted-foreground uppercase tracking-widest">Global Latency</span>
              <span className="font-code text-primary font-bold">{latency.toFixed(1)}ms</span>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-[10px] text-muted-foreground uppercase tracking-widest">Live Connections</span>
              <span className="font-code text-accent font-bold">{connectionCount.toLocaleString()}</span>
            </div>
            <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center border border-border/40 cursor-pointer hover:bg-border/40 transition-colors">
              <Users className="size-4 text-muted-foreground" />
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 scrollbar-hide">
          <div className="max-w-7xl mx-auto space-y-6">
            
            {activeTab === 'overview' && (
              <div className="space-y-6 animate-fade-in">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <HealthCard 
                    title="Active Sessions" 
                    value={connectionCount.toLocaleString()} 
                    trend="+12% vs last hour" 
                    icon={Users} 
                    color="primary"
                  />
                  <HealthCard 
                    title="Message Throughput" 
                    value="42.5k ops/s" 
                    trend="Steady" 
                    icon={Cpu} 
                    color="accent"
                  />
                  <HealthCard 
                    title="Nodes Online" 
                    value="12/12" 
                    trend="Nominal" 
                    icon={Server} 
                    color="primary"
                  />
                  <HealthCard 
                    title="Security Shield" 
                    value="Active" 
                    trend="JWT Validated" 
                    icon={ShieldCheck} 
                    color="accent"
                  />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2">
                    <LiveStream />
                  </div>
                  <div className="lg:col-span-1">
                    <HealthMetrics />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'health' && <HealthMetrics expanded />}
            {activeTab === 'dispatcher' && <SmartDispatcher />}
            {activeTab === 'topics' && <TopicManager />}
            {activeTab === 'history' && (
              <div className="glass-card rounded-xl p-8 border-border/40 text-center space-y-4">
                <History className="size-12 mx-auto text-muted-foreground/40" />
                <h3 className="font-headline text-2xl font-bold">Event Persistence Ledger</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  NovaPulse persists all notifications to PostgreSQL for delivery tracking and offline history retrieval. Accessing full audit logs...
                </p>
                <LiveStream filterAll />
              </div>
            )}
            {activeTab === 'api' && (
              <div className="space-y-6 animate-fade-in">
                <Card className="glass-card border-none">
                  <CardHeader>
                    <CardTitle className="font-headline">Inbound Push API Explorer</CardTitle>
                    <CardDescription>Trigger notifications globally or to specific targets via JWT-protected REST endpoints.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-black/50 p-6 rounded-lg font-code text-sm text-primary overflow-x-auto whitespace-pre">
{`curl -X POST https://api.novapulse.io/v1/notify \\
  -H "Authorization: Bearer <YOUR_JWT_TOKEN>" \\
  -H "Content-Type: application/json" \\
  -d '{
    "target": "user_id_9921",
    "topic": "trading",
    "severity": "high",
    "content": "Price target hit: $NVDA 950.00"
  }'`}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

          </div>
        </main>
      </SidebarInset>
    </div>
  );
}

function HealthCard({ title, value, trend, icon: Icon, color }: { title: string, value: string, trend: string, icon: any, color: 'primary' | 'accent' }) {
  return (
    <Card className="glass-card border-none hover:translate-y-[-2px] transition-transform duration-300">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-widest">{title}</CardTitle>
        <Icon className={`size-4 ${color === 'primary' ? 'text-primary' : 'text-accent'}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold font-headline tracking-tight">{value}</div>
        <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1">
          <Badge variant="outline" className="text-[9px] py-0 px-1 border-primary/20 bg-primary/5 text-primary">
            {trend}
          </Badge>
        </p>
      </CardContent>
    </Card>
  );
}
