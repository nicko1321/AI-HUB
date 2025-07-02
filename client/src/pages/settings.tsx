import { useState } from "react";
import { useHubs, useCameras, useSpeakers } from "@/hooks/use-hub-data";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import CameraManagement from "@/components/camera-management";
import SpeakerManagement from "@/components/speaker-management";
import PTZControl from "@/components/ptz-control";
import SimpleHubUsers from "@/components/simple-hub-users";
import { Settings2, Network, Users, Shield, Database, Activity, Video, Volume2 } from "lucide-react";
import { getStatusColor } from "@/lib/utils";
import type { Speaker } from "../../../shared/schema";

// Camera Manager Section Component
function CameraManagerSection({ hubs }: { hubs: any[] | undefined }) {
  const [selectedHubId, setSelectedHubId] = useState<number>(hubs?.[0]?.id || 1);
  const { data: cameras, isLoading: camerasLoading } = useCameras(selectedHubId);
  const { data: speakers, isLoading: speakersLoading } = useSpeakers(selectedHubId);

  if (!hubs?.length) {
    return (
      <Card className="bg-slate-850 border-slate-700">
        <CardContent className="text-center py-12">
          <Video className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-400">No hubs available</p>
          <p className="text-slate-500 text-sm mt-1">Add a hub first to manage cameras</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      {/* Hub Selection */}
      <Card className="bg-slate-850 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Select Hub</CardTitle>
          <CardDescription className="text-slate-400">
            Choose which hub to manage cameras for
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {hubs.map((hub) => (
              <Button
                key={hub.id}
                variant={selectedHubId === hub.id ? "default" : "outline"}
                onClick={() => setSelectedHubId(hub.id)}
                className={selectedHubId === hub.id ? 
                  "bg-sky-500 hover:bg-sky-600" : 
                  "border-slate-600 text-slate-300 hover:text-white"
                }
              >
                {hub.name}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Camera Management */}
      <Card className="bg-slate-850 border-slate-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white">Camera Management</CardTitle>
              <CardDescription className="text-slate-400">
                Manage IP cameras connected via RTSP, ONVIF, or HTTP protocols
              </CardDescription>
            </div>
            <CameraManagement hubId={selectedHubId} cameras={cameras || []} />
          </div>
        </CardHeader>
        <CardContent>
          {camerasLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-20 bg-slate-800" />
              ))}
            </div>
          ) : cameras?.length ? (
            <div className="space-y-4">
              {cameras.map((camera) => (
                <div
                  key={camera.id}
                  className="flex items-center justify-between p-4 bg-slate-900 rounded-lg border border-slate-700"
                >
                  <div className="flex items-center space-x-4">
                    <div className={`w-3 h-3 rounded-full ${getStatusColor(camera.status)}`} />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="text-white font-medium">{camera.name}</h3>
                        <Badge variant="outline" className="border-slate-600 text-slate-300 text-xs">
                          {camera.protocol?.toUpperCase()}
                        </Badge>
                        {camera.ptzCapable && (
                          <Badge variant="secondary" className="text-xs">PTZ</Badge>
                        )}
                        {camera.nightVision && (
                          <Badge variant="secondary" className="text-xs">Night Vision</Badge>
                        )}
                      </div>
                      <p className="text-slate-400 text-sm">{camera.location}</p>
                      <div className="flex items-center space-x-4 text-slate-500 text-xs mt-1">
                        <span>{camera.ipAddress}:{camera.port}</span>
                        <span>•</span>
                        <span>{camera.resolution}</span>
                        <span>•</span>
                        <span>{camera.fps} FPS</span>
                        <span>•</span>
                        <span>{camera.codec}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Badge 
                      variant="outline" 
                      className={`border-slate-600 capitalize ${
                        camera.status === "online" ? "text-green-400" : 
                        camera.status === "offline" ? "text-red-400" : "text-amber-400"
                      }`}
                    >
                      {camera.status}
                    </Badge>
                    {camera.isRecording && (
                      <Badge variant="destructive" className="text-xs">
                        REC
                      </Badge>
                    )}
                    <div className="flex items-center space-x-2">
                      {camera.ptzCapable && (
                        <PTZControl camera={camera} />
                      )}
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="border-slate-600 text-slate-300 hover:text-white"
                      >
                        Configure
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Video className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-400">No cameras configured</p>
              <p className="text-slate-500 text-sm mt-1">
                Add cameras to start monitoring this hub
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* IP Speaker Management */}
      <Card className="bg-slate-850 border-slate-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white">IP Speaker Management</CardTitle>
              <CardDescription className="text-slate-400">
                Manage IP speakers for emergency announcements and zone-based audio communications
              </CardDescription>
            </div>
            <SpeakerManagement hubId={selectedHubId} speakers={speakers || []} />
          </div>
        </CardHeader>
        <CardContent>
          {speakersLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 2 }).map((_, i) => (
                <Skeleton key={i} className="h-20 bg-slate-800" />
              ))}
            </div>
          ) : speakers?.length ? (
            <div className="space-y-4">
              {speakers.map((speaker) => (
                <div
                  key={speaker.id}
                  className="flex items-center justify-between p-4 bg-slate-900 rounded-lg border border-slate-700"
                >
                  <div className="flex items-center space-x-4">
                    <div className={`w-3 h-3 rounded-full ${getStatusColor(speaker.status)}`} />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="text-white font-medium">{speaker.name}</h3>
                        <Badge variant="outline" className="text-xs border-slate-600 text-slate-300">
                          {speaker.zone}
                        </Badge>
                      </div>
                      <p className="text-slate-400 text-sm">{speaker.ipAddress}</p>
                      <div className="flex items-center space-x-4 mt-1 text-xs text-slate-500">
                        <span>Volume: {speaker.volume}%</span>
                        <span>Status: {speaker.status}</span>
                        {speaker.isActive && (
                          <Badge variant="destructive" className="text-xs">
                            ACTIVE
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge 
                      className={`text-xs ${
                        speaker.status === "online" ? "bg-green-600" : 
                        speaker.status === "offline" ? "bg-red-600" : "bg-amber-600"
                      } ${
                        speaker.status === "online" ? "text-white" : 
                        speaker.status === "offline" ? "text-white" : "text-black"
                      }`}
                    >
                      {speaker.status}
                    </Badge>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="border-slate-600 text-slate-300 hover:text-white"
                    >
                      Configure
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Volume2 className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-400">No IP speakers configured</p>
              <p className="text-slate-500 text-sm mt-1">
                Add IP speakers for emergency announcements and zone communications
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Camera Network Tools */}
      <Card className="bg-slate-850 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Network Tools</CardTitle>
          <CardDescription className="text-slate-400">
            Network utilities for camera discovery and testing
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="border-slate-600 text-slate-300 hover:text-white">
              <Network className="w-4 h-4 mr-2" />
              Scan Network
            </Button>
            <Button variant="outline" className="border-slate-600 text-slate-300 hover:text-white">
              <Activity className="w-4 h-4 mr-2" />
              Test Connections
            </Button>
            <Button variant="outline" className="border-slate-600 text-slate-300 hover:text-white">
              <Database className="w-4 h-4 mr-2" />
              Export Config
            </Button>
          </div>
        </CardContent>
      </Card>
    </>
  );
}

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
              <TabsTrigger value="cameras" className="data-[state=active]:bg-slate-700">
                <Video className="w-4 h-4 mr-2" />
                Camera Management
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

            {/* Camera Management */}
            <TabsContent value="cameras" className="space-y-6">
              <CameraManagerSection hubs={hubs} />
            </TabsContent>

            {/* User Management */}
            <TabsContent value="users" className="space-y-6">
              {hubs && hubs.length > 0 ? (
                <div className="space-y-6">
                  {hubs.map((hub) => (
                    <SimpleHubUsers key={hub.id} hubId={hub.id} hubName={hub.name} />
                  ))}
                </div>
              ) : (
                <Card className="bg-slate-850 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white">User Management</CardTitle>
                    <CardDescription className="text-slate-400">
                      No hubs available for user management
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-12">
                      <Users className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                      <p className="text-slate-400">Add a hub first</p>
                      <p className="text-slate-500 text-sm mt-1">
                        You need to have hubs configured before you can invite users
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
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
