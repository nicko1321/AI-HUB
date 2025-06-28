import { useState, useContext } from "react";
import { useHubs, useCameras, useEvents, useSpeakers, useArmHub, useDisarmHub, useUpdateSpeaker } from "@/hooks/use-hub-data";
import { HubContext } from "@/components/hub-selector";
import StatusCard from "@/components/status-card";
import CameraGrid from "@/components/camera-grid";
import EventList from "@/components/event-list";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Video, AlertTriangle, Heart, Shield, ShieldOff, Volume2, VolumeX, Expand, Download, FileText, Wrench } from "lucide-react";
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
      {/* Top Bar */}
      <header className="bg-slate-900 border-b border-slate-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h2 className="text-2xl font-semibold text-white">{selectedHub.name} Dashboard</h2>
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${getStatusColor(selectedHub.status)}`} />
              <span className={`text-sm capitalize ${
                selectedHub.status === "online" ? "text-green-400" : 
                selectedHub.status === "offline" ? "text-red-400" : "text-amber-400"
              }`}>
                {selectedHub.status}
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {/* System Arm/Disarm */}
            <div className="flex items-center space-x-3">
              <span className="text-sm text-slate-300">System Status:</span>
              <Button
                onClick={handleToggleArm}
                disabled={armHub.isPending || disarmHub.isPending || selectedHub.status === "offline"}
                className={`${
                  selectedHub.systemArmed
                    ? "bg-red-500 hover:bg-red-600"
                    : "bg-green-500 hover:bg-green-600"
                } text-white font-medium transition-colors`}
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
            {/* User Profile */}
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center">
                <span className="text-slate-300 text-sm font-medium">A</span>
              </div>
              <span className="text-sm text-slate-300">Admin User</span>
            </div>
          </div>
        </div>
      </header>

      {/* Dashboard Content */}
      <main className="flex-1 overflow-auto p-6">
        {/* System Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatusCard
            title="Active Cameras"
            value={activeCameras}
            icon={Video}
            iconColor="bg-sky-500/10 text-sky-400"
            description={`${cameras?.length || 0} total cameras`}
          />
          
          <StatusCard
            title="Events Today"
            value={totalEvents}
            icon={AlertTriangle}
            iconColor="bg-amber-500/10 text-amber-400"
            description="Recent activity"
          />
          
          <StatusCard
            title="System Health"
            value={selectedHub.status === "online" ? "Excellent" : "Poor"}
            icon={Heart}
            iconColor={selectedHub.status === "online" ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"}
            description={`Last ping: ${selectedHub.lastHeartbeat ? new Date(selectedHub.lastHeartbeat).toLocaleTimeString() : "Unknown"}`}
          />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Live Camera Feeds */}
          <div className="xl:col-span-2">
            <div className="bg-slate-850 rounded-xl border border-slate-700 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-white">Live Camera Feeds</h3>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-slate-600 text-slate-300 hover:text-white"
                  onClick={() => window.open("/video-wall", "_blank")}
                >
                  <Expand className="w-4 h-4 mr-2" />
                  Full Screen
                </Button>
              </div>
              
              {camerasLoading ? (
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Skeleton key={i} className="aspect-video bg-slate-900 rounded-lg" />
                  ))}
                </div>
              ) : (
                <CameraGrid hubId={selectedHubId || undefined} maxCameras={6} />
              )}
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Recent Events */}
            <div className="bg-slate-850 rounded-xl border border-slate-700 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Recent Events</h3>
              <EventList hubId={selectedHubId || undefined} limit={5} />
              <Button
                variant="outline"
                className="w-full mt-4 border-slate-600 text-slate-300 hover:text-white"
                onClick={() => window.location.href = "/events"}
              >
                View All Events
              </Button>
            </div>

            {/* Hub Controls */}
            <div className="bg-slate-850 rounded-xl border border-slate-700 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Hub Controls</h3>
              <div className="space-y-4">
                {/* Speaker Integration */}
                {mainSpeaker && (
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-white">IP Speaker</p>
                      <p className="text-xs text-slate-400">{mainSpeaker.zone} - {selectedHub.location}</p>
                    </div>
                    <Button
                      size="sm"
                      onClick={handleToggleSpeaker}
                      disabled={updateSpeaker.isPending || selectedHub.status === "offline"}
                      className={`${
                        mainSpeaker.isActive
                          ? "bg-sky-500 hover:bg-sky-600"
                          : "bg-slate-700 hover:bg-slate-600"
                      } text-white transition-colors`}
                    >
                      {mainSpeaker.isActive ? (
                        <>
                          <Volume2 className="w-4 h-4 mr-1" />
                          On
                        </>
                      ) : (
                        <>
                          <VolumeX className="w-4 h-4 mr-1" />
                          Off
                        </>
                      )}
                    </Button>
                  </div>
                )}
                
                {/* Recording Status */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-white">Recording</p>
                    <p className="text-xs text-slate-400">{activeCameras} cameras active</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full recording-pulse" />
                    <span className="text-xs text-red-400">REC</span>
                  </div>
                </div>
                
                {/* Quick Actions */}
                <div className="pt-4 border-t border-slate-700">
                  <p className="text-sm font-medium text-white mb-3">Quick Actions</p>
                  <div className="space-y-2">
                    <Button
                      variant="outline"
                      className="w-full justify-start border-slate-600 text-slate-300 hover:text-white"
                      disabled={selectedHub.status === "offline"}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Export Footage
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start border-slate-600 text-slate-300 hover:text-white"
                      disabled={selectedHub.status === "offline"}
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      Generate Report
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start border-slate-600 text-slate-300 hover:text-white"
                      disabled={selectedHub.status === "offline"}
                    >
                      <Wrench className="w-4 h-4 mr-2" />
                      System Diagnostics
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
