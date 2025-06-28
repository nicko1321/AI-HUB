import React, { useState, useContext } from "react";
import { useHubs, useCameras, useEvents, useSpeakers, useArmHub, useDisarmHub, useUpdateSpeaker } from "@/hooks/use-hub-data";
import { HubContext } from "@/components/hub-selector";
import StatusCard from "@/components/status-card";
import CameraGrid from "@/components/camera-grid";
import EventList from "@/components/event-list";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Video, AlertTriangle, Heart, Shield, ShieldOff, Volume2, VolumeX, Expand, Download, FileText, Wrench, Clock, Grid, Maximize2, Users } from "lucide-react";
import { getStatusColor } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

export default function Dashboard() {
  const { selectedHubId } = useContext(HubContext);
  const [securityLevel, setSecurityLevel] = React.useState<"Normal" | "VIP">("Normal");
  const { data: hubs, isLoading: hubsLoading } = useHubs();
  const { data: cameras, isLoading: camerasLoading } = useCameras(selectedHubId || undefined);
  const { data: events, isLoading: eventsLoading } = useEvents(selectedHubId || undefined, 5);
  const { data: speakers } = useSpeakers(selectedHubId || undefined);
  const armHub = useArmHub();
  const disarmHub = useDisarmHub();
  const updateSpeaker = useUpdateSpeaker();
  const { toast } = useToast();

  const selectedHub = hubs?.find(hub => hub.id === selectedHubId);
  const activeCameras = cameras?.filter(camera => camera.status === "online").length || 0;
  const totalEvents = events?.length || 0;
  const mainSpeaker = speakers?.[0];

  const handleToggleArm = async () => {
    if (!selectedHubId) return;
    
    try {
      if (selectedHub?.systemArmed) {
        await disarmHub.mutateAsync(selectedHubId);
        toast({
          title: "System Disarmed",
          description: `${selectedHub.name} security system has been disarmed`,
        });
      } else {
        await armHub.mutateAsync(selectedHubId);
        toast({
          title: "System Armed",
          description: `${selectedHub.name} security system has been armed`,
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to toggle system arm status",
        variant: "destructive",
      });
    }
  };

  const handleToggleSpeaker = async () => {
    if (!mainSpeaker) return;
    
    try {
      await updateSpeaker.mutateAsync({
        id: mainSpeaker.id,
        updates: { isActive: !mainSpeaker.isActive }
      });
      toast({
        title: mainSpeaker.isActive ? "Speaker Disabled" : "Speaker Enabled",
        description: `${mainSpeaker.name} has been ${mainSpeaker.isActive ? "disabled" : "enabled"}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to toggle speaker",
        variant: "destructive",
      });
    }
  };

  if (hubsLoading) {
    return (
      <div className="flex-1 p-6">
        <div className="animate-pulse">
          <Skeleton className="h-8 w-64 mb-6" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!selectedHub) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-400 text-lg">No hub selected</p>
          <p className="text-slate-500 text-sm mt-1">Please select a hub from the sidebar</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Modern Dashboard Header */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
              <span className="text-slate-900 dark:text-white text-lg font-semibold">Security Dashboard</span>
            </div>
            <div className="border-l border-slate-200 dark:border-slate-700 pl-6">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">{selectedHub.name}</h2>
              <div className="flex items-center space-x-2 mt-1">
                <div className={`w-2 h-2 rounded-full ${getStatusColor(selectedHub.status)}`} />
                <span className={`text-sm font-medium capitalize ${
                  selectedHub.status === "online" ? "text-green-600 dark:text-green-400" : 
                  selectedHub.status === "offline" ? "text-red-600 dark:text-red-400" : "text-amber-600 dark:text-amber-400"
                }`}>
                  {selectedHub.status}
                </span>
                <span className="text-slate-500 dark:text-slate-400 text-sm">• {selectedHub.location}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-6">
            {/* Security Level */}
            <div className="flex items-center space-x-3">
              <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Security Level:</span>
              <div className="flex items-center space-x-2">
                <Button
                  variant={securityLevel === "Normal" ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    setSecurityLevel("Normal");
                    toast({
                      title: "Security Level Changed",
                      description: "Security level set to Normal - Standard monitoring protocols active",
                    });
                  }}
                  className={`text-xs font-medium ${
                    securityLevel === "Normal" 
                      ? "bg-blue-600 hover:bg-blue-700 text-white" 
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                >
                  Normal
                </Button>
                <Button
                  variant={securityLevel === "VIP" ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    setSecurityLevel("VIP");
                    toast({
                      title: "VIP Security Level Active",
                      description: "Enhanced monitoring protocols and priority response activated",
                    });
                  }}
                  className={`text-xs font-medium ${
                    securityLevel === "VIP" 
                      ? "bg-gradient-to-r from-purple-600 to-amber-600 hover:from-purple-700 hover:to-amber-700 text-white" 
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                >
                  VIP
                </Button>
              </div>
            </div>
            
            {/* System Status */}
            <div className="flex items-center space-x-3">
              <span className="text-sm font-medium text-slate-600 dark:text-slate-400">System:</span>
              <Button
                onClick={handleToggleArm}
                disabled={armHub.isPending || disarmHub.isPending || selectedHub.status === "offline"}
                size="sm"
                className={`${
                  selectedHub.systemArmed
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-green-600 hover:bg-green-700"
                } text-white font-medium`}
              >
                {selectedHub.systemArmed ? (
                  <>
                    <Shield className="w-4 h-4 mr-2" />
                    Armed
                  </>
                ) : (
                  <>
                    <ShieldOff className="w-4 h-4 mr-2" />
                    Disarmed
                  </>
                )}
              </Button>
            </div>
            
            {/* Time Display */}
            <div className="text-right">
              <div className="text-slate-900 dark:text-white text-sm font-semibold">
                {new Date().toLocaleTimeString('en-US', { hour12: false })}
              </div>
              <div className="text-slate-500 dark:text-slate-400 text-sm">
                {new Date().toLocaleDateString('en-US')}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Modern Dashboard Content */}
      <main className="flex-1 bg-slate-50 dark:bg-slate-950 p-6">
        {/* Modern Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-slate-200 dark:border-slate-800 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Active Cameras</p>
                <p className="text-3xl font-bold text-slate-900 dark:text-white">{activeCameras}</p>
                <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">Online and recording</p>
              </div>
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <Video className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-slate-200 dark:border-slate-800 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Active Events</p>
                <p className="text-3xl font-bold text-slate-900 dark:text-white">{totalEvents}</p>
                <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">Requiring attention</p>
              </div>
              <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-slate-200 dark:border-slate-800 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">System Health</p>
                <p className={`text-3xl font-bold ${selectedHub.status === "online" ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                  {selectedHub.status === "online" ? "Excellent" : "Poor"}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">All systems operational</p>
              </div>
              <div className={`p-3 rounded-lg ${selectedHub.status === "online" ? "bg-green-50 dark:bg-green-900/20" : "bg-red-50 dark:bg-red-900/20"}`}>
                <Heart className={`w-6 h-6 ${selectedHub.status === "online" ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`} />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Live Camera Feeds */}
          <div className="xl:col-span-2">
            <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
              <div className="border-b border-slate-200 dark:border-slate-800 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Live Camera Feeds</h3>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                      <span className="text-sm text-red-500 font-medium">Live</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm" className="text-slate-600 dark:text-slate-400">
                      <Grid className="w-4 h-4 mr-2" />
                      Grid View
                    </Button>
                    <Button variant="outline" size="sm" className="text-slate-600 dark:text-slate-400">
                      <Maximize2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
              <div className="p-6">
                {camerasLoading ? (
                  <div className="grid grid-cols-2 gap-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <Skeleton key={i} className="aspect-video bg-slate-100 dark:bg-slate-800 rounded-lg" />
                    ))}
                  </div>
                ) : (
                  <CameraGrid hubId={selectedHubId || undefined} maxCameras={4} showControls={true} />
                )}
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Recent Events */}
            <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
              <div className="border-b border-slate-200 dark:border-slate-800 px-6 py-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Recent Events</h3>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
                    <span className="text-sm text-amber-500 font-medium">{totalEvents} Active</span>
                  </div>
                </div>
              </div>
              <div className="max-h-80 overflow-y-auto">
                <EventList hubId={selectedHubId || undefined} limit={8} />
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
              <div className="border-b border-slate-200 dark:border-slate-800 px-6 py-4">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Quick Actions</h3>
              </div>
              <div className="p-6 space-y-3">
                {mainSpeaker && (
                  <Button 
                    onClick={handleToggleSpeaker}
                    disabled={!mainSpeaker || updateSpeaker.isPending}
                    className="w-full justify-start bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Volume2 className="w-4 h-4 mr-2" />
                    {mainSpeaker.isActive ? "Disable Communications" : "Enable Communications"}
                  </Button>
                )}
                
                <Button className="w-full justify-start bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white">
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Emergency Alert
                </Button>
                
                <Button variant="outline" className="w-full justify-start border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
                  <Users className="w-4 h-4 mr-2" />
                  Dispatch Security Team
                </Button>
                
                <Button variant="outline" className="w-full justify-start border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
                  <Download className="w-4 h-4 mr-2" />
                  Export Footage
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
