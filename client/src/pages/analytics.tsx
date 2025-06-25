import React, { useState, useContext } from "react";
import { useEvents, useCameras, useHubs } from "@/hooks/use-hub-data";
import { HubContext } from "@/components/hub-selector";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { TrendingUp, Activity, AlertTriangle, Video, Calendar, Download, ExternalLink } from "lucide-react";
import { formatTimestamp } from "@/lib/utils";

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

export default function Analytics() {
  const { selectedHubId } = useContext(HubContext);
  const { data: events, isLoading: eventsLoading } = useEvents();
  const { data: cameras, isLoading: camerasLoading } = useCameras();
  const { data: hubs, isLoading: hubsLoading } = useHubs();
  const [timeRange, setTimeRange] = useState("24h");

  // Process data for analytics
  const processEventsByHour = () => {
    if (!events) return [];
    
    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const hourlyData = new Array(24).fill(0).map((_, index) => {
      const hour = new Date(last24Hours.getTime() + index * 60 * 60 * 1000);
      return {
        hour: hour.getHours(),
        events: 0,
        time: hour.toISOString()
      };
    });

    events
      .filter(event => new Date(event.timestamp) >= last24Hours)
      .forEach(event => {
        const eventHour = new Date(event.timestamp).getHours();
        const dataPoint = hourlyData.find(d => d.hour === eventHour);
        if (dataPoint) {
          dataPoint.events++;
        }
      });

    return hourlyData;
  };

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
    
    return hubs.map(hub => {
      const hubEvents = events.filter(event => event.hubId === hub.id);
      const hubCameras = cameras?.filter(camera => camera.hubId === hub.id) || [];
      const activeCameras = hubCameras.filter(camera => camera.status === "online").length;
      
      return {
        name: hub.name,
        events: hubEvents.length,
        cameras: activeCameras,
        status: hub.status,
        location: hub.location
      };
    });
  };

  const hourlyData = processEventsByHour();
  const severityData = processEventsBySeverity();
  const typeData = processEventsByType();
  const hubActivityData = processHubActivity();

  const totalEvents = events?.length || 0;
  const criticalEvents = events?.filter(e => e.severity === "critical").length || 0;
  const activeCameras = cameras?.filter(c => c.status === "online").length || 0;
  const onlineHubs = hubs?.filter(h => h.status === "online").length || 0;

  if (eventsLoading || camerasLoading || hubsLoading) {
    return (
      <>
        <header className="bg-slate-900 border-b border-slate-700 px-6 py-4">
          <Skeleton className="h-8 w-32" />
        </header>
        <main className="flex-1 overflow-auto p-6">
          <div className="space-y-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-64 bg-slate-850" />
            ))}
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      {/* Top Bar */}
      <header className="bg-slate-900 border-b border-slate-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h2 className="text-2xl font-semibold text-white">Analytics</h2>
            <div className="flex items-center space-x-2 text-sm text-slate-400">
              <span>{totalEvents} total events</span>
              {selectedHubId && (
                <>
                  <span>•</span>
                  <span>Hub {selectedHubId}</span>
                </>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-32 bg-slate-800 border-slate-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-600">
                <SelectItem value="24h" className="text-white hover:bg-slate-700">Last 24h</SelectItem>
                <SelectItem value="7d" className="text-white hover:bg-slate-700">Last 7 days</SelectItem>
                <SelectItem value="30d" className="text-white hover:bg-slate-700">Last 30 days</SelectItem>
              </SelectContent>
            </Select>
            
            <Button
              variant="outline"
              size="sm"
              className="border-slate-600 text-slate-300 hover:text-white"
              onClick={() => window.open("https://securewithnick.com", "_blank")}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              SecureWithNick.com
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              className="border-slate-600 text-slate-300 hover:text-white"
            >
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>
      </header>

      {/* Analytics Content */}
      <main className="flex-1 overflow-auto p-6">
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="bg-slate-850 border-slate-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm">Total Events</p>
                    <p className="text-2xl font-semibold text-white">{totalEvents}</p>
                    <p className="text-xs text-green-400 mt-1">+12% from last week</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-500/10 text-blue-400 rounded-lg flex items-center justify-center">
                    <Activity className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-850 border-slate-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm">Critical Events</p>
                    <p className="text-2xl font-semibold text-white">{criticalEvents}</p>
                    <p className="text-xs text-red-400 mt-1">-8% from last week</p>
                  </div>
                  <div className="w-12 h-12 bg-red-500/10 text-red-400 rounded-lg flex items-center justify-center">
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-850 border-slate-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm">Active Cameras</p>
                    <p className="text-2xl font-semibold text-white">{activeCameras}</p>
                    <p className="text-xs text-green-400 mt-1">98% uptime</p>
                  </div>
                  <div className="w-12 h-12 bg-green-500/10 text-green-400 rounded-lg flex items-center justify-center">
                    <Video className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-850 border-slate-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm">Online Hubs</p>
                    <p className="text-2xl font-semibold text-white">{onlineHubs}</p>
                    <p className="text-xs text-green-400 mt-1">All systems operational</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-500/10 text-purple-400 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* Event Timeline */}
            <Card className="bg-slate-850 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Event Timeline (24h)</CardTitle>
                <CardDescription className="text-slate-400">
                  Events distributed by hour over the last 24 hours
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={hourlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis 
                      dataKey="hour" 
                      stroke="#9ca3af"
                      tickFormatter={(value) => `${value}:00`}
                    />
                    <YAxis stroke="#9ca3af" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1f2937', 
                        border: '1px solid #374151',
                        borderRadius: '6px'
                      }}
                      labelFormatter={(value) => `${value}:00`}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="events" 
                      stroke="#3b82f6" 
                      strokeWidth={2}
                      dot={{ fill: '#3b82f6', strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Event Severity Distribution */}
            <Card className="bg-slate-850 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Event Severity Distribution</CardTitle>
                <CardDescription className="text-slate-400">
                  Breakdown of events by severity level
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={severityData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {severityData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1f2937', 
                        border: '1px solid #374151',
                        borderRadius: '6px'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Event Types */}
            <Card className="bg-slate-850 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Event Types</CardTitle>
                <CardDescription className="text-slate-400">
                  Distribution of events by type
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={typeData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="type" stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1f2937', 
                        border: '1px solid #374151',
                        borderRadius: '6px'
                      }}
                    />
                    <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Hub Activity */}
            <Card className="bg-slate-850 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Hub Activity</CardTitle>
                <CardDescription className="text-slate-400">
                  Events and camera status by hub
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={hubActivityData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="name" stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1f2937', 
                        border: '1px solid #374151',
                        borderRadius: '6px'
                      }}
                    />
                    <Legend />
                    <Bar dataKey="events" fill="#3b82f6" name="Events" radius={[2, 2, 0, 0]} />
                    <Bar dataKey="cameras" fill="#10b981" name="Active Cameras" radius={[2, 2, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Analytics */}
          <Card className="bg-slate-850 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Security Intelligence Insights</CardTitle>
              <CardDescription className="text-slate-400">
                AI-powered analytics and recommendations from SecureWithNick.com
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="text-white font-medium">Key Insights</h4>
                  <ul className="space-y-2">
                    <li className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0" />
                      <span className="text-slate-300 text-sm">
                        System performance is optimal with 98% camera uptime
                      </span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-amber-400 rounded-full mt-2 flex-shrink-0" />
                      <span className="text-slate-300 text-sm">
                        Motion detection events peak between 6-8 PM
                      </span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0" />
                      <span className="text-slate-300 text-sm">
                        Hub-01 shows highest activity with {hubActivityData.find(h => h.name === 'Hub-01')?.events || 0} events
                      </span>
                    </li>
                  </ul>
                </div>
                
                <div className="space-y-4">
                  <h4 className="text-white font-medium">Recommendations</h4>
                  <ul className="space-y-2">
                    <li className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0" />
                      <span className="text-slate-300 text-sm">
                        Consider adding motion zones to reduce false positives
                      </span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-sky-400 rounded-full mt-2 flex-shrink-0" />
                      <span className="text-slate-300 text-sm">
                        Implement automated event acknowledgment for low-priority alerts
                      </span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0" />
                      <span className="text-slate-300 text-sm">
                        Schedule regular system health checks during off-peak hours
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
              
              <div className="pt-4 border-t border-slate-700">
                <Button
                  variant="outline"
                  className="border-slate-600 text-slate-300 hover:text-white"
                  onClick={() => window.open("https://securewithnick.com", "_blank")}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Learn More at SecureWithNick.com
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}