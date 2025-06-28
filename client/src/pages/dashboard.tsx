import { useState, useContext } from "react";
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
      {/* Tactical Command Header */}
      <header className="bg-black border-b border-red-900 px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-red-400 font-mono text-sm font-bold tracking-wider">TACTICAL OPS CENTER</span>
            </div>
            <div className="border-l border-slate-600 pl-4">
              <h2 className="text-xl font-bold text-white font-mono tracking-wide">{selectedHub.name}</h2>
              <div className="flex items-center space-x-2 mt-1">
                <div className={`w-2 h-2 rounded-full ${getStatusColor(selectedHub.status)}`} />
                <span className={`text-xs uppercase font-mono tracking-wider ${
                  selectedHub.status === "online" ? "text-green-400" : 
                  selectedHub.status === "offline" ? "text-red-400" : "text-amber-400"
                }`}>
                  {selectedHub.status}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-6">
            {/* Threat Level */}
            <div className="flex items-center space-x-2">
              <span className="text-xs text-slate-400 font-mono">THREAT LEVEL:</span>
              <span className="text-amber-400 font-mono font-bold">MEDIUM</span>
            </div>
            
            {/* System Status */}
            <div className="flex items-center space-x-3 border border-slate-700 rounded px-3 py-2 bg-slate-900">
              <span className="text-xs text-slate-300 font-mono">SYSTEM:</span>
              <Button
                onClick={handleToggleArm}
                disabled={armHub.isPending || disarmHub.isPending || selectedHub.status === "offline"}
                size="sm"
                className={`${
                  selectedHub.systemArmed
                    ? "bg-red-600 hover:bg-red-700 border-red-500"
                    : "bg-green-600 hover:bg-green-700 border-green-500"
                } text-white font-mono text-xs font-bold tracking-wider border transition-colors`}
              >
                {selectedHub.systemArmed ? (
                  <>
                    <Shield className="w-3 h-3 mr-1" />
                    ARMED
                  </>
                ) : (
                  <>
                    <ShieldOff className="w-3 h-3 mr-1" />
                    DISARMED
                  </>
                )}
              </Button>
            </div>
            
            {/* Time Display */}
            <div className="text-right">
              <div className="text-green-400 font-mono text-sm font-bold">
                {new Date().toLocaleTimeString('en-US', { hour12: false })}
              </div>
              <div className="text-slate-400 font-mono text-xs">
                {new Date().toLocaleDateString('en-US')}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Tactical Dashboard Content */}
      <main className="flex-1 bg-black p-4">
        {/* Tactical Status Bar */}
        <div className="grid grid-cols-4 gap-4 mb-4">
          <div className="bg-slate-900 border border-slate-700 rounded p-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-slate-400 font-mono">CAMERAS ACTIVE</div>
                <div className="text-2xl font-bold text-green-400 font-mono">{activeCameras}</div>
              </div>
              <Video className="w-8 h-8 text-sky-400" />
            </div>
          </div>
          
          <div className="bg-slate-900 border border-slate-700 rounded p-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-slate-400 font-mono">ACTIVE THREATS</div>
                <div className="text-2xl font-bold text-red-400 font-mono">{totalEvents}</div>
              </div>
              <AlertTriangle className="w-8 h-8 text-amber-400" />
            </div>
          </div>
          
          <div className="bg-slate-900 border border-slate-700 rounded p-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-slate-400 font-mono">SYSTEM STATUS</div>
                <div className={`text-2xl font-bold font-mono ${selectedHub.status === "online" ? "text-green-400" : "text-red-400"}`}>
                  {selectedHub.status === "online" ? "ONLINE" : "OFFLINE"}
                </div>
              </div>
              <Heart className={`w-8 h-8 ${selectedHub.status === "online" ? "text-green-400" : "text-red-400"}`} />
            </div>
          </div>
          
          <div className="bg-slate-900 border border-slate-700 rounded p-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-slate-400 font-mono">RESPONSE TIME</div>
                <div className="text-2xl font-bold text-blue-400 font-mono">2.3s</div>
              </div>
              <Clock className="w-8 h-8 text-blue-400" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 h-[calc(100vh-200px)]">
          {/* Main Camera Grid - Larger Column */}
          <div className="col-span-2 bg-slate-900 border border-slate-700 rounded">
            <div className="border-b border-slate-700 px-4 py-2 bg-slate-800">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white font-mono tracking-wider">LIVE SURVEILLANCE GRID</h3>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-xs text-red-400 font-mono">RECORDING</span>
                  <Button variant="outline" size="sm" className="border-slate-600 text-slate-300 ml-4">
                    <Grid className="w-3 h-3 mr-1" />
                    2x2
                  </Button>
                  <Button variant="outline" size="sm" className="border-slate-600 text-slate-300">
                    <Maximize2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </div>
            <div className="p-4">
              {camerasLoading ? (
                <div className="grid grid-cols-2 gap-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="aspect-video bg-slate-800 rounded border border-slate-600" />
                  ))}
                </div>
              ) : (
                <CameraGrid hubId={selectedHubId || undefined} maxCameras={4} showControls={true} />
              )}
            </div>
          </div>

          {/* Right Panel - Events and Controls */}
          <div className="space-y-4">
            {/* Critical Events */}
            <div className="bg-slate-900 border border-slate-700 rounded flex-1">
              <div className="border-b border-slate-700 px-4 py-2 bg-slate-800">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white font-mono tracking-wider">THREAT ALERTS</h3>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
                    <span className="text-xs text-amber-400 font-mono">ACTIVE</span>
                  </div>
                </div>
              </div>
              <div className="p-4 h-80 overflow-y-auto">
                <EventList hubId={selectedHubId || undefined} limit={8} />
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-slate-900 border border-slate-700 rounded">
              <div className="border-b border-slate-700 px-4 py-2 bg-slate-800">
                <h3 className="text-sm font-bold text-white font-mono tracking-wider">TACTICAL CONTROLS</h3>
              </div>
              <div className="p-4 space-y-3">
                {mainSpeaker && (
                  <Button 
                    onClick={handleToggleSpeaker}
                    disabled={!mainSpeaker || updateSpeaker.isPending}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-mono text-xs"
                  >
                    <Volume2 className="w-3 h-3 mr-2" />
                    {mainSpeaker.isActive ? "DISABLE COMMS" : "ENABLE COMMS"}
                  </Button>
                )}
                
                <Button className="w-full bg-amber-600 hover:bg-amber-700 text-white font-mono text-xs">
                  <AlertTriangle className="w-3 h-3 mr-2" />
                  EMERGENCY ALERT
                </Button>
                
                <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white font-mono text-xs">
                  <Users className="w-3 h-3 mr-2" />
                  DISPATCH TEAM
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
