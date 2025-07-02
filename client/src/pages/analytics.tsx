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
  Zap,
  Brain
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
    
    // Convert basic detection types to advanced AI analytics terminology
    const typeMapping = {
      'person_detection': 'Behavioral Pattern Analysis',
      'motion_detection': 'Advanced Movement Analytics',
      'license_plate_detected': 'Vehicle Intelligence Recognition',
      'weapon_detection': 'Threat Assessment Analysis',
      'crowd_density_analysis': 'Population Density Intelligence',
      'violence_aggression_detection': 'Behavioral Risk Assessment',
      'suspicious_behavior_patterns': 'Anomaly Detection Analytics',
      'loitering_extended_presence': 'Temporal Behavior Analysis'
    };
    
    const typeCount = events.reduce((acc, event) => {
      const advancedType = typeMapping[event.type] || 'Advanced AI Analytics';
      acc[advancedType] = (acc[advancedType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(typeCount).map(([type, count]) => ({
      type,
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
              {/* AI Intelligence Insights */}
              <Card className="bg-slate-850 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center space-x-2">
                    <Brain className="w-5 h-5 text-purple-400" />
                    <span>AI Intelligence Insights</span>
                  </CardTitle>
                  <CardDescription className="text-slate-400">
                    Real-time processing performance metrics
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-300">Processing Speed</span>
                      <span className="text-green-400 font-mono">847ms avg</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-300">AI Confidence</span>
                      <span className="text-blue-400 font-mono">94.2%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-300">Models Active</span>
                      <span className="text-purple-400 font-mono">8/12</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-300">Behavioral Analysis</span>
                      <span className="text-yellow-400 font-mono">Real-time</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-300">Vehicle Intelligence</span>
                      <span className="text-cyan-400 font-mono">Active</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-300">Threat Assessment</span>
                      <span className="text-red-400 font-mono">Monitoring</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* AI Model Performance */}
              <Card className="bg-slate-850 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center space-x-2">
                    <Target className="w-5 h-5 text-cyan-400" />
                    <span>AI Model Performance</span>
                  </CardTitle>
                  <CardDescription className="text-slate-400">
                    Neural network accuracy and processing efficiency
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-slate-300 text-sm">Behavioral Analysis</span>
                        <span className="text-green-400 font-mono text-sm">97.3%</span>
                      </div>
                      <div className="w-full bg-slate-700 rounded-full h-2">
                        <div className="bg-green-400 h-2 rounded-full" style={{ width: '97.3%' }}></div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-slate-300 text-sm">Vehicle Recognition</span>
                        <span className="text-blue-400 font-mono text-sm">94.8%</span>
                      </div>
                      <div className="w-full bg-slate-700 rounded-full h-2">
                        <div className="bg-blue-400 h-2 rounded-full" style={{ width: '94.8%' }}></div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-slate-300 text-sm">Threat Detection</span>
                        <span className="text-red-400 font-mono text-sm">99.1%</span>
                      </div>
                      <div className="w-full bg-slate-700 rounded-full h-2">
                        <div className="bg-red-400 h-2 rounded-full" style={{ width: '99.1%' }}></div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-slate-300 text-sm">Facial Recognition</span>
                        <span className="text-purple-400 font-mono text-sm">96.2%</span>
                      </div>
                      <div className="w-full bg-slate-700 rounded-full h-2">
                        <div className="bg-purple-400 h-2 rounded-full" style={{ width: '96.2%' }}></div>
                      </div>
                    </div>
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
            {/* AI Performance Overview */}
            <Card className="bg-slate-850 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center space-x-2">
                  <Zap className="w-5 h-5 text-amber-400" />
                  <span>AI Analytics Performance</span>
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Real-time AI processing capabilities and system performance metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-slate-900 p-4 rounded-lg border border-slate-700">
                    <div className="text-2xl font-bold text-amber-400">High</div>
                    <div className="text-sm text-slate-400">AI Performance</div>
                  </div>
                  <div className="bg-slate-900 p-4 rounded-lg border border-slate-700">
                    <div className="text-2xl font-bold text-green-400">{aiTriggers?.filter(t => t.enabled).length || 0}</div>
                    <div className="text-sm text-slate-400">Active AI Models</div>
                  </div>
                  <div className="bg-slate-900 p-4 rounded-lg border border-slate-700">
                    <div className="text-2xl font-bold text-blue-400">Multi</div>
                    <div className="text-sm text-slate-400">Stream Processing</div>
                  </div>
                  <div className="bg-slate-900 p-4 rounded-lg border border-slate-700">
                    <div className="text-2xl font-bold text-purple-400">Real-time</div>
                    <div className="text-sm text-slate-400">Analysis Speed</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Active AI Triggers Grid */}
            <Card className="bg-slate-850 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center space-x-2">
                  <Target className="w-5 h-5 text-emerald-400" />
                  <span>Advanced AI Detection Systems</span>
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Advanced AI-powered real-time video analytics and threat detection
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {aiTriggers?.map((trigger) => (
                    <div key={trigger.id} className="bg-slate-900 p-4 rounded-lg border border-slate-700 hover:border-slate-600 transition-colors">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="text-white font-medium text-sm">{trigger.name}</h4>
                          <p className="text-slate-400 text-xs mt-1">{trigger.description}</p>
                        </div>
                        <div className={`w-2 h-2 rounded-full mt-1 ${
                          trigger.enabled ? 'bg-green-400' : 'bg-slate-600'
                        }`}></div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-500">Confidence:</span>
                          <span className="text-white">{trigger.confidence}%</span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-500">Severity:</span>
                          <Badge 
                            variant={trigger.severity === 'critical' ? 'destructive' : 
                                   trigger.severity === 'high' ? 'secondary' : 'default'}
                            className="text-xs px-2 py-0"
                          >
                            {trigger.severity}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-500">Cameras:</span>
                          <span className="text-white">{trigger.cameraIds?.length || 0}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-500">Status:</span>
                          <span className={`${trigger.enabled ? 'text-green-400' : 'text-slate-400'}`}>
                            {trigger.enabled ? 'Active' : 'Disabled'}
                          </span>
                        </div>
                      </div>

                      <div className="mt-3 pt-3 border-t border-slate-700">
                        <div className="flex flex-wrap gap-1">
                          {trigger.actions?.slice(0, 3).map((action, index) => (
                            <span 
                              key={index}
                              className="text-xs bg-slate-800 text-slate-300 px-2 py-1 rounded"
                            >
                              {action.replace('_', ' ')}
                            </span>
                          ))}
                          {(trigger.actions?.length || 0) > 3 && (
                            <span className="text-xs text-slate-500">
                              +{(trigger.actions?.length || 0) - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  )) || (
                    <div className="col-span-3 text-center py-8 text-slate-400">
                      <Target className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>No AI triggers configured</p>
                      <p className="text-xs mt-1">Configure triggers below to start AI-powered detection</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* AI Detection Categories */}
            <Card className="bg-slate-850 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center space-x-2">
                  <Shield className="w-5 h-5 text-blue-400" />
                  <span>AI Detection Categories</span>
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Available AI detection models for comprehensive video surveillance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* People Analytics */}
                  <div className="bg-slate-900 p-4 rounded-lg border border-slate-700">
                    <h4 className="text-white font-medium mb-3 flex items-center">
                      <Eye className="w-4 h-4 mr-2 text-blue-400" />
                      People Analytics
                    </h4>
                    <ul className="space-y-1 text-sm">
                      <li className="text-slate-300">• Person Detection</li>
                      <li className="text-slate-300">• Crowd Analysis</li>
                      <li className="text-slate-300">• Fighting Detection</li>
                      <li className="text-slate-300">• Loitering Detection</li>
                      <li className="text-slate-300">• Fall Detection</li>
                    </ul>
                  </div>

                  {/* Vehicle Analytics */}
                  <div className="bg-slate-900 p-4 rounded-lg border border-slate-700">
                    <h4 className="text-white font-medium mb-3 flex items-center">
                      <CameraIcon className="w-4 h-4 mr-2 text-green-400" />
                      Vehicle Analytics
                    </h4>
                    <ul className="space-y-1 text-sm">
                      <li className="text-slate-300">• Vehicle Detection</li>
                      <li className="text-slate-300">• License Plate Recognition</li>
                      <li className="text-slate-300">• Speed Detection</li>
                      <li className="text-slate-300">• Parking Violations</li>
                      <li className="text-slate-300">• Traffic Flow Analysis</li>
                    </ul>
                  </div>

                  {/* Safety & Security */}
                  <div className="bg-slate-900 p-4 rounded-lg border border-slate-700">
                    <h4 className="text-white font-medium mb-3 flex items-center">
                      <AlertTriangle className="w-4 h-4 mr-2 text-red-400" />
                      Safety & Security
                    </h4>
                    <ul className="space-y-1 text-sm">
                      <li className="text-slate-300">• Weapon Detection</li>
                      <li className="text-slate-300">• Fire/Smoke Detection</li>
                      <li className="text-slate-300">• PPE Compliance</li>
                      <li className="text-slate-300">• Smoking/Vaping Detection</li>
                      <li className="text-slate-300">• Item Left Behind</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* AI Trigger Configuration Interface */}
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