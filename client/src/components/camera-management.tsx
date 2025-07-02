import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Plus, Video, Settings, Wifi, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertCameraSchema, type InsertCamera, type Camera } from "@shared/schema";
import { z } from "zod";

// Enhanced schema for camera creation with network discovery
const addCameraSchema = insertCameraSchema.extend({
  protocol: z.enum(["rtsp", "onvif", "http"]),
  port: z.number().min(1).max(65535).optional(),
  username: z.string().optional(),
  password: z.string().optional(),
  streamPath: z.string().optional(),
  onvifPort: z.number().min(1).max(65535).optional(),
  resolution: z.string().optional(),
  fps: z.number().min(1).max(60).optional(),
  codec: z.enum(["H.264", "H.265", "MJPEG"]).optional(),
  ptzCapable: z.boolean().optional(),
  audioEnabled: z.boolean().optional(),
  nightVision: z.boolean().optional(),
  motionDetection: z.boolean().optional(),
});

type AddCameraForm = z.infer<typeof addCameraSchema>;

interface CameraManagementProps {
  hubId: number;
  cameras: Camera[];
}

interface DiscoveredCamera {
  ip: string;
  manufacturer: string;
  model: string;
  name: string;
  protocol: string;
  port: number;
  capabilities: string[];
}

