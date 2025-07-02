import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { Plus, Volume2, Search, Wifi, Settings, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Speaker } from "../../../shared/schema";

const addSpeakerSchema = z.object({
  hubId: z.number(),
  name: z.string().min(1, "Speaker name is required"),
  ipAddress: z.string().min(1, "IP address is required").regex(/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/, "Invalid IP address format"),
  zone: z.string().min(1, "Zone is required"),
  volume: z.number().min(0).max(100).default(50),
  // Additional fields for advanced configuration (not stored in DB but used for setup)
  port: z.number().min(1).max(65535).default(80),
  protocol: z.enum(["http", "https", "rtsp", "sip"]).default("http"),
  username: z.string().optional(),
  password: z.string().optional(),
  maxVolume: z.number().min(0).max(100).default(100),
  audioFormat: z.enum(["mp3", "wav", "aac", "opus"]).default("mp3"),
  sampleRate: z.enum(["8000", "16000", "22050", "44100", "48000"]).default("44100"),
  channels: z.enum(["mono", "stereo"]).default("stereo"),
  emergencyOverride: z.boolean().default(true),
  scheduledAnnouncements: z.boolean().default(false),
});

type AddSpeakerForm = z.infer<typeof addSpeakerSchema>;

interface SpeakerManagementProps {
  hubId: number;
  speakers: Speaker[];
}

interface DiscoveredSpeaker {
  ip: string;
  manufacturer: string;
  model: string;
  name: string;
  protocol: string;
  port: number;
  capabilities: string[];
}

