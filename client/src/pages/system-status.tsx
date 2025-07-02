import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { RefreshCw, Cpu, HardDrive, Zap, Thermometer, Activity, Camera, Network, CheckCircle } from "lucide-react";
import { useState } from "react";

interface JetsonStatus {
  isJetsonHardware: boolean;
  specs: {
    model: string;
    maxCameras: number;
    maxResolution: string;
    aiPerformance: string;
    memory: string;
    powerModes: string[];
    supportedProtocols: string[];
    hardwareEncoders: string[];
  };
  capabilities: {
    gstreamer: boolean;
    nvcodec: boolean;
    onvif: boolean;
    cuda: boolean;
  } | null;
  metrics: {
    cpu: { usage: number; cores: number; frequency: number };
    gpu: { usage: number; frequency: number };
    memory: { used: number; total: number; percentage: number };
    temperature: { cpu: number; gpu: number; thermal: number };
    power: { current: number; mode: string };
  } | null;
  manager: boolean;
}

export default function SystemStatus() {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { data: status, isLoading, refetch } = useQuery<JetsonStatus>({
    queryKey: ['/api/jetson/status'],
    refetchInterval: 5000, // Refresh every 5 seconds for real-time metrics
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">System Status</h1>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="space-y-2">
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!status) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">System Status</h1>
          <p className="text-muted-foreground">Failed to load system status</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">System Status</h1>
        <Button 
          onClick={handleRefresh} 
          disabled={isRefreshing}
          variant="outline"
          size="sm"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Hardware Detection */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cpu className="h-5 w-5" />
            Hardware Detection
          </CardTitle>
          <CardDescription>
            Jetson Orin NX 16GB AI Hub Detection and Capabilities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <Badge variant={status.isJetsonHardware ? "default" : "secondary"}>
              {status.isJetsonHardware ? "🤖 Jetson Hardware Detected" : "💻 Simulation Mode"}
            </Badge>
            <Badge variant={status.manager ? "default" : "destructive"}>
              {status.manager ? "Hardware Manager Active" : "Hardware Manager Disabled"}
            </Badge>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{status.specs.maxCameras}</div>
              <div className="text-sm text-muted-foreground">Max Cameras</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{status.specs.aiPerformance}</div>
              <div className="text-sm text-muted-foreground">AI Performance</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{status.specs.memory}</div>
              <div className="text-sm text-muted-foreground">Memory</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{status.specs.maxResolution}</div>
              <div className="text-sm text-muted-foreground">Max Resolution</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Capabilities */}
      {status.capabilities && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Hardware Capabilities
            </CardTitle>
            <CardDescription>
              Available hardware acceleration and protocol support
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center gap-2">
                <Badge variant={status.capabilities.gstreamer ? "default" : "destructive"}>
                  {status.capabilities.gstreamer ? "✓" : "✗"}
                </Badge>
                <span>GStreamer</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={status.capabilities.nvcodec ? "default" : "destructive"}>
                  {status.capabilities.nvcodec ? "✓" : "✗"}
                </Badge>
                <span>NVIDIA Codecs</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={status.capabilities.onvif ? "default" : "destructive"}>
                  {status.capabilities.onvif ? "✓" : "✗"}
                </Badge>
                <span>ONVIF</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={status.capabilities.cuda ? "default" : "destructive"}>
                  {status.capabilities.cuda ? "✓" : "✗"}
                </Badge>
                <span>CUDA</span>
              </div>
            </div>
            
            <Separator className="my-4" />
            
            <div>
              <h4 className="font-semibold mb-2">Supported Protocols</h4>
              <div className="flex flex-wrap gap-2">
                {status.specs.supportedProtocols.map((protocol) => (
                  <Badge key={protocol} variant="outline">{protocol}</Badge>
                ))}
              </div>
            </div>
            
            <div className="mt-4">
              <h4 className="font-semibold mb-2">Hardware Encoders</h4>
              <div className="flex flex-wrap gap-2">
                {status.specs.hardwareEncoders.map((encoder) => (
                  <Badge key={encoder} variant="outline">{encoder}</Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* System Metrics */}
      {status.metrics && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* CPU Usage */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">CPU Usage</CardTitle>
              <Cpu className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{status.metrics.cpu.usage.toFixed(1)}%</div>
              <Progress value={status.metrics.cpu.usage} className="mt-2" />
              <div className="text-xs text-muted-foreground mt-2">
                {status.metrics.cpu.cores} cores @ {status.metrics.cpu.frequency}MHz
              </div>
            </CardContent>
          </Card>

          {/* GPU Usage */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">GPU Usage</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{status.metrics.gpu.usage.toFixed(1)}%</div>
              <Progress value={status.metrics.gpu.usage} className="mt-2" />
              <div className="text-xs text-muted-foreground mt-2">
                {status.metrics.gpu.frequency}MHz
              </div>
            </CardContent>
          </Card>

          {/* Memory Usage */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
              <HardDrive className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{status.metrics.memory.percentage.toFixed(1)}%</div>
              <Progress value={status.metrics.memory.percentage} className="mt-2" />
              <div className="text-xs text-muted-foreground mt-2">
                {(status.metrics.memory.used / 1000).toFixed(1)}GB / {(status.metrics.memory.total / 1000).toFixed(1)}GB
              </div>
            </CardContent>
          </Card>

          {/* CPU Temperature */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">CPU Temperature</CardTitle>
              <Thermometer className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{status.metrics.temperature.cpu.toFixed(1)}°C</div>
              <Progress 
                value={(status.metrics.temperature.cpu / 100) * 100} 
                className="mt-2" 
              />
              <div className="text-xs text-muted-foreground mt-2">
                Normal operating range
              </div>
            </CardContent>
          </Card>

          {/* GPU Temperature */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">GPU Temperature</CardTitle>
              <Thermometer className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{status.metrics.temperature.gpu.toFixed(1)}°C</div>
              <Progress 
                value={(status.metrics.temperature.gpu / 100) * 100} 
                className="mt-2" 
              />
              <div className="text-xs text-muted-foreground mt-2">
                Hardware accelerated
              </div>
            </CardContent>
          </Card>

          {/* Power Consumption */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Power Consumption</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{status.metrics.power.current.toFixed(1)}W</div>
              <div className="text-xs text-muted-foreground mt-2">
                Mode: {status.metrics.power.mode}
              </div>
              <div className="flex flex-wrap gap-1 mt-2">
                {status.specs.powerModes.map((mode) => (
                  <Badge 
                    key={mode} 
                    variant={mode === status.metrics?.power.mode ? "default" : "outline"}
                    className="text-xs"
                  >
                    {mode}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Auto-Boot Ready Status */}
      {!status.isJetsonHardware && (
        <Card className="mt-6 border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800 dark:text-green-200">
              <CheckCircle className="h-5 w-5" />
              System Ready for Deployment
            </CardTitle>
          </CardHeader>
          <CardContent className="text-green-700 dark:text-green-300">
            <p className="mb-4">Your Alert 360 Video Shield system is auto-boot ready:</p>
            <ul className="list-disc list-inside space-y-2 text-sm">
              <li>Automatic hardware detection and optimization enabled</li>
              <li>Camera discovery will automatically detect ONVIF devices on network</li>
              <li>Hardware acceleration activates automatically when deployed on Jetson</li>
              <li>All AI analytics models pre-configured and ready for immediate use</li>
              <li>System will auto-configure for optimal performance on deployment</li>
            </ul>
            <p className="mt-4 text-sm font-medium">
              Simply deploy to your target hardware - no manual setup required.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}