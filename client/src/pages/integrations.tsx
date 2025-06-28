import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { 
  Shield, 
  Key, 
  CheckCircle, 
  AlertCircle, 
  ExternalLink, 
  Settings, 
  Zap,
  Cloud,
  Database,
  Webhook
} from "lucide-react";

export default function Integrations() {
  const [chektApiKey, setChektApiKey] = useState("");
  const [chektIpAddress, setChektIpAddress] = useState("");
  const [chektEnabled, setChektEnabled] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<"disconnected" | "connected" | "error">("disconnected");
  const { toast } = useToast();

  const handleChektConnection = async () => {
    if (!chektApiKey.trim() || !chektIpAddress.trim()) {
      toast({
        title: "Connection Details Required",
        description: "Please enter both your CHeKT API key and IP address to establish connection",
        variant: "destructive",
      });
      return;
    }

    setIsConnecting(true);
    
    try {
      // Simulate API connection - in real implementation, this would test the CHeKT API
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setConnectionStatus("connected");
      setChektEnabled(true);
      toast({
        title: "CHeKT Integration Connected",
        description: "Successfully connected to CHeKT platform. Event synchronization is now active.",
      });
    } catch (error) {
      setConnectionStatus("error");
      toast({
        title: "Connection Failed",
        description: "Failed to connect to CHeKT platform. Please verify your API key.",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = () => {
    setConnectionStatus("disconnected");
    setChektEnabled(false);
    setChektApiKey("");
    toast({
      title: "Chekt Integration Disconnected",
      description: "Successfully disconnected from Chekt platform.",
    });
  };

  const getStatusBadge = () => {
    switch (connectionStatus) {
      case "connected":
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Connected</Badge>;
      case "error":
        return <Badge variant="destructive">Connection Error</Badge>;
      default:
        return <Badge variant="secondary">Disconnected</Badge>;
    }
  };

  const getStatusIcon = () => {
    switch (connectionStatus) {
      case "connected":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "error":
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Shield className="w-5 h-5 text-slate-500" />;
    }
  };

  return (
    <div className="flex-1 bg-slate-50 dark:bg-slate-950 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Integrations</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            Connect Alert 360 with external security platforms and services
          </p>
        </div>

        <Tabs defaultValue="chekt" className="space-y-6">
          <TabsList className="grid w-full grid-cols-1 lg:grid-cols-4">
            <TabsTrigger value="chekt" className="flex items-center space-x-2">
              <Shield className="w-4 h-4" />
              <span>CHeKT</span>
            </TabsTrigger>
            <TabsTrigger value="webhooks" disabled className="flex items-center space-x-2">
              <Webhook className="w-4 h-4" />
              <span>Webhooks</span>
            </TabsTrigger>
            <TabsTrigger value="cloud" disabled className="flex items-center space-x-2">
              <Cloud className="w-4 h-4" />
              <span>Cloud Storage</span>
            </TabsTrigger>
            <TabsTrigger value="database" disabled className="flex items-center space-x-2">
              <Database className="w-4 h-4" />
              <span>External DB</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="chekt" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon()}
                    <div>
                      <CardTitle>CHeKT Platform Integration</CardTitle>
                      <CardDescription>
                        Connect with CHeKT's security management platform for enhanced monitoring and response. Requires both bridge IP address and API key for authentication.
                      </CardDescription>
                    </div>
                  </div>
                  {getStatusBadge()}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {connectionStatus === "disconnected" && (
                  <div className="space-y-4">
                    <div className="grid gap-2">
                      <Label htmlFor="chekt-ip-address">CHeKT Bridge IP Address</Label>
                      <Input
                        id="chekt-ip-address"
                        type="text"
                        placeholder="192.168.1.100"
                        value={chektIpAddress}
                        onChange={(e) => setChektIpAddress(e.target.value)}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="chekt-api-key">CHeKT API Key</Label>
                      <div className="flex space-x-2">
                        <Input
                          id="chekt-api-key"
                          type="password"
                          placeholder="Enter your CHeKT API key"
                          value={chektApiKey}
                          onChange={(e) => setChektApiKey(e.target.value)}
                          className="flex-1"
                        />
                        <Button 
                          onClick={handleChektConnection}
                          disabled={isConnecting || !chektApiKey.trim() || !chektIpAddress.trim()}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          {isConnecting ? (
                            <>
                              <Zap className="w-4 h-4 mr-2 animate-spin" />
                              Connecting...
                            </>
                          ) : (
                            <>
                              <Key className="w-4 h-4 mr-2" />
                              Connect
                            </>
                          )}
                        </Button>
                      </div>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        You can find your API key in your Chekt dashboard under Settings → API Keys
                      </p>
                    </div>

                    <Separator />

                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                      <h4 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">What this integration enables:</h4>
                      <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
                        <li>• Real-time event synchronization with Chekt platform</li>
                        <li>• Unified incident management and response workflows</li>
                        <li>• Enhanced analytics and reporting capabilities</li>
                        <li>• Automated alert escalation and notifications</li>
                      </ul>
                    </div>
                  </div>
                )}

                {connectionStatus === "connected" && (
                  <div className="space-y-4">
                    <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <h4 className="font-semibold text-green-900 dark:text-green-200">Successfully Connected</h4>
                      </div>
                      <p className="text-sm text-green-800 dark:text-green-300">
                        Alert 360 is now integrated with your Chekt platform. Events and alerts will be automatically synchronized.
                      </p>
                    </div>

                    <div className="grid gap-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-base font-medium">Event Synchronization</Label>
                          <p className="text-sm text-slate-500 dark:text-slate-400">
                            Automatically sync security events with Chekt
                          </p>
                        </div>
                        <Switch checked={chektEnabled} onCheckedChange={setChektEnabled} />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-base font-medium">Real-time Alerts</Label>
                          <p className="text-sm text-slate-500 dark:text-slate-400">
                            Send critical alerts to Chekt in real-time
                          </p>
                        </div>
                        <Switch checked={true} />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-base font-medium">Incident Management</Label>
                          <p className="text-sm text-slate-500 dark:text-slate-400">
                            Create incidents in Chekt for security events
                          </p>
                        </div>
                        <Switch checked={true} />
                      </div>
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Settings className="w-4 h-4 text-slate-500" />
                        <span className="text-sm font-medium">Integration Settings</span>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Open Chekt Dashboard
                        </Button>
                        <Button variant="destructive" size="sm" onClick={handleDisconnect}>
                          Disconnect
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {connectionStatus === "error" && (
                  <div className="space-y-4">
                    <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <AlertCircle className="w-5 h-5 text-red-600" />
                        <h4 className="font-semibold text-red-900 dark:text-red-200">Connection Failed</h4>
                      </div>
                      <p className="text-sm text-red-800 dark:text-red-300">
                        Unable to establish connection with Chekt platform. Please check your API key and try again.
                      </p>
                    </div>
                    <Button 
                      variant="outline" 
                      onClick={() => setConnectionStatus("disconnected")}
                      className="w-full"
                    >
                      Try Again
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="webhooks">
            <Card>
              <CardHeader>
                <CardTitle>Webhook Integrations</CardTitle>
                <CardDescription>Coming soon - Configure webhook endpoints for external integrations</CardDescription>
              </CardHeader>
            </Card>
          </TabsContent>

          <TabsContent value="cloud">
            <Card>
              <CardHeader>
                <CardTitle>Cloud Storage</CardTitle>
                <CardDescription>Coming soon - Connect to cloud storage providers for footage backup</CardDescription>
              </CardHeader>
            </Card>
          </TabsContent>

          <TabsContent value="database">
            <Card>
              <CardHeader>
                <CardTitle>External Database</CardTitle>
                <CardDescription>Coming soon - Sync data with external database systems</CardDescription>
              </CardHeader>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}