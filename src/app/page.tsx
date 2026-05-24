
'use client';

import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Zap, 
  ShieldCheck, 
  History, 
  Radio, 
  Bell, 
  Cpu, 
  LayoutDashboard,
  Bot,
  Terminal,
  Server,
  Users,
  LogOut,
  UserCircle,
  Loader2,
  Lock,
  ChevronRight
} from 'lucide-react';
import { 
  Sidebar, 
  SidebarContent, 
  SidebarHeader, 
  SidebarMenu, 
  SidebarMenuButton, 
  SidebarMenuItem, 
  SidebarGroup, 
  SidebarGroupLabel, 
  SidebarInset, 
  SidebarTrigger, 
  SidebarFooter 
} from '@/components/ui/sidebar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SmartDispatcher } from '@/components/dashboard/smart-dispatcher';
import { LiveStream } from '@/components/dashboard/live-stream';
import { HealthMetrics } from '@/components/dashboard/health-metrics';
import { TopicManager } from '@/components/dashboard/topic-manager';
import { useUser, useAuth, useFirestore, useCollection } from '@/firebase';
import { signInAnonymously, signOut } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export default function NovaPulseDashboard() {
  const { user, loading: authLoading } = useUser();
  const auth = useAuth();
  const db = useFirestore();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [latency, setLatency] = useState(4);

  // Real-time Active User Tracking
  const { data: userPresenceDocs } = useCollection<any>('users');
  const onlineCount = userPresenceDocs?.filter(u => u.status === 'online').length || 0;

  // Presence Tracking
  useEffect(() => {
    if (!user || !db) return;

    const userRef = doc(db, 'users', user.uid);
    const updatePresence = (status: 'online' | 'offline' | 'away') => {
      const presenceData = {
        email: user.email || `${user.uid.slice(0, 8)}@operator.novapulse.io`,
        displayName: user.displayName || 'Root Operator',
        status: status,
        lastActive: new Date().toISOString(),
        role: 'operator',
        isGuest: user.isAnonymous
      };

      setDoc(userRef, presenceData, { merge: true })
        .catch(async (err) => {
          errorEmitter.emit('permission-error', new FirestorePermissionError({
            path: `users/${user.uid}`,
            operation: 'write',
            requestResourceData: presenceData
          }));
        });
    };

    updatePresence('online');

    const handleVisibilityChange = () => {
      updatePresence(document.visibilityState === 'visible' ? 'online' : 'away');
    };

    window.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      window.removeEventListener('visibilitychange', handleVisibilityChange);
      updatePresence('offline');
    };
  }, [user, db]);

  useEffect(() => {
    const interval = setInterval(() => {
      setLatency(prev => Math.max(2, Math.min(12, prev + (Math.random() * 2 - 1))));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  if (authLoading) return <div className="h-screen w-full flex items-center justify-center bg-[#0f101a]"><LoaderPulse /></div>;

  if (!user) return <AuthScreen />;

  return (
    <div className="flex h-screen w-full bg-[#0f101a] text-foreground">
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
                  <span>Event Ledger</span>
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
        <SidebarFooter className="p-4 border-t border-border/40">
          <div className="flex items-center justify-between group-data-[collapsible=icon]:flex-col group-data-[collapsible=icon]:gap-4">
            <div className="flex items-center gap-2 group-data-[collapsible=icon]:hidden">
              <div className="size-8 rounded-full bg-secondary flex items-center justify-center border border-border/20">
                <Users className="size-4 text-muted-foreground" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold truncate max-w-[100px]">{user.uid.slice(0, 12)}</span>
                <span className="text-[9px] text-primary">Live Session</span>
              </div>
            </div>
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive" onClick={() => signOut(auth)}>
              <LogOut className="size-4" />
            </Button>
          </div>
        </SidebarFooter>
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
              <span className="text-[10px] text-muted-foreground uppercase tracking-widest">Active Operators</span>
              <span className="font-code text-accent font-bold">{onlineCount}</span>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 scrollbar-hide">
          <div className="max-w-7xl mx-auto space-y-6">
            
            {activeTab === 'overview' && (
              <div className="space-y-6 animate-fade-in">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <HealthCard title="Active Nodes" value={onlineCount.toString()} trend="Live presence" icon={Users} color="primary" />
                  <HealthCard title="Message Throughput" value="42.5k ops/s" trend="Steady" icon={Cpu} color="accent" />
                  <HealthCard title="Cluster Status" value="Nominal" trend="12/12 Online" icon={Server} color="primary" />
                  <HealthCard title="Security Shield" value="Active" trend="JWT Validated" icon={ShieldCheck} color="accent" />
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
              <div className="space-y-6">
                <LiveStream filterAll />
              </div>
            )}
            {activeTab === 'api' && (
              <div className="space-y-6 animate-fade-in">
                <Card className="glass-card border-none">
                  <CardHeader>
                    <CardTitle className="font-headline">Inbound Push API Explorer</CardTitle>
                    <CardDescription>Trigger notifications globally via JWT-protected REST endpoints.</CardDescription>
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

function LoaderPulse() {
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="size-16 rounded-full bg-primary/20 flex items-center justify-center animate-pulse">
        <Radio className="size-8 text-primary" />
      </div>
      <span className="font-headline text-sm animate-pulse text-muted-foreground uppercase tracking-widest">Initializing NovaPulse Backbone...</span>
    </div>
  );
}

function AuthScreen() {
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const auth = useAuth();
  const { toast } = useToast();

  const handleEnterPlatform = async () => {
    if (!auth) {
      toast({ 
        variant: "destructive", 
        title: "Protocol Failure", 
        description: "Authentication service not available." 
      });
      return;
    }
    setIsLoggingIn(true);
    try {
      await signInAnonymously(auth);
      toast({ 
        title: "Session Initialized", 
        description: "Enterprise gateway access granted.",
      });
    } catch (err: any) {
      console.error('Login failed:', err);
      toast({ 
        variant: "destructive", 
        title: "Access Denied", 
        description: err.message || "Protocol handshake failed." 
      });
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="h-screen w-full flex items-center justify-center bg-[#0f101a] p-4 relative overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/10 rounded-full blur-[120px]" />
      
      <Card className="glass-card border-none w-full max-w-md z-10 p-4 border border-white/5">
        <CardHeader className="text-center pb-8">
          <div className="size-16 rounded-2xl bg-primary mx-auto mb-6 flex items-center justify-center shadow-[0_0_30px_rgba(99,102,241,0.5)] border border-white/20">
            <Radio className="size-8 text-white animate-pulse" />
          </div>
          <CardTitle className="font-headline text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2">
            NovaPulse Gateway
          </CardTitle>
          <CardDescription className="text-muted-foreground/80 font-body">
            Enterprise-grade real-time notification infrastructure.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-8">
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-white/5 border border-white/5 flex items-start gap-4">
              <div className="p-2 rounded-md bg-primary/10">
                <ShieldCheck className="size-5 text-primary" />
              </div>
              <div>
                <h4 className="text-sm font-headline font-bold text-foreground">Secure Access</h4>
                <p className="text-xs text-muted-foreground">Ephemeral session encryption active.</p>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-white/5 border border-white/5 flex items-start gap-4">
              <div className="p-2 rounded-md bg-accent/10">
                <Zap className="size-5 text-accent" />
              </div>
              <div>
                <h4 className="text-sm font-headline font-bold text-foreground">Live Telemetry</h4>
                <p className="text-xs text-muted-foreground">Real-time cluster monitoring ready.</p>
              </div>
            </div>
          </div>

          <Button 
            className="w-full h-14 font-headline text-lg font-bold group relative overflow-hidden" 
            onClick={handleEnterPlatform}
            disabled={isLoggingIn}
          >
            {isLoggingIn ? (
              <Loader2 className="size-6 animate-spin" />
            ) : (
              <div className="flex items-center gap-3">
                <Lock className="size-5" />
                Initialize Session
                <ChevronRight className="size-5 group-hover:translate-x-1 transition-transform" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite] pointer-events-none" />
          </Button>
        </CardContent>

        <div className="px-6 py-6 border-t border-white/5 text-center">
          <p className="text-[10px] text-muted-foreground/60 uppercase tracking-[0.2em] font-code">
            Backbone Protocol v2.5.9-LTS
          </p>
        </div>
      </Card>

      <style jsx global>{`
        @keyframes shimmer {
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
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
