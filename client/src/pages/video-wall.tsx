import { useState, useContext } from "react";
import { useCameras } from "@/hooks/use-hub-data";
import { HubContext } from "@/components/hub-selector";
import CameraGrid from "@/components/camera-grid";
import PTZLiveControl from "@/components/ptz-live-control";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Grid3x3, Grid2x2, Maximize, Minimize, Move3D } from "lucide-react";
import type { Camera } from "@shared/schema";

const gridLayouts = [
  { name: "2x2", value: "2x2", icon: Grid2x2, cols: "grid-cols-2", maxCameras: 4 },
  { name: "2x3", value: "2x3", icon: Grid3x3, cols: "grid-cols-2 lg:grid-cols-3", maxCameras: 6 },
  { name: "3x3", value: "3x3", icon: Grid3x3, cols: "grid-cols-3", maxCameras: 9 },
  { name: "4x4", value: "4x4", icon: Grid3x3, cols: "grid-cols-4", maxCameras: 16 },
];

export default function VideoWall() {
  const { selectedHubId } = useContext(HubContext);
  const { data: cameras, isLoading } = useCameras();
  const [layout, setLayout] = useState("2x3");
  const [expandedCamera, setExpandedCamera] = useState<Camera | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const currentLayout = gridLayouts.find(l => l.value === layout) || gridLayouts[1];
  const allCameras = cameras || [];
  const hubCameras = selectedHubId ? allCameras.filter(camera => camera.hubId === selectedHubId) : allCameras;

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleExpandCamera = (camera: Camera) => {
    setExpandedCamera(camera);
  };

  return (
    <>
      {/* Top Bar */}
      <header className="bg-slate-900 border-b border-slate-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h2 className="text-2xl font-semibold text-white">Video Wall</h2>
            <div className="flex items-center space-x-2 text-sm text-slate-400">
              <span>{hubCameras.length} cameras</span>
              <span>•</span>
              <span>{selectedHubId ? `Hub ${selectedHubId}` : "All Hubs"}</span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {/* Layout Selector */}
            <div className="flex items-center space-x-2">
              <span className="text-sm text-slate-300">Layout:</span>
              <Select value={layout} onValueChange={setLayout}>
                <SelectTrigger className="w-24 bg-slate-800 border-slate-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-600">
                  {gridLayouts.map((layout) => (
                    <SelectItem key={layout.value} value={layout.value} className="text-white hover:bg-slate-700">
                      {layout.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Fullscreen Toggle */}
            <Button
              variant="outline"
              size="sm"
              onClick={toggleFullscreen}
              className="border-slate-600 text-slate-300 hover:text-white"
            >
              {isFullscreen ? (
                <>
                  <Minimize className="w-4 h-4 mr-2" />
                  Exit Fullscreen
                </>
              ) : (
                <>
                  <Maximize className="w-4 h-4 mr-2" />
                  Fullscreen
                </>
              )}
            </Button>
          </div>
        </div>
      </header>

      {/* Video Grid */}
      <main className="flex-1 overflow-auto p-6">
        <div className="bg-slate-850 rounded-xl border border-slate-700 p-6">
          {isLoading ? (
            <div className={`grid ${currentLayout.cols} gap-4`}>
              {Array.from({ length: currentLayout.maxCameras }).map((_, i) => (
                <div key={i} className="aspect-video bg-slate-900 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : hubCameras.length === 0 ? (
            <div className="flex items-center justify-center h-96 bg-slate-900 rounded-lg border-2 border-dashed border-slate-700">
              <div className="text-center">
                <p className="text-slate-400 text-xl">No cameras available</p>
                <p className="text-slate-500 text-sm mt-2">
                  {selectedHubId ? "No cameras found for the selected hub" : "No cameras configured in the system"}
                </p>
              </div>
            </div>
          ) : (
            <div className={`grid ${currentLayout.cols} gap-4`}>
              {hubCameras.slice(0, currentLayout.maxCameras).map((camera) => (
                <div
                  key={camera.id}
                  className="aspect-video bg-slate-900 rounded-lg overflow-hidden relative group cursor-pointer"
                  onClick={() => handleExpandCamera(camera)}
                >
                  {/* Camera feed / thumbnail */}
                  {camera.thumbnailUrl ? (
                    <img
                      src={camera.thumbnailUrl}
                      alt={`${camera.name} - ${camera.location}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-slate-800">
                      <p className="text-slate-400">No feed available</p>
                    </div>
                  )}

                  {/* Overlay */}
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />

                  {/* Camera info */}
                  <div className="absolute bottom-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-sm">
                    {camera.name}
                  </div>
                  <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
                    Hub {camera.hubId}
                  </div>

                  {/* Status indicators */}
                  <div className="absolute top-2 right-2 flex items-center space-x-1">
                    <div className={`w-3 h-3 rounded-full ${
                      camera.status === "online" ? "bg-green-400" : 
                      camera.status === "offline" ? "bg-red-500" : "bg-amber-400"
                    }`} />
                    {camera.isRecording && (
                      <div className="w-3 h-3 bg-red-500 rounded-full recording-pulse" />
                    )}
                  </div>

                  {/* Connection status overlay */}
                  {camera.status === "offline" && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <div className="text-center">
                        <p className="text-red-400 font-medium text-lg">Offline</p>
                        <p className="text-slate-400 text-sm">Connection lost</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Expanded Camera Modal */}
      <Dialog open={!!expandedCamera} onOpenChange={() => setExpandedCamera(null)}>
        <DialogContent className="max-w-6xl max-h-[90vh] bg-slate-900 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center justify-between">
              <div>
                {expandedCamera?.name} - {expandedCamera?.location}
              </div>
              {expandedCamera?.ptzCapable && (
                <div className="flex items-center space-x-2 text-sm text-blue-400">
                  <Move3D className="w-4 h-4" />
                  <span>PTZ Enabled</span>
                </div>
              )}
            </DialogTitle>
          </DialogHeader>
          
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Camera Feed */}
            <div className="lg:col-span-3">
              <div className="aspect-video bg-slate-800 rounded-lg overflow-hidden relative">
                {expandedCamera?.thumbnailUrl ? (
                  <img
                    src={expandedCamera.thumbnailUrl}
                    alt={`${expandedCamera.name} - ${expandedCamera.location}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <p className="text-slate-400">No feed available</p>
                  </div>
                )}
                
                {/* Live stream overlay info */}
                <div className="absolute top-4 left-4 bg-black/70 text-white px-3 py-2 rounded text-sm">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                    <span>LIVE</span>
                  </div>
                </div>
                
                {/* Stream info */}
                <div className="absolute top-4 right-4 bg-black/70 text-white px-3 py-2 rounded text-xs">
                  {expandedCamera?.resolution} • {expandedCamera?.fps} FPS • {expandedCamera?.codec}
                </div>
              </div>
              
              {/* Camera Status Bar */}
              <div className="flex items-center justify-between mt-4 text-sm text-slate-400">
                <div className="flex items-center space-x-4">
                  <span>Hub {expandedCamera?.hubId}</span>
                  <span>•</span>
                  <span>{expandedCamera?.protocol?.toUpperCase()}</span>
                  <span>•</span>
                  <span>{expandedCamera?.ipAddress}:{expandedCamera?.port}</span>
                </div>
                <span className={`capitalize font-medium ${
                  expandedCamera?.status === "online" ? "text-green-400" : 
                  expandedCamera?.status === "offline" ? "text-red-400" : "text-amber-400"
                }`}>
                  {expandedCamera?.status}
                </span>
              </div>
            </div>
            
            {/* PTZ Controls Sidebar */}
            {expandedCamera?.ptzCapable ? (
              <div className="lg:col-span-1">
                <div className="bg-slate-800 rounded-lg p-4">
                  <h3 className="text-white font-medium mb-4 flex items-center">
                    <Move3D className="w-4 h-4 mr-2" />
                    PTZ Control
                  </h3>
                  <PTZLiveControl 
                    camera={expandedCamera} 
                    size="md" 
                    variant="inline" 
                  />
                </div>
              </div>
            ) : (
              <div className="lg:col-span-1">
                <div className="bg-slate-800 rounded-lg p-4">
                  <h3 className="text-white font-medium mb-4">Camera Info</h3>
                  <div className="space-y-3 text-sm">
                    <div>
                      <div className="text-slate-400">Resolution</div>
                      <div className="text-white">{expandedCamera?.resolution}</div>
                    </div>
                    <div>
                      <div className="text-slate-400">Frame Rate</div>
                      <div className="text-white">{expandedCamera?.fps} FPS</div>
                    </div>
                    <div>
                      <div className="text-slate-400">Codec</div>
                      <div className="text-white">{expandedCamera?.codec}</div>
                    </div>
                    <div>
                      <div className="text-slate-400">Features</div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {expandedCamera?.audioEnabled && (
                          <span className="text-xs bg-green-600 text-white px-2 py-1 rounded">Audio</span>
                        )}
                        {expandedCamera?.nightVision && (
                          <span className="text-xs bg-purple-600 text-white px-2 py-1 rounded">Night Vision</span>
                        )}
                        {expandedCamera?.aiAnalyticsEnabled && (
                          <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded">AI Analytics</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
