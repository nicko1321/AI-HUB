import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Move3D, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  RotateCw, 
  ArrowUp, 
  ArrowDown, 
  ArrowLeft, 
  ArrowRight,
  Home,
  Bookmark,
  Play,
  Square,
  Settings
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Camera } from "@shared/schema";

interface PTZControlProps {
  camera: Camera;
}

interface PTZPreset {
  id: number;
  name: string;
  pan: number;
  tilt: number;
  zoom: number;
}

export default function PTZControl({ camera }: PTZControlProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentPosition, setCurrentPosition] = useState({ pan: 0, tilt: 0, zoom: 1 });
  const [speed, setSpeed] = useState([50]);
  const [presets] = useState<PTZPreset[]>([
    { id: 1, name: "Home", pan: 0, tilt: 0, zoom: 1 },
    { id: 2, name: "Entrance", pan: 45, tilt: -10, zoom: 2 },
    { id: 3, name: "Parking", pan: -30, tilt: -5, zoom: 1.5 },
    { id: 4, name: "Overview", pan: 0, tilt: -20, zoom: 0.8 },
  ]);
  const { toast } = useToast();

  const ptzMutation = useMutation({
    mutationFn: async (command: { action: string; value?: number; direction?: string }) => {
      const response = await fetch(`/api/cameras/${camera.id}/ptz`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(command),
      });
      
      if (!response.ok) {
        throw new Error(`PTZ command failed: ${response.statusText}`);
      }
      
      return response.json();
    },
    onSuccess: (data, variables) => {
      if (variables.action === 'move') {
        // Update current position based on movement
        setCurrentPosition(prev => ({
          ...prev,
          pan: Math.max(-180, Math.min(180, prev.pan + (variables.direction === 'left' ? -5 : variables.direction === 'right' ? 5 : 0))),
          tilt: Math.max(-90, Math.min(90, prev.tilt + (variables.direction === 'up' ? 5 : variables.direction === 'down' ? -5 : 0)))
        }));
      } else if (variables.action === 'zoom') {
        setCurrentPosition(prev => ({
          ...prev,
          zoom: Math.max(0.1, Math.min(10, prev.zoom + (variables.direction === 'in' ? 0.2 : -0.2)))
        }));
      }
      
      toast({
        title: "PTZ Command Sent",
        description: `${variables.action} command executed successfully`,
      });
    },
    onError: (error) => {
      toast({
        title: "PTZ Control Error",
        description: error instanceof Error ? error.message : "Failed to control camera",
        variant: "destructive",
      });
    },
  });

  const handleMove = (direction: 'up' | 'down' | 'left' | 'right') => {
    ptzMutation.mutate({
      action: 'move',
      direction,
      value: speed[0]
    });
  };

  const handleZoom = (direction: 'in' | 'out') => {
    ptzMutation.mutate({
      action: 'zoom',
      direction,
      value: speed[0]
    });
  };

  const handlePreset = (preset: PTZPreset) => {
    ptzMutation.mutate({
      action: 'preset',
      value: preset.id
    });
    setCurrentPosition({
      pan: preset.pan,
      tilt: preset.tilt,
      zoom: preset.zoom
    });
  };

  const handleHome = () => {
    ptzMutation.mutate({ action: 'home' });
    setCurrentPosition({ pan: 0, tilt: 0, zoom: 1 });
  };

  const handlePatrol = (action: 'start' | 'stop') => {
    ptzMutation.mutate({ action: 'patrol', value: action === 'start' ? 1 : 0 });
  };

  if (!camera.ptzCapable) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="border-slate-600 text-slate-300 hover:text-white">
          <Move3D className="w-4 h-4 mr-1" />
          PTZ
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Move3D className="w-5 h-5" />
            <span>PTZ Control - {camera.name}</span>
          </DialogTitle>
          <DialogDescription>
            Control pan, tilt, and zoom functions for this camera
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* PTZ Controls */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Manual Control</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Direction Controls */}
              <div className="flex flex-col items-center space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleMove('up')}
                  disabled={ptzMutation.isPending}
                  className="border-slate-600"
                >
                  <ArrowUp className="w-4 h-4" />
                </Button>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleMove('left')}
                    disabled={ptzMutation.isPending}
                    className="border-slate-600"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleHome}
                    disabled={ptzMutation.isPending}
                    className="border-slate-600"
                  >
                    <Home className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleMove('right')}
                    disabled={ptzMutation.isPending}
                    className="border-slate-600"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleMove('down')}
                  disabled={ptzMutation.isPending}
                  className="border-slate-600"
                >
                  <ArrowDown className="w-4 h-4" />
                </Button>
              </div>

              {/* Zoom Controls */}
              <div className="flex items-center justify-center space-x-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleZoom('out')}
                  disabled={ptzMutation.isPending}
                  className="border-slate-600"
                >
                  <ZoomOut className="w-4 h-4 mr-1" />
                  Zoom Out
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleZoom('in')}
                  disabled={ptzMutation.isPending}
                  className="border-slate-600"
                >
                  <ZoomIn className="w-4 h-4 mr-1" />
                  Zoom In
                </Button>
              </div>

              {/* Speed Control */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Movement Speed</label>
                <Slider
                  value={speed}
                  onValueChange={setSpeed}
                  max={100}
                  min={1}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Slow</span>
                  <span>{speed[0]}%</span>
                  <span>Fast</span>
                </div>
              </div>

              {/* Patrol Controls */}
              <div className="flex items-center justify-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePatrol('start')}
                  disabled={ptzMutation.isPending}
                  className="border-slate-600"
                >
                  <Play className="w-4 h-4 mr-1" />
                  Start Patrol
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePatrol('stop')}
                  disabled={ptzMutation.isPending}
                  className="border-slate-600"
                >
                  <Square className="w-4 h-4 mr-1" />
                  Stop Patrol
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Status and Presets */}
          <div className="space-y-4">
            {/* Current Position */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Current Position</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-xs text-slate-400">Pan</div>
                    <div className="text-lg font-mono">{currentPosition.pan}°</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-400">Tilt</div>
                    <div className="text-lg font-mono">{currentPosition.tilt}°</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-400">Zoom</div>
                    <div className="text-lg font-mono">{currentPosition.zoom.toFixed(1)}x</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Presets */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center">
                  <Bookmark className="w-4 h-4 mr-2" />
                  Position Presets
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  {presets.map((preset) => (
                    <Button
                      key={preset.id}
                      variant="outline"
                      size="sm"
                      onClick={() => handlePreset(preset)}
                      disabled={ptzMutation.isPending}
                      className="border-slate-600 text-left justify-start"
                    >
                      <div>
                        <div className="font-medium">{preset.name}</div>
                        <div className="text-xs text-slate-400">
                          {preset.pan}°, {preset.tilt}°, {preset.zoom}x
                        </div>
                      </div>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Camera Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Camera Capabilities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary" className="text-xs">PTZ Enabled</Badge>
                  <Badge variant="secondary" className="text-xs">360° Pan</Badge>
                  <Badge variant="secondary" className="text-xs">90° Tilt</Badge>
                  <Badge variant="secondary" className="text-xs">10x Zoom</Badge>
                  <Badge variant="secondary" className="text-xs">Preset Storage</Badge>
                  <Badge variant="secondary" className="text-xs">Auto Patrol</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex items-center space-x-2 text-sm text-slate-400">
            <Settings className="w-4 h-4" />
            <span>Connected via {camera.protocol?.toUpperCase()} at {camera.ipAddress}:{camera.port}</span>
          </div>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}