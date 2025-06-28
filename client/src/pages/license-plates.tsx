import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Car, Shield, AlertTriangle, Download, Filter, Clock, Plus } from "lucide-react";
import { formatTimestamp, getSeverityColor } from "@/lib/utils";
import { useHubs, useEvents } from "@/hooks/use-hub-data";
import { HubContext } from "@/components/hub-selector";
import { useContext } from "react";

export default function LicensePlates() {
  const { selectedHubId } = useContext(HubContext);
  const [searchTerm, setSearchTerm] = useState("");
  const [severityFilter, setSeverityFilter] = useState<string>("all");
  const [timeFilter, setTimeFilter] = useState<string>("all");

  // Get all events and filter for license plate events
  const { data: allEvents = [] } = useEvents(selectedHubId || undefined);
  
  const licensePlateEvents = allEvents.filter(event => 
    event.type === "license_plate" && event.licensePlate
  );

  // Filter events based on search and filters
  const filteredEvents = licensePlateEvents.filter(event => {
    const matchesSearch = !searchTerm || 
      event.licensePlate?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSeverity = severityFilter === "all" || event.severity === severityFilter;
    
    let matchesTime = true;
    if (timeFilter !== "all") {
      const eventTime = new Date(event.timestamp);
      const now = new Date();
      const hoursAgo = {
        "1h": 1,
        "6h": 6,
        "24h": 24,
        "7d": 24 * 7
      }[timeFilter] || 0;
      
      matchesTime = (now.getTime() - eventTime.getTime()) <= (hoursAgo * 60 * 60 * 1000);
    }
    
    return matchesSearch && matchesSeverity && matchesTime;
  });

  // Get summary stats
  const totalDetections = licensePlateEvents.length;
  const recentDetections = licensePlateEvents.filter(e => 
    new Date(e.timestamp) > new Date(Date.now() - 24 * 60 * 60 * 1000)
  ).length;

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "high":
      case "critical":
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <Shield className="w-4 h-4" />;
    }
  };

  const exportData = () => {
    const csvData = filteredEvents.map(event => ({
      timestamp: formatTimestamp(event.timestamp),
      licensePlate: event.licensePlate,
      severity: event.severity,
      confidence: event.licensePlateConfidence,
      camera: `Camera ${event.cameraId}`,
      description: event.description
    }));

    const csv = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `license-plates-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">License Plate Capture</h1>
          <p className="text-muted-foreground">
            Monitor and analyze license plate detections across your security network
          </p>
        </div>
        <Button onClick={exportData} variant="outline" className="flex items-center gap-2">
          <Download className="w-4 h-4" />
          Export Data
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Captures</CardTitle>
            <Car className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{licensePlateEvents.length}</div>
            <p className="text-xs text-muted-foreground">
              All time detections
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent (24h)</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{recentDetections}</div>
            <p className="text-xs text-muted-foreground">
              Last 24 hours
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Watch List</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              Active alerts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Captures</CardTitle>
            <Car className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {licensePlateEvents.filter(e => {
                const today = new Date();
                const eventDate = new Date(e.timestamp);
                return eventDate.toDateString() === today.toDateString();
              }).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Last 24 hours
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content with Tabs */}
      <Tabs defaultValue="detections" className="space-y-6">
        <TabsList>
          <TabsTrigger value="detections">License Plate Detections</TabsTrigger>
          <TabsTrigger value="watchlist">Watch List</TabsTrigger>
        </TabsList>

        <TabsContent value="detections" className="space-y-6">
          {/* Filters */}
          <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <Label htmlFor="search">Search License Plates</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search by plate number or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="min-w-[150px]">
              <Label>Severity</Label>
              <Select value={severityFilter} onValueChange={setSeverityFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Severities</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="min-w-[150px]">
              <Label>Time Range</Label>
              <Select value={timeFilter} onValueChange={setTimeFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="1h">Last Hour</SelectItem>
                  <SelectItem value="6h">Last 6 Hours</SelectItem>
                  <SelectItem value="24h">Last 24 Hours</SelectItem>
                  <SelectItem value="7d">Last 7 Days</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <Card>
        <CardHeader>
          <CardTitle>License Plate Detections</CardTitle>
          <CardDescription>
            {filteredEvents.length} result{filteredEvents.length !== 1 ? 's' : ''} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredEvents.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Car className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No license plate captures found matching your criteria.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredEvents.map((event) => (
                <div key={event.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    {event.licensePlateThumbnail && (
                      <img 
                        src={event.licensePlateThumbnail} 
                        alt="License plate thumbnail"
                        className="w-16 h-10 object-cover rounded border"
                      />
                    )}
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-lg font-bold">
                          {event.licensePlate}
                        </span>
                        <Badge variant={getSeverityColor(event.severity) as any}>
                          {getSeverityIcon(event.severity)}
                          {event.severity}
                        </Badge>
                        {event.licensePlateConfidence && (
                          <Badge variant="outline">
                            {Math.round(event.licensePlateConfidence * 100)}% confidence
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">
                        {event.description}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>Camera {event.cameraId}</span>
                        <span>{formatTimestamp(event.timestamp)}</span>
                        {event.metadata && typeof event.metadata === 'object' && 'vehicle_type' in event.metadata && (
                          (() => {
                            const meta = event.metadata as Record<string, any>;
                            return (
                              <span>{String(meta.vehicle_type)} • {String(meta.color)}</span>
                            );
                          })()
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {(() => {
                      if (event.metadata && typeof event.metadata === 'object' && 'alert_reason' in event.metadata) {
                        const meta = event.metadata as Record<string, any>;
                        return (
                          <Badge variant="destructive">
                            {String(meta.alert_reason)}
                          </Badge>
                        );
                      }
                      return null;
                    })()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
        </TabsContent>

        <TabsContent value="watchlist" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Vehicle Watch List
                  </CardTitle>
                  <CardDescription>
                    Manage stolen vehicles and vehicles of interest
                  </CardDescription>
                </div>
                <Button className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Add to Watch List
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Shield className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
                <h3 className="text-lg font-medium mb-2">No Watch List Entries</h3>
                <p>Add vehicles to your watch list to automatically flag license plate detections.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}