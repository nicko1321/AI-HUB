import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { 
  Move3D, 
  ZoomIn, 
  ZoomOut, 
  ArrowUp, 
  ArrowDown, 
  ArrowLeft, 
  ArrowRight,
  Home,
  Bookmark,
  Settings2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Camera } from "@shared/schema";

interface PTZLiveControlProps {
  camera: Camera;
  size?: "sm" | "md" | "lg";
  variant?: "overlay" | "inline";
}

interface PTZPreset {
  id: number;
  name: string;
  pan: number;
  tilt: number;
  zoom: number;
}

export default function PTZLiveControl({ 
  camera, 
  size = "md", 
  variant = "overlay" 
}: PTZLiveControlProps) {
  const [currentPosition, setCurrentPosition] = useState({ pan: 0, tilt: 0, zoom: 1 });
  const [speed, setSpeed] = useState([75]);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [presets] = useState<PTZPreset[]>([
    { id: 1, name: "Home", pan: 0, tilt: 0, zoom: 1 },
    { id: 2, name: "Entry", pan: 45, tilt: -10, zoom: 2 },
    { id: 3, name: "Wide", pan: 0, tilt: -20, zoom: 0.8 },
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
    },
    onError: (error) => {
      toast({
        title: "PTZ Error",
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

  if (!camera.ptzCapable) {
    return null;
  }

  const iconSize = size === "sm" ? "w-3 h-3" : size === "md" ? "w-4 h-4" : "w-5 h-5";
  const buttonSize = size === "sm" ? "icon" : size === "md" ? "sm" : "default";

  const QuickControls = () => (
    <div className="flex flex-col items-center space-y-1">
      {/* Pan/Tilt Controls */}
      <div className="grid grid-cols-3 gap-1">
        <div></div>
        <Button
          variant="outline"
          size={buttonSize}
          onClick={() => handleMove('up')}
          disabled={ptzMutation.isPending}
          className="border-slate-600 bg-black/50 backdrop-blur-sm"
        >
          <ArrowUp className={iconSize} />
        </Button>
        <div></div>
        <Button
          variant="outline"
          size={buttonSize}
          onClick={() => handleMove('left')}
          disabled={ptzMutation.isPending}
          className="border-slate-600 bg-black/50 backdrop-blur-sm"
        >
          <ArrowLeft className={iconSize} />
        </Button>
        <Button
          variant="outline"
          size={buttonSize}
          onClick={handleHome}
          disabled={ptzMutation.isPending}
          className="border-slate-600 bg-black/50 backdrop-blur-sm"
        >
          <Home className={iconSize} />
        </Button>
        <Button
          variant="outline"
          size={buttonSize}
          onClick={() => handleMove('right')}
          disabled={ptzMutation.isPending}
          className="border-slate-600 bg-black/50 backdrop-blur-sm"
        >
          <ArrowRight className={iconSize} />
        </Button>
        <div></div>
        <Button
          variant="outline"
          size={buttonSize}
          onClick={() => handleMove('down')}
          disabled={ptzMutation.isPending}
          className="border-slate-600 bg-black/50 backdrop-blur-sm"
        >
          <ArrowDown className={iconSize} />
        </Button>
        <div></div>
      </div>

      {/* Zoom Controls */}
      <div className="flex items-center space-x-1">
        <Button
          variant="outline"
          size={buttonSize}
          onClick={() => handleZoom('out')}
          disabled={ptzMutation.isPending}
          className="border-slate-600 bg-black/50 backdrop-blur-sm"
        >
          <ZoomOut className={iconSize} />
        </Button>
        <Button
          variant="outline"
          size={buttonSize}
          onClick={() => handleZoom('in')}
          disabled={ptzMutation.isPending}
          className="border-slate-600 bg-black/50 backdrop-blur-sm"
        >
          <ZoomIn className={iconSize} />
        </Button>
      </div>
    </div>
  );

  if (variant === "inline") {
    return (
      <div className="space-y-4">
        <QuickControls />
        
        {/* Advanced Controls */}
        <Popover open={showAdvanced} onOpenChange={setShowAdvanced}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="w-full">
              <Settings2 className="w-4 h-4 mr-2" />
              Advanced PTZ
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="space-y-4">
              {/* Speed Control */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Speed</label>
                <Slider
                  value={speed}
                  onValueChange={setSpeed}
                  max={100}
                  min={1}
                  step={1}
                  className="w-full"
                />
                <div className="text-xs text-center text-slate-400">{speed[0]}%</div>
              </div>
              
              {/* Presets */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Presets</label>
                <div className="grid grid-cols-2 gap-2">
                  {presets.map((preset) => (
                    <Button
                      key={preset.id}
                      variant="outline"
                      size="sm"
                      onClick={() => handlePreset(preset)}
                      disabled={ptzMutation.isPending}
                      className="text-xs"
                    >
                      {preset.name}
                    </Button>
                  ))}
                </div>
              </div>
              
              {/* Position Display */}
              <div className="grid grid-cols-3 gap-2 text-xs text-center">
                <div>
                  <div className="text-slate-400">Pan</div>
                  <div className="font-mono">{currentPosition.pan}°</div>
                </div>
                <div>
                  <div className="text-slate-400">Tilt</div>
                  <div className="font-mono">{currentPosition.tilt}°</div>
                </div>
                <div>
                  <div className="text-slate-400">Zoom</div>
                  <div className="font-mono">{currentPosition.zoom.toFixed(1)}x</div>
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    );
  }

  // Overlay variant for camera grid
  return (
    <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size={buttonSize}
            className="border-slate-600 bg-black/70 backdrop-blur-sm text-white hover:bg-black/80"
          >
            <Move3D className={iconSize} />
          </Button>
        </PopoverTrigger>
        <PopoverContent side="left" className="w-64">
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Move3D className="w-4 h-4" />
              <span className="font-medium text-sm">PTZ Control</span>
              <Badge variant="secondary" className="text-xs">Live</Badge>
            </div>
            
            <QuickControls />
            
            {/* Speed Slider */}
            <div className="space-y-2">
              <label className="text-xs text-slate-400">Speed: {speed[0]}%</label>
              <Slider
                value={speed}
                onValueChange={setSpeed}
                max={100}
                min={1}
                step={1}
                className="w-full"
              />
            </div>
            
            {/* Quick Presets */}
            <div className="grid grid-cols-3 gap-1">
              {presets.map((preset) => (
                <Button
                  key={preset.id}
                  variant="outline"
                  size="sm"
                  onClick={() => handlePreset(preset)}
                  disabled={ptzMutation.isPending}
                  className="text-xs"
                >
                  {preset.name}
                </Button>
              ))}
            </div>
            
            {/* Position Info */}
            <div className="grid grid-cols-3 gap-2 text-xs text-center bg-slate-100 dark:bg-slate-800 rounded p-2">
              <div>
                <div className="text-slate-500">Pan</div>
                <div className="font-mono text-slate-900 dark:text-slate-100">{currentPosition.pan}°</div>
              </div>
              <div>
                <div className="text-slate-500">Tilt</div>
                <div className="font-mono text-slate-900 dark:text-slate-100">{currentPosition.tilt}°</div>
              </div>
              <div>
                <div className="text-slate-500">Zoom</div>
                <div className="font-mono text-slate-900 dark:text-slate-100">{currentPosition.zoom.toFixed(1)}x</div>
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}