export default function SpeakerManagement({ hubId, speakers }: SpeakerManagementProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [discoveredSpeakers, setDiscoveredSpeakers] = useState<DiscoveredSpeaker[]>([]);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<AddSpeakerForm>({
    resolver: zodResolver(addSpeakerSchema),
    defaultValues: {
      hubId,
      name: "",
      ipAddress: "",
      zone: "",
      volume: 50,
      port: 80,
      protocol: "http",
      username: "",
      password: "",
      maxVolume: 100,
      audioFormat: "mp3",
      sampleRate: "44100",
      channels: "stereo",
      emergencyOverride: true,
      scheduledAnnouncements: false,
    },
  });

  const addSpeakerMutation = useMutation({
    mutationFn: async (speakerData: AddSpeakerForm) => {
      // Only send fields that match the database schema
      const dbSpeakerData = {
        hubId: speakerData.hubId,
        name: speakerData.name,
        ipAddress: speakerData.ipAddress,
        zone: speakerData.zone,
        volume: speakerData.volume,
      };
      const response = await apiRequest("POST", "/api/speakers", dbSpeakerData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/speakers"] });
      setIsOpen(false);
      form.reset();
      toast({
        title: "IP Speaker Added",
        description: "The IP speaker has been successfully configured and added to your system.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to Add Speaker",
        description: "There was an error adding the IP speaker. Please check your settings and try again.",
        variant: "destructive",
      });
    },
  });

  const deleteSpeakerMutation = useMutation({
    mutationFn: async (speakerId: number) => {
      const response = await apiRequest("DELETE", `/api/speakers/${speakerId}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/speakers"] });
      toast({
        title: "Speaker Removed",
        description: "The IP speaker has been successfully removed from your system.",
      });
    },
  });

  const discoverSpeakers = async () => {
    setIsDiscovering(true);
    try {
      // Simulate speaker discovery - in real implementation, this would scan the network
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const mockDiscovered: DiscoveredSpeaker[] = [
        {
          ip: "192.168.1.150",
          manufacturer: "Axis",
          model: "C1004-E Network Horn Speaker",
          name: "Network Horn Speaker",
          protocol: "http",
          port: 80,
          capabilities: ["Emergency Announcements", "Two-Way Audio", "PoE+"]
        },
        {
          ip: "192.168.1.151",
          manufacturer: "Bosch",
          model: "LBC 3200/00 IP Speaker",
          name: "IP Audio Speaker",
          protocol: "sip",
          port: 5060,
          capabilities: ["SIP Protocol", "High Quality Audio", "Remote Control"]
        }
      ];
      
      setDiscoveredSpeakers(mockDiscovered);
      toast({
        title: "Speaker Discovery Complete",
        description: `Found ${mockDiscovered.length} IP speakers on the network.`,
      });
    } catch (error) {
      toast({
        title: "Discovery Failed",
        description: "Failed to discover IP speakers on the network.",
        variant: "destructive",
      });
    } finally {
      setIsDiscovering(false);
    }
  };

  const addDiscoveredSpeaker = (speaker: DiscoveredSpeaker) => {
    form.setValue("name", speaker.name);
    form.setValue("ipAddress", speaker.ip);
    form.setValue("protocol", speaker.protocol as any);
    form.setValue("port", speaker.port);
    // Auto-discovered speaker - zone will be set to default
    form.setValue("zone", "Main Zone");
    setDiscoveredSpeakers([]);
  };

  const onSubmit = (data: AddSpeakerForm) => {
    addSpeakerMutation.mutate(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Add IP Speaker
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Volume2 className="w-5 h-5" />
            Add IP Speaker
          </DialogTitle>
          <DialogDescription>
            Configure a new IP speaker for audio announcements and emergency communications
          </DialogDescription>
        </DialogHeader>

        {/* Network Discovery */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Network Discovery</CardTitle>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={discoverSpeakers}
                disabled={isDiscovering}
              >
                <Search className="w-4 h-4 mr-2" />
                {isDiscovering ? "Scanning..." : "Discover Speakers"}
              </Button>
            </div>
          </CardHeader>
          {discoveredSpeakers.length > 0 && (
            <CardContent className="pt-0">
              <div className="space-y-3">
                {discoveredSpeakers.map((speaker, index) => (
                  <div key={index} className="border rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <Wifi className="w-4 h-4 text-green-600" />
                          <span className="font-medium">{speaker.name}</span>
                          <Badge variant="outline">{speaker.ip}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {speaker.manufacturer} {speaker.model} • {speaker.protocol.toUpperCase()}:{speaker.port}
                        </p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {speaker.capabilities.map((cap, capIdx) => (
                            <Badge key={capIdx} variant="secondary" className="text-xs">
                              {cap}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <Button 
                        size="sm" 
                        onClick={() => addDiscoveredSpeaker(speaker)}
                      >
                        Use
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          )}
        </Card>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Configuration */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Speaker Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Lobby Speaker" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="zone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Audio Zone</FormLabel>
                    <FormControl>
                      <Input placeholder="Main Zone" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="ipAddress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>IP Address</FormLabel>
                    <FormControl>
                      <Input placeholder="192.168.1.150" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Network Configuration */}
            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="protocol"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Protocol</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select protocol" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="http">HTTP</SelectItem>
                        <SelectItem value="https">HTTPS</SelectItem>
                        <SelectItem value="rtsp">RTSP</SelectItem>
                        <SelectItem value="sip">SIP</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="port"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Port</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="80" 
                        {...field}
                        onChange={e => field.onChange(parseInt(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="volume"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Default Volume</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="50" 
                        min="0" 
                        max="100"
                        {...field}
                        onChange={e => field.onChange(parseInt(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Advanced Settings Toggle */}
            <div className="flex items-center space-x-2">
              <Switch
                id="advanced-settings"
                checked={showAdvanced}
                onCheckedChange={setShowAdvanced}
              />
              <label htmlFor="advanced-settings" className="text-sm font-medium">
                Show Advanced Settings
              </label>
            </div>

            {showAdvanced && (
              <>
                <Separator />
                
                {/* Authentication */}
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="admin" {...field} />
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
                          <Input type="password" placeholder="••••••••" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Audio Configuration */}
                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="audioFormat"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Audio Format</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="mp3">MP3</SelectItem>
                            <SelectItem value="wav">WAV</SelectItem>
                            <SelectItem value="aac">AAC</SelectItem>
                            <SelectItem value="opus">Opus</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="sampleRate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sample Rate</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="8000">8 kHz</SelectItem>
                            <SelectItem value="16000">16 kHz</SelectItem>
                            <SelectItem value="22050">22.05 kHz</SelectItem>
                            <SelectItem value="44100">44.1 kHz</SelectItem>
                            <SelectItem value="48000">48 kHz</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="channels"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Channels</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="mono">Mono</SelectItem>
                            <SelectItem value="stereo">Stereo</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Speaker Features */}
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="emergencyOverride"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Emergency Override</FormLabel>
                          <FormDescription>
                            Allow emergency announcements to override current audio
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="scheduledAnnouncements"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Scheduled Announcements</FormLabel>
                          <FormDescription>
                            Enable scheduled and automated announcements
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </>
            )}

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={addSpeakerMutation.isPending}>
                {addSpeakerMutation.isPending ? "Adding..." : "Add Speaker"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}