export default function CameraManagement({ hubId, cameras }: CameraManagementProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [discoveredCameras, setDiscoveredCameras] = useState<DiscoveredCamera[]>([]);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<AddCameraForm>({
    resolver: zodResolver(addCameraSchema),
    defaultValues: {
      hubId,
      name: "",
      location: "",
      ipAddress: "",
      protocol: "rtsp",
      port: 554,
      streamPath: "/stream",
      onvifPort: 80,
      resolution: "1920x1080",
      fps: 30,
      codec: "H.264",
      ptzCapable: false,
      audioEnabled: false,
      nightVision: false,
      motionDetection: true,
    },
  });

  const addCameraMutation = useMutation({
    mutationFn: async (data: AddCameraForm) => {
      // Generate stream URL based on protocol
      let streamUrl = "";
      if (data.protocol === "rtsp") {
        const auth = data.username && data.password ? `${data.username}:${data.password}@` : "";
        streamUrl = `rtsp://${auth}${data.ipAddress}:${data.port}${data.streamPath}`;
      } else if (data.protocol === "http") {
        streamUrl = `http://${data.ipAddress}:${data.port}${data.streamPath}`;
      }

      const cameraData = {
        ...data,
        streamUrl,
        status: "offline" as const,
        isRecording: false,
        thumbnailUrl: null,
      };

      const response = await fetch(`/api/cameras`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cameraData),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to add camera: ${response.statusText}`);
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cameras"] });
      toast({
        title: "Camera added successfully",
        description: "The camera has been added to your hub",
      });
      setIsOpen(false);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Error adding camera",
        description: error instanceof Error ? error.message : "Failed to add camera",
        variant: "destructive",
      });
    },
  });

  const discoverCameras = async () => {
    setIsDiscovering(true);
    try {
      // Mock network discovery - in real implementation this would scan the network
      const mockDiscovered: DiscoveredCamera[] = [
        {
          ip: "192.168.1.150",
          manufacturer: "Hikvision",
          model: "DS-2CD2142FWD-I",
          name: "IP Camera 1",
          protocol: "rtsp",
          port: 554,
          capabilities: ["PTZ", "Night Vision", "Audio"]
        },
        {
          ip: "192.168.1.151",
          manufacturer: "Dahua",
          model: "IPC-HDW4431C-A",
          name: "Dome Camera",
          protocol: "onvif",
          port: 80,
          capabilities: ["Night Vision", "Motion Detection"]
        },
        {
          ip: "192.168.1.152",
          manufacturer: "Axis",
          model: "M3047-P",
          name: "Panoramic Camera",
          protocol: "rtsp",
          port: 554,
          capabilities: ["360° View", "Audio", "Analytics"]
        }
      ];

      // Simulate network scan delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      setDiscoveredCameras(mockDiscovered);
      
      toast({
        title: "Network scan complete",
        description: `Found ${mockDiscovered.length} cameras on the network`,
      });
    } catch (error) {
      toast({
        title: "Discovery failed",
        description: "Failed to scan network for cameras",
        variant: "destructive",
      });
    } finally {
      setIsDiscovering(false);
    }
  };

  const addDiscoveredCamera = (discovered: DiscoveredCamera) => {
    form.setValue("name", discovered.name);
    form.setValue("ipAddress", discovered.ip);
    form.setValue("protocol", discovered.protocol as "rtsp" | "onvif" | "http");
    form.setValue("port", discovered.port);
    form.setValue("ptzCapable", discovered.capabilities.includes("PTZ"));
    form.setValue("audioEnabled", discovered.capabilities.includes("Audio"));
    form.setValue("nightVision", discovered.capabilities.includes("Night Vision"));
    form.setValue("motionDetection", discovered.capabilities.includes("Motion Detection"));
  };

  const onSubmit = (data: AddCameraForm) => {
    addCameraMutation.mutate(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>Add Camera</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Video className="w-5 h-5" />
            <span>Add New Camera</span>
          </DialogTitle>
          <DialogDescription>
            Add an IP camera to your hub via RTSP, ONVIF, or HTTP protocol
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Network Discovery */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Wifi className="w-4 h-4" />
                <span>Network Discovery</span>
              </CardTitle>
              <CardDescription>
                Scan your network for compatible IP cameras
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={discoverCameras} 
                disabled={isDiscovering}
                className="w-full mb-4"
              >
                {isDiscovering ? "Scanning Network..." : "Discover Cameras"}
              </Button>
              
              {discoveredCameras.length > 0 && (
                <div className="space-y-3">
                  {discoveredCameras.map((camera, idx) => (
                    <div key={idx} className="p-3 border rounded-lg">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium">{camera.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {camera.manufacturer} {camera.model}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {camera.ip}:{camera.port}
                          </p>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {camera.capabilities.map((cap, capIdx) => (
                              <Badge key={capIdx} variant="secondary" className="text-xs">
                                {cap}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <Button 
                          size="sm" 
                          onClick={() => addDiscoveredCamera(camera)}
                        >
                          Use
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Manual Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="w-4 h-4" />
                <span>Manual Configuration</span>
              </CardTitle>
              <CardDescription>
                Manually configure camera connection settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  {/* Basic Information */}
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Camera Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Front Door Camera" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Location</FormLabel>
                          <FormControl>
                            <Input placeholder="Main Entrance" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Network Configuration */}
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="ipAddress"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>IP Address</FormLabel>
                          <FormControl>
                            <Input placeholder="192.168.1.100" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="protocol"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Protocol</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="rtsp">RTSP</SelectItem>
                              <SelectItem value="onvif">ONVIF</SelectItem>
                              <SelectItem value="http">HTTP</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="port"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Port</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              {...field} 
                              onChange={(e) => field.onChange(parseInt(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="streamPath"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Stream Path</FormLabel>
                          <FormControl>
                            <Input placeholder="/stream" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Authentication */}
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Username (Optional)</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password (Optional)</FormLabel>
                          <FormControl>
                            <Input type="password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Advanced Settings */}
                  <div className="flex items-center space-x-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowAdvanced(!showAdvanced)}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      {showAdvanced ? "Hide" : "Show"} Advanced Settings
                    </Button>
                  </div>

                  {showAdvanced && (
                    <>
                      <Separator />
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="resolution"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Resolution</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="1920x1080">1920x1080 (1080p)</SelectItem>
                                  <SelectItem value="1280x720">1280x720 (720p)</SelectItem>
                                  <SelectItem value="3840x2160">3840x2160 (4K)</SelectItem>
                                  <SelectItem value="2560x1440">2560x1440 (1440p)</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="fps"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Frame Rate (FPS)</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  min="1" 
                                  max="60" 
                                  {...field}
                                  onChange={(e) => field.onChange(parseInt(e.target.value))}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="codec"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Video Codec</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="H.264">H.264</SelectItem>
                                <SelectItem value="H.265">H.265 (HEVC)</SelectItem>
                                <SelectItem value="MJPEG">MJPEG</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Capabilities */}
                      <div className="space-y-3">
                        <Label>Camera Capabilities</Label>
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="ptzCapable"
                            render={({ field }) => (
                              <FormItem className="flex items-center space-x-2">
                                <FormControl>
                                  <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                                <FormLabel>PTZ (Pan/Tilt/Zoom)</FormLabel>
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="audioEnabled"
                            render={({ field }) => (
                              <FormItem className="flex items-center space-x-2">
                                <FormControl>
                                  <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                                <FormLabel>Audio Recording</FormLabel>
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="nightVision"
                            render={({ field }) => (
                              <FormItem className="flex items-center space-x-2">
                                <FormControl>
                                  <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                                <FormLabel>Night Vision</FormLabel>
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="motionDetection"
                            render={({ field }) => (
                              <FormItem className="flex items-center space-x-2">
                                <FormControl>
                                  <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                                <FormLabel>Motion Detection</FormLabel>
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    </>
                  )}

                  <div className="flex justify-end space-x-2 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={addCameraMutation.isPending}
                    >
                      {addCameraMutation.isPending ? "Adding..." : "Add Camera"}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}