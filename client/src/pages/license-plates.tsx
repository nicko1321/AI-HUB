import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// Removed DataTable import as it's not needed for this layout
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, Search, Car, Clock, Gauge, MapPin, Camera, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { type VehicleAnalytics, type LicensePlateEvent } from "@shared/schema";

interface VehicleAnalyticsDashboard {
  totalDetections: number;
  uniqueVehicles: number;
  speedViolations: number;
  watchListMatches: number;
  averageProcessingTime: number;
  hourlyTrafficFlow: Array<{
    hour: number;
    vehicleCount: number;
    averageSpeed: number;
  }>;
  topVehicleMakes: Array<{
    make: string;
    count: number;
    percentage: number;
  }>;
  colorDistribution: Array<{
    color: string;
    count: number;
    percentage: number;
  }>;
  speedAnalytics: {
    averageSpeed: number;
    maxSpeed: number;
    speedLimitViolations: number;
    speedDistribution: Array<{
      range: string;
      count: number;
    }>;
  };
}

export default function LicensePlatesPage() {
  const [searchPlate, setSearchPlate] = useState("");
  const [selectedHub, setSelectedHub] = useState<string>("all");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch hubs for filtering
  const { data: hubs = [] } = useQuery({
    queryKey: ["/api/hubs"],
  });

  // Fetch recent license plate detections
  const { data: recentDetections = [], isLoading: detectionsLoading } = useQuery({
    queryKey: ["/api/license-plates/recent"],
  });

  // Fetch vehicle analytics dashboard
  const { data: dashboard, isLoading: dashboardLoading } = useQuery<VehicleAnalyticsDashboard>({
    queryKey: ["/api/vehicle-analytics/dashboard", selectedHub === "all" ? undefined : selectedHub],
    queryFn: async () => {
      const url = selectedHub === "all" 
        ? "/api/vehicle-analytics/dashboard"
        : `/api/vehicle-analytics/dashboard?hubId=${selectedHub}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch dashboard");
      return response.json();
    }
  });

  // Search license plates
  const searchMutation = useMutation({
    mutationFn: async (plate: string) => {
      const response = await fetch(`/api/license-plates/search?plate=${encodeURIComponent(plate)}`);
      if (!response.ok) throw new Error("Search failed");
      return response.json();
    },
    onSuccess: (results) => {
      queryClient.setQueryData(["/api/license-plates/search", searchPlate], results);
    },
    onError: () => {
      toast({
        title: "Search Failed",
        description: "Unable to search for license plate detections",
        variant: "destructive",
      });
    },
  });

  const handleSearch = () => {
    if (searchPlate.trim()) {
      searchMutation.mutate(searchPlate.trim());
    }
  };

  const formatDateTime = (date: string | Date) => {
    return new Date(date).toLocaleString();
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return "bg-green-500";
    if (confidence >= 75) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getSpeedColor = (speed: number | null) => {
    if (!speed) return "text-gray-500";
    if (speed > 45) return "text-red-500";
    if (speed > 35) return "text-yellow-500";
    return "text-green-500";
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">License Plate Analytics</h1>
          <p className="text-muted-foreground">
            Comprehensive vehicle detection and license plate recognition system
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={selectedHub} onValueChange={setSelectedHub}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select Hub" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Hubs</SelectItem>
              {hubs.map((hub: any) => (
                <SelectItem key={hub.id} value={hub.id.toString()}>
                  {hub.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Analytics Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Detections</CardTitle>
            <Car className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboardLoading ? "..." : dashboard?.totalDetections || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              License plates detected
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unique Vehicles</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboardLoading ? "..." : dashboard?.uniqueVehicles || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Different vehicles identified
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Speed Violations</CardTitle>
            <Gauge className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">
              {dashboardLoading ? "..." : dashboard?.speedViolations || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Speed limit exceeded
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Watch List Matches</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">
              {dashboardLoading ? "..." : dashboard?.watchListMatches || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Security alerts triggered
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="recent" className="space-y-4">
        <TabsList>
          <TabsTrigger value="recent">Recent Detections</TabsTrigger>
          <TabsTrigger value="search">Search & Analytics</TabsTrigger>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
        </TabsList>

        <TabsContent value="recent" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent License Plate Detections</CardTitle>
              <CardDescription>
                Latest vehicle detections with comprehensive analytics
              </CardDescription>
            </CardHeader>
            <CardContent>
              {detectionsLoading ? (
                <div className="text-center py-8">Loading detections...</div>
              ) : recentDetections.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No license plate detections found
                </div>
              ) : (
                <div className="space-y-4">
                  {recentDetections.map((detection: VehicleAnalytics) => (
                    <div key={detection.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Badge 
                            variant="outline" 
                            className="text-lg font-mono font-bold"
                          >
                            {detection.licensePlate}
                          </Badge>
                          <div 
                            className={`w-3 h-3 rounded-full ${getConfidenceColor(detection.licensePlateConfidence)}`}
                            title={`Confidence: ${detection.licensePlateConfidence}%`}
                          />
                          {detection.isWatchListed && (
                            <Badge variant="destructive">
                              <AlertTriangle className="w-3 h-3 mr-1" />
                              Watch List
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {formatDateTime(detection.timestamp)}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-muted-foreground" />
                          <span>{detection.location}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Camera className="w-4 h-4 text-muted-foreground" />
                          <span>Camera {detection.cameraId}</span>
                        </div>
                        {detection.speed && (
                          <div className="flex items-center gap-2">
                            <Gauge className="w-4 h-4 text-muted-foreground" />
                            <span className={getSpeedColor(detection.speed)}>
                              {detection.speed} mph
                            </span>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-muted-foreground" />
                          <span>{detection.processingTime}ms</span>
                        </div>
                      </div>

                      {(detection.make || detection.model || detection.color || detection.year) && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          {detection.make && (
                            <div>
                              <span className="font-medium">Make:</span> {detection.make}
                            </div>
                          )}
                          {detection.model && (
                            <div>
                              <span className="font-medium">Model:</span> {detection.model}
                            </div>
                          )}
                          {detection.color && (
                            <div>
                              <span className="font-medium">Color:</span> {detection.color}
                            </div>
                          )}
                          {detection.year && (
                            <div>
                              <span className="font-medium">Year:</span> {detection.year}
                            </div>
                          )}
                        </div>
                      )}

                      {detection.plateSnapshot && (
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm font-medium mb-2">License Plate</p>
                            <img 
                              src={detection.plateSnapshot} 
                              alt="License plate snapshot"
                              className="w-full max-w-xs rounded border"
                            />
                          </div>
                          {detection.vehicleSnapshot && (
                            <div>
                              <p className="text-sm font-medium mb-2">Vehicle</p>
                              <img 
                                src={detection.vehicleSnapshot} 
                                alt="Vehicle snapshot"
                                className="w-full max-w-xs rounded border"
                              />
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="search" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Search License Plates</CardTitle>
              <CardDescription>
                Search for specific license plate detections and view analytics
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Enter license plate (e.g., ABC-1234)"
                  value={searchPlate}
                  onChange={(e) => setSearchPlate(e.target.value.toUpperCase())}
                  onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                  className="font-mono"
                />
                <Button 
                  onClick={handleSearch} 
                  disabled={searchMutation.isPending || !searchPlate.trim()}
                >
                  <Search className="w-4 h-4 mr-2" />
                  Search
                </Button>
              </div>

              {searchMutation.data && (
                <div className="space-y-4">
                  <h3 className="font-semibold">Search Results for {searchPlate}</h3>
                  {searchMutation.data.length === 0 ? (
                    <Alert>
                      <AlertDescription>
                        No detections found for license plate "{searchPlate}"
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <div className="space-y-2">
                      {searchMutation.data.map((detection: VehicleAnalytics) => (
                        <div key={detection.id} className="border rounded p-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="font-mono font-bold">{detection.licensePlate}</div>
                              <div className="text-sm text-muted-foreground">
                                {formatDateTime(detection.timestamp)} • {detection.location}
                              </div>
                              {detection.make && detection.model && (
                                <div className="text-sm">
                                  {detection.year} {detection.make} {detection.model} ({detection.color})
                                </div>
                              )}
                            </div>
                            <div className="text-right">
                              <div className={`text-sm ${getSpeedColor(detection.speed)}`}>
                                {detection.speed ? `${detection.speed} mph` : "Speed N/A"}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {detection.licensePlateConfidence}% confidence
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="dashboard" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Vehicle Makes */}
            <Card>
              <CardHeader>
                <CardTitle>Top Vehicle Makes</CardTitle>
              </CardHeader>
              <CardContent>
                {dashboard?.topVehicleMakes?.length > 0 ? (
                  <div className="space-y-3">
                    {dashboard.topVehicleMakes.map((make, index) => (
                      <div key={make.make} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded bg-primary/10 flex items-center justify-center text-xs">
                            {index + 1}
                          </div>
                          <span>{make.make}</span>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">{make.count}</div>
                          <div className="text-xs text-muted-foreground">
                            {make.percentage.toFixed(1)}%
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground py-4">
                    No vehicle make data available
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Speed Analytics */}
            <Card>
              <CardHeader>
                <CardTitle>Speed Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                {dashboard?.speedAnalytics ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-2xl font-bold">
                          {dashboard.speedAnalytics.averageSpeed.toFixed(1)}
                        </div>
                        <div className="text-xs text-muted-foreground">Average Speed (mph)</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-red-500">
                          {dashboard.speedAnalytics.maxSpeed}
                        </div>
                        <div className="text-xs text-muted-foreground">Max Speed (mph)</div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      {dashboard.speedAnalytics.speedDistribution.map((range) => (
                        <div key={range.range} className="flex justify-between">
                          <span className="text-sm">{range.range}</span>
                          <span className="font-medium">{range.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground py-4">
                    No speed data available
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}