import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Activity, 
  AlertTriangle, 
  Camera as CameraIcon, 
  TrendingUp, 
  Shield, 
  Eye,
  BarChart3,
  Target,
  Zap
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { useToast } from "@/hooks/use-toast";
import { useAITriggers, useCreateAITrigger, useUpdateAITrigger, useDeleteAITrigger } from "@/hooks/use-ai-triggers";
import { useHubs } from "@/hooks/use-hub-data";
import AITriggerConfig from "@/components/ai-trigger-config";
import CustomAnalyticsBuilder from "@/components/custom-analytics-builder";
import type { Hub, Camera, Event, AITrigger } from "@shared/schema";

export default function Analytics() {
  const { toast } = useToast();
  
  // Data queries
  const { data: hubs } = useQuery<Hub[]>({ queryKey: ["/api/hubs"] });
  const { data: cameras } = useQuery<Camera[]>({ queryKey: ["/api/cameras"] });
  const { data: events } = useQuery<Event[]>({ queryKey: ["/api/events"] });
  const { data: aiTriggers } = useAITriggers();
  
  // Mutations
  const createAITrigger = useCreateAITrigger();
  const updateAITrigger = useUpdateAITrigger();
  const deleteAITrigger = useDeleteAITrigger();

  const processEventsBySeverity = () => {
    if (!events) return [];
    
    const severityCount = events.reduce((acc, event) => {
      acc[event.severity] = (acc[event.severity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(severityCount).map(([severity, count]) => ({
      name: severity.charAt(0).toUpperCase() + severity.slice(1),
      value: count,
      severity
    }));
  };

  const processEventsByType = () => {
    if (!events) return [];
    
    const typeCount = events.reduce((acc, event) => {
      acc[event.type] = (acc[event.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(typeCount).map(([type, count]) => ({
      type: type.charAt(0).toUpperCase() + type.slice(1),
      count
    }));
  };

  const processHubActivity = () => {
    if (!events || !hubs) return [];
    
    const hubEventCount = events.reduce((acc, event) => {
      acc[event.hubId] = (acc[event.hubId] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);

    return hubs.map(hub => ({
      name: hub.name,
      events: hubEventCount[hub.id] || 0,
      status: hub.status
    }));
  };

  const severityData = processEventsBySeverity();
  const typeData = processEventsByType();
  const hubActivityData = processHubActivity();

  const totalEvents = events?.length || 0;
  const criticalEvents = events?.filter(e => e.severity === "critical").length || 0;
  const activeCameras = cameras?.filter(c => c.status === "online").length || 0;
  const onlineHubs = hubs?.filter(h => h.status === "online").length || 0;

  // Custom analytics state (in-memory for demo)
  const [customAnalytics, setCustomAnalytics] = useState([
    {
      id: '1',
      name: 'Parking Lot Monitoring',
      description: 'Monitor vehicle activity in parking areas',
      category: 'Security',
      prompt: 'Monitor parking lots for unauthorized vehicles, suspicious activity, or security breaches',
      severity: 'medium' as const,
      enabled: true,
      hubIds: [1],
      cameraIds: [3, 4],
      confidence: 75,
      timeframe: '24h',
      actions: ['notification', 'email'],
      conditions: [
        { field: 'time', operator: 'between', value: '22:00-06:00' },
        { field: 'zone', operator: 'equals', value: 'parking_lot' }
      ]
    }
  ]);

  // Iris input state
  const [irisInput, setIrisInput] = useState('');

  // AI Trigger handlers
  const handleTriggerCreate = async (trigger: Omit<AITrigger, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      await createAITrigger.mutateAsync(trigger);
      toast({
        title: "AI Trigger Created",
        description: `${trigger.name} has been created successfully`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create AI trigger",
        variant: "destructive",
      });
    }
  };

  const handleTriggerUpdate = async (id: string, updates: Partial<AITrigger>) => {
    try {
      await updateAITrigger.mutateAsync({ id: parseInt(id), updates });
      toast({
        title: "AI Trigger Updated",
        description: "Trigger settings have been updated",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update AI trigger",
        variant: "destructive",
      });
    }
  };

  const handleTriggerDelete = async (id: string) => {
    try {
      await deleteAITrigger.mutateAsync(parseInt(id));
      toast({
        title: "AI Trigger Deleted",
        description: "Trigger has been removed",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete AI trigger",
        variant: "destructive",
      });
    }
  };

  // Custom Analytics handlers
  const handleAnalyticCreate = (analytic: any) => {
    const newAnalytic = {
      ...analytic,
      id: Date.now().toString()
    };
    setCustomAnalytics(prev => [...prev, newAnalytic]);
    toast({
      title: "Custom Analytic Created",
      description: `${analytic.name} has been created successfully`,
    });
  };

  const handleAnalyticUpdate = (id: string, updates: any) => {
    setCustomAnalytics(prev => 
      prev.map(analytic => 
        analytic.id === id ? { ...analytic, ...updates } : analytic
      )
    );
    toast({
      title: "Custom Analytic Updated",
      description: "Analytics settings have been updated",
    });
  };

  const handleAnalyticDelete = (id: string) => {
    setCustomAnalytics(prev => prev.filter(analytic => analytic.id !== id));
    toast({
      title: "Custom Analytic Deleted",
      description: "Analytic has been removed",
    });
  };

  // Handle Iris-style analytic creation
  const handleCreateFromText = () => {
    if (!irisInput.trim()) {
      toast({
        title: "Description Required",
        description: "Please describe the analytic you want to create",
        variant: "destructive",
      });
      return;
    }

    // Generate a simple name from the input
    const name = irisInput.split('.')[0].substring(0, 50) + (irisInput.length > 50 ? '...' : '');
    
    const newAnalytic = {
      id: Date.now().toString(),
      name: name,
      description: `Custom analytic: ${name}`,
      category: 'Custom',
      prompt: irisInput,
      severity: 'medium' as const,
      enabled: true,
      hubIds: [1], // Default to first hub
      cameraIds: [1], // Default to first camera
      confidence: 80,
      timeframe: '24h',
      actions: ['notification'],
      conditions: []
    };

    setCustomAnalytics(prev => [...prev, newAnalytic]);
    setIrisInput('');
    
    toast({
      title: "Custom Analytic Created",
      description: `"${name}" has been created successfully`,
    });
  };

  const SEVERITY_COLORS = {
    critical: "#ef4444",
    high: "#f97316", 
    medium: "#eab308",
    low: "#10b981"
  };

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Analytics</h1>
          <p className="text-slate-400 mt-1">Advanced AI-powered security analytics and insights</p>
        </div>
      </div>

      <main className="space-y-6">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-slate-900 border-slate-700">
            <TabsTrigger value="overview" className="data-[state=active]:bg-slate-800 text-white">
              Overview
            </TabsTrigger>
            <TabsTrigger value="ai-triggers" className="data-[state=active]:bg-slate-800 text-white">
              AI Triggers
            </TabsTrigger>
            <TabsTrigger value="custom-analytics" className="data-[state=active]:bg-slate-800 text-white">
              Custom Analytics
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-slate-850 border-slate-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-sm">Total Events</p>
                      <p className="text-2xl font-bold text-white">{totalEvents}</p>
                    </div>
                    <Activity className="w-8 h-8 text-blue-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-850 border-slate-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-sm">Critical Events</p>
                      <p className="text-2xl font-bold text-red-400">{criticalEvents}</p>
                    </div>
                    <AlertTriangle className="w-8 h-8 text-red-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-850 border-slate-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-sm">Active Cameras</p>
                      <p className="text-2xl font-bold text-green-400">{activeCameras}</p>
                    </div>
                    <CameraIcon className="w-8 h-8 text-green-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-850 border-slate-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-sm">Online Hubs</p>
                      <p className="text-2xl font-bold text-blue-400">{onlineHubs}</p>
                    </div>
                    <Shield className="w-8 h-8 text-blue-400" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Events by Severity */}
              <Card className="bg-slate-850 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center space-x-2">
                    <BarChart3 className="w-5 h-5" />
                    <span>Events by Severity</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={severityData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          label={({ name, value }) => `${name}: ${value}`}
                        >
                          {severityData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={SEVERITY_COLORS[entry.severity as keyof typeof SEVERITY_COLORS]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#1e293b', 
                            border: '1px solid #475569',
                            borderRadius: '8px',
                            color: '#fff'
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Events by Type */}
              <Card className="bg-slate-850 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center space-x-2">
                    <TrendingUp className="w-5 h-5" />
                    <span>Events by Type</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={typeData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis 
                          dataKey="type" 
                          stroke="#9ca3af"
                          fontSize={12}
                        />
                        <YAxis stroke="#9ca3af" fontSize={12} />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#1e293b', 
                            border: '1px solid #475569',
                            borderRadius: '8px',
                            color: '#fff'
                          }}
                        />
                        <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Hub Activity */}
            <Card className="bg-slate-850 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center space-x-2">
                  <Eye className="w-5 h-5" />
                  <span>Hub Activity</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={hubActivityData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis 
                        dataKey="name" 
                        stroke="#9ca3af"
                        fontSize={12}
                      />
                      <YAxis stroke="#9ca3af" fontSize={12} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1e293b', 
                          border: '1px solid #475569',
                          borderRadius: '8px',
                          color: '#fff'
                        }}
                      />
                      <Bar dataKey="events" fill="#10b981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* AI Triggers Tab */}
          <TabsContent value="ai-triggers" className="space-y-6">
            {/* Header with current active triggers */}
            <Card className="bg-slate-850 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center space-x-2">
                  <Target className="w-5 h-5 text-emerald-400" />
                  <span>Active AI Triggers</span>
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Current AI-powered detection systems running across your network
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="bg-slate-900 p-4 rounded-lg border border-slate-700">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-white font-medium">Weapon Detection</h4>
                      <div className="w-2 h-2 bg-green-400 rounded-full mt-1"></div>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">Confidence: 95%</span>
                      <span className="text-green-400">Active</span>
                    </div>
                  </div>
                  <div className="bg-slate-900 p-4 rounded-lg border border-slate-700">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-white font-medium">Person Detection</h4>
                      <div className="w-2 h-2 bg-green-400 rounded-full mt-1"></div>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">Confidence: 92%</span>
                      <span className="text-green-400">Active</span>
                    </div>
                  </div>
                  <div className="bg-slate-900 p-4 rounded-lg border border-slate-700">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-white font-medium">Intrusion Detection</h4>
                      <div className="w-2 h-2 bg-amber-400 rounded-full mt-1"></div>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">Confidence: 84%</span>
                      <span className="text-amber-400">Testing</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <AITriggerConfig
              onTriggerCreate={handleTriggerCreate}
              onTriggerUpdate={handleTriggerUpdate}
              onTriggerDelete={handleTriggerDelete}
              triggers={aiTriggers || []}
              hubs={hubs || []}
              cameras={cameras || []}
            />
          </TabsContent>

          {/* Custom Analytics Tab - Iris Style */}
          <TabsContent value="custom-analytics" className="space-y-6">
            <Card className="bg-slate-850 border-slate-700">
              <CardHeader className="text-center pb-8">
                <div className="mx-auto w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mb-4">
                  <Zap className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-2xl text-white mb-2">AI Analytics Builder</CardTitle>
                <CardDescription className="text-slate-400 text-lg">
                  What analytic would you like to create?
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="max-w-2xl mx-auto">
                  <div className="relative">
                    <textarea
                      value={irisInput}
                      onChange={(e) => setIrisInput(e.target.value)}
                      className="w-full p-4 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-400 resize-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                      rows={4}
                      placeholder="Describe the analytic you want to create in natural language...

Examples:
• Monitor for people without hard hats in construction zones
• Detect when delivery trucks stay longer than 10 minutes
• Alert when more than 5 people gather in the lobby after hours
• Track how long customers wait in checkout lines"
                    />
                  </div>
                  <div className="flex justify-center mt-6">
                    <Button 
                      onClick={handleCreateFromText}
                      disabled={!irisInput.trim()}
                      className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-8 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Create Analytic
                    </Button>
                  </div>
                </div>

                {/* Existing Custom Analytics */}
                {customAnalytics.length > 0 && (
                  <div className="mt-8 border-t border-slate-700 pt-6">
                    <h3 className="text-white font-medium mb-4">Your Custom Analytics</h3>
                    <div className="grid gap-4">
                      {customAnalytics.map((analytic) => (
                        <div key={analytic.id} className="bg-slate-900 p-4 rounded-lg border border-slate-700">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="text-white font-medium">{analytic.name}</h4>
                              <p className="text-slate-400 text-sm mt-1">{analytic.description}</p>
                              <p className="text-slate-500 text-xs mt-2">{analytic.prompt}</p>
                              <div className="flex items-center space-x-4 mt-2">
                                <Badge variant={analytic.enabled ? "default" : "secondary"}>
                                  {analytic.enabled ? "Active" : "Inactive"}
                                </Badge>
                                <span className="text-xs text-slate-500">
                                  Confidence: {analytic.confidence}%
                                </span>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleAnalyticDelete(analytic.id)}
                              className="text-slate-400 hover:text-red-400"
                            >
                              Remove
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </>
  );
}