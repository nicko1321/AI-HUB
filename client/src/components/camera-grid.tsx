import { useState } from "react";
import { useCameras } from "@/hooks/use-hub-data";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Expand, Play, Pause } from "lucide-react";
import { getStatusColor } from "@/lib/utils";
import type { Camera } from "@shared/schema";

interface CameraGridProps {
  hubId?: number;
  maxCameras?: number;
  showControls?: boolean;
  onExpandCamera?: (camera: Camera) => void;
}

export default function CameraGrid({ 
  hubId, 
  maxCameras = 6, 
  showControls = true,
  onExpandCamera 
}: CameraGridProps) {
  const { data: cameras, isLoading } = useCameras(hubId);
  const [expandedCamera, setExpandedCamera] = useState<number | null>(null);

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: maxCameras }).map((_, i) => (
          <Skeleton key={i} className="aspect-video bg-slate-900 rounded-lg" />
        ))}
      </div>
    );
  }

  const displayCameras = cameras?.slice(0, maxCameras) || [];

  if (displayCameras.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-slate-900 rounded-lg border-2 border-dashed border-slate-700">
        <div className="text-center">
          <p className="text-slate-400 text-lg">No cameras available</p>
          <p className="text-slate-500 text-sm mt-1">
            {hubId ? "No cameras found for this hub" : "No cameras configured"}
          </p>
        </div>
      </div>
    );
  }

  const handleExpandCamera = (camera: Camera) => {
    if (onExpandCamera) {
      onExpandCamera(camera);
    } else {
      setExpandedCamera(camera.id === expandedCamera ? null : camera.id);
    }
  };

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
      {displayCameras.map((camera) => (
        <div
          key={camera.id}
          className="aspect-video bg-slate-900 rounded-lg overflow-hidden relative group"
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
              <p className="text-slate-400 text-sm">No feed available</p>
            </div>
          )}

          {/* Overlay with controls */}
          {showControls && (
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center camera-overlay">
              <Button
                variant="ghost"
                size="icon"
                className="bg-white/20 hover:bg-white/30 text-white"
                onClick={() => handleExpandCamera(camera)}
              >
                <Expand className="w-4 h-4" />
              </Button>
            </div>
          )}

          {/* Camera info overlay */}
          <div className="absolute top-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
            {camera.name} - {camera.location}
          </div>

          {/* Status indicators */}
          <div className="absolute top-2 right-2 flex items-center space-x-1">
            <div className={`w-2 h-2 rounded-full ${getStatusColor(camera.status)}`} />
            {camera.isRecording && (
              <div className="w-2 h-2 bg-red-500 rounded-full recording-pulse" />
            )}
          </div>

          {/* Connection status */}
          {camera.status === "offline" && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <div className="text-center">
                <p className="text-red-400 font-medium">Offline</p>
                <p className="text-slate-400 text-xs">Connection lost</p>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
