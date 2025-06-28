import { useState } from "react";
import { useHubs } from "@/hooks/use-hub-data";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Settings2, Network, Users, Shield, Database, Activity } from "lucide-react";
import { getStatusColor } from "@/lib/utils";

export default function Settings() {
  const { data: hubs, isLoading } = useHubs();
  const [selectedHub, setSelectedHub] = useState<number | null>(null);

  if (isLoading) {
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
            <h2 className="text-2xl font-semibold text-white">Settings</h2>
          </div>
        </div>
      </header>

      {/* Settings Content */}
      <main className="flex-1 overflow-auto p-6">
        <div className="max-w-6xl mx-auto">
          <Tabs defaultValue="hubs" className="space-y-6">
            <TabsList className="bg-slate-800 border-slate-700">
              <TabsTrigger value="hubs" className="data-[state=active]:bg-slate-700">
                <Network className="w-4 h-4 mr-2" />
                Hub Management
              </TabsTrigger>
              <TabsTrigger value="users" className="data-[state=active]:bg-slate-700">
                <Users className="w-4 h-4 mr-2" />
                User Management
              </TabsTrigger>
              <TabsTrigger value="security" className="data-[state=active]:bg-slate-700">
                <Shield className="w-4 h-4 mr-2" />
                Security Settings
              </TabsTrigger>
              <TabsTrigger value="system" className="data-[state=active]:bg-slate-700">
                <Settings2 className="w-4 h-4 mr-2" />
                System Settings
              </TabsTrigger>
            </TabsList>

            {/* Hub Management */}
            <TabsContent value="hubs" className="space-y-6">
              <Card className="bg-slate-850 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Connected Hubs</CardTitle>
                  <CardDescription className="text-slate-400">
                    Manage your Jetson Orin hub devices and monitor their status
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {hubs?.map((hub) => (
                    <div
                      key={hub.id}
                      className="flex items-center justify-between p-4 bg-slate-900 rounded-lg border border-slate-700"
                    >
                      <div className="flex items-center space-x-4">
                        <div className={`w-3 h-3 rounded-full ${getStatusColor(hub.status)}`} />
                        <div>
                          <h3 className="text-white font-medium">{hub.name}</h3>
                          <p className="text-slate-400 text-sm">{hub.location}</p>
                          <p className="text-slate-500 text-xs">S/N: {hub.serialNumber}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Badge variant="outline" className={`border-slate-600 capitalize ${
                          hub.status === "online" ? "text-green-400" : 
                          hub.status === "offline" ? "text-red-400" : "text-amber-400"
                        }`}>
                          {hub.status}
                        </Badge>
                        <Badge variant="outline" className={`border-slate-600 ${
                          hub.systemArmed ? "text-red-400" : "text-green-400"
                        }`}>
                          {hub.systemArmed ? "Armed" : "Disarmed"}
                        </Badge>
                        <Button variant="outline" size="sm" className="border-slate-600 text-slate-300 hover:text-white">
                          Configure
                        </Button>
                      </div>
                    </div>
                  ))}
                  
                  <Button className="w-full bg-sky-500 hover:bg-sky-600 text-white">
                    + Add New Hub
                  </Button>
                </CardContent>
              </Card>

              {/* Hub Configuration */}
              <Card className="bg-slate-850 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Hub Configuration</CardTitle>
                  <CardDescription className="text-slate-400">
                    Configure individual hub settings and parameters
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-white">Hub Name</Label>
                      <Input className="bg-slate-800 border-slate-600 text-white" placeholder="Enter hub name" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-white">Location</Label>
                      <Input className="bg-slate-800 border-slate-600 text-white" placeholder="Enter location" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-white">Serial Number</Label>
                      <Input className="bg-slate-800 border-slate-600 text-white" placeholder="AO-HUB-001-2024" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-white">Max Cameras</Label>
                      <Input className="bg-slate-800 border-slate-600 text-white" placeholder="16" type="number" />
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" className="border-slate-600 text-slate-300 hover:text-white">
                      Test Connection
                    </Button>
                    <Button className="bg-sky-500 hover:bg-sky-600 text-white">
                      Save Configuration
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* User Management */}
            <TabsContent value="users" className="space-y-6">
              <Card className="bg-slate-850 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">User Accounts</CardTitle>
                  <CardDescription className="text-slate-400">
                    Manage user accounts and access permissions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <Users className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-400">User management coming soon</p>
                    <p className="text-slate-500 text-sm mt-1">
                      This feature will allow you to manage user accounts and permissions
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Security Settings */}
            <TabsContent value="security" className="space-y-6">
              <Card className="bg-slate-850 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Security Configuration</CardTitle>
                  <CardDescription className="text-slate-400">
                    Configure security settings and access controls
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <Shield className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-400">Security settings coming soon</p>
                    <p className="text-slate-500 text-sm mt-1">
                      This feature will allow you to configure advanced security settings
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* System Settings */}
            <TabsContent value="system" className="space-y-6">
              <Card className="bg-slate-850 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">System Configuration</CardTitle>
                  <CardDescription className="text-slate-400">
                    Configure global system settings and preferences
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="text-white font-medium">Storage Settings</h4>
                      <div className="space-y-2">
                        <Label className="text-white">Retention Period (days)</Label>
                        <Input className="bg-slate-800 border-slate-600 text-white" defaultValue="30" type="number" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-white">Max Storage (GB)</Label>
                        <Input className="bg-slate-800 border-slate-600 text-white" defaultValue="1000" type="number" />
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <h4 className="text-white font-medium">Notification Settings</h4>
                      <div className="space-y-2">
                        <Label className="text-white">Email Notifications</Label>
                        <Input className="bg-slate-800 border-slate-600 text-white" placeholder="admin@company.com" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-white">Alert Threshold</Label>
                        <Input className="bg-slate-800 border-slate-600 text-white" defaultValue="high" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button variant="outline" className="border-slate-600 text-slate-300 hover:text-white">
                      Reset to Defaults
                    </Button>
                    <Button className="bg-sky-500 hover:bg-sky-600 text-white">
                      Save Settings
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* System Status */}
              <Card className="bg-slate-850 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">System Status</CardTitle>
                  <CardDescription className="text-slate-400">
                    Monitor overall system health and performance
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-slate-900 rounded-lg">
                      <Database className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                      <p className="text-white font-medium">Storage</p>
                      <p className="text-2xl font-bold text-purple-400">67%</p>
                      <p className="text-slate-400 text-sm">670GB / 1TB</p>
                    </div>
                    <div className="text-center p-4 bg-slate-900 rounded-lg">
                      <Activity className="w-8 h-8 text-green-400 mx-auto mb-2" />
                      <p className="text-white font-medium">Performance</p>
                      <p className="text-2xl font-bold text-green-400">98%</p>
                      <p className="text-slate-400 text-sm">Excellent</p>
                    </div>
                    <div className="text-center p-4 bg-slate-900 rounded-lg">
                      <Network className="w-8 h-8 text-sky-400 mx-auto mb-2" />
                      <p className="text-white font-medium">Network</p>
                      <p className="text-2xl font-bold text-sky-400">45ms</p>
                      <p className="text-slate-400 text-sm">Average latency</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </>
  );
}
