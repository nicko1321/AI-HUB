import { useEvents, useAcknowledgeEvent, useSpeakers, useUpdateSpeaker } from "@/hooks/use-hub-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatTimestamp, getSeverityColor } from "@/lib/utils";
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  Eye, 
  AlertTriangle, 
  Shield, 
  Camera,
  Clock,
  CheckCircle,
  User,
  Car,
  Monitor,
  Mic,
  MicOff,
  Radio,
  Send
} from "lucide-react";
import { useState, useContext } from "react";
import { HubContext } from "@/components/hub-selector";
import type { Event, Speaker as SpeakerType } from "../../../shared/schema";

// IP Speaker Control Component
function IPSpeakerControl({ hubId }: { hubId: number | null }) {
  const { data: speakers = [] } = useSpeakers(hubId || undefined);
  const updateSpeaker = useUpdateSpeaker();
  const [selectedSpeaker, setSelectedSpeaker] = useState<SpeakerType | null>(null);
  const [message, setMessage] = useState("");
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [messageType, setMessageType] = useState("custom");

  // Pre-defined emergency messages
  const emergencyMessages = {
    evacuation: "Attention: Please evacuate the building immediately via the nearest exit. This is not a drill.",
    lockdown: "Security alert: Building is in lockdown. Please remain in your current location until further notice.",
    all_clear: "All clear: The security situation has been resolved. Normal operations may resume.",
    suspicious: "Security notice: Suspicious activity has been detected. Please remain alert and report any unusual behavior.",
    medical: "Medical emergency in progress. Emergency personnel are responding. Please clear the area.",
    fire: "Fire alarm activated. Please evacuate immediately using the nearest exit. Do not use elevators."
  };

  const activeSpeakers = speakers.filter(speaker => speaker.status === 'online');
  
  const handleBroadcast = async () => {
    if (!selectedSpeaker || !message.trim()) return;
    
    setIsBroadcasting(true);
    try {
      // Simulate broadcasting by activating the speaker
      await updateSpeaker.mutateAsync({
        id: selectedSpeaker.id,
        updates: { isActive: true, volume: 80 }
      });
      
      // Simulate broadcast duration
      setTimeout(async () => {
        await updateSpeaker.mutateAsync({
          id: selectedSpeaker.id,
          updates: { isActive: false }
        });
        setIsBroadcasting(false);
        setMessage("");
      }, 3000);
    } catch (error) {
      console.error('Broadcast failed:', error);
      setIsBroadcasting(false);
    }
  };

  const handleEmergencyMessage = (type: string) => {
    setMessage(emergencyMessages[type as keyof typeof emergencyMessages]);
    setMessageType(type);
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Volume2 className="h-4 w-4" />
          IP Speaker Control
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Speaker Selection */}
        <div>
          <label className="text-xs font-medium mb-1 block">Select Speaker</label>
          <Select 
            value={selectedSpeaker?.id.toString() || ""} 
            onValueChange={(value) => {
              const speaker = speakers.find(s => s.id === parseInt(value));
              setSelectedSpeaker(speaker || null);
            }}
          >
            <SelectTrigger className="h-8">
              <SelectValue placeholder="Choose speaker..." />
            </SelectTrigger>
            <SelectContent>
              {activeSpeakers.map((speaker) => (
                <SelectItem key={speaker.id} value={speaker.id.toString()}>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                    {speaker.name} ({speaker.zone})
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Quick Emergency Messages */}
        <div>
          <label className="text-xs font-medium mb-1 block">Quick Actions</label>
          <div className="grid grid-cols-2 gap-1">
            <Button 
              size="sm" 
              variant="outline" 
              className="h-7 text-xs"
              onClick={() => handleEmergencyMessage('evacuation')}
            >
              Evacuate
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              className="h-7 text-xs"
              onClick={() => handleEmergencyMessage('lockdown')}
            >
              Lockdown
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              className="h-7 text-xs"
              onClick={() => handleEmergencyMessage('all_clear')}
            >
              All Clear
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              className="h-7 text-xs"
              onClick={() => handleEmergencyMessage('suspicious')}
            >
              Alert
            </Button>
          </div>
        </div>

        {/* Custom Message */}
        <div>
          <label className="text-xs font-medium mb-1 block">Custom Message</label>
          <Textarea
            placeholder="Enter custom announcement..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="h-16 text-xs resize-none"
          />
        </div>

        {/* Broadcast Button */}
        <Button 
          className="w-full" 
          size="sm"
          disabled={!selectedSpeaker || !message.trim() || isBroadcasting}
          onClick={handleBroadcast}
        >
          {isBroadcasting ? (
            <>
              <Radio className="h-4 w-4 mr-2 animate-pulse" />
              Broadcasting...
            </>
          ) : (
            <>
              <Send className="h-4 w-4 mr-2" />
              Broadcast Message
            </>
          )}
        </Button>

        {/* Speaker Status */}
        {selectedSpeaker && (
          <div className="border-t pt-2">
            <div className="text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status:</span>
                <span className={selectedSpeaker.status === 'online' ? 'text-green-600' : 'text-red-600'}>
                  {selectedSpeaker.status}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Volume:</span>
                <span>{selectedSpeaker.volume}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Zone:</span>
                <span>{selectedSpeaker.zone}</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Simulated video component for event clips
function EventVideoClip({ event }: { event: Event }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  return (
    <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
      {/* Video placeholder with event-specific overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
        <div className="text-center text-white">
          <Play className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p className="text-sm opacity-75">Event Clip</p>
          <p className="text-xs opacity-50">{formatTimestamp(event.timestamp)}</p>
        </div>
      </div>
      
      {/* Event overlay information */}
      <div className="absolute top-2 left-2 right-2">
        <div className="flex justify-between items-start">
          <Badge className={getSeverityColor(event.severity)}>
            {event.severity.toUpperCase()}
          </Badge>
          <div className="text-white text-xs bg-black/50 px-2 py-1 rounded">
            {event.type === 'person_detection' && <User className="h-3 w-3 inline mr-1" />}
            {event.type === 'weapon_detection' && <AlertTriangle className="h-3 w-3 inline mr-1" />}
            {event.type === 'license_plate' && <Car className="h-3 w-3 inline mr-1" />}
            {event.type === 'suspicious_behavior' && <Eye className="h-3 w-3 inline mr-1" />}
            Camera {event.cameraId}
          </div>
        </div>
      </div>

      {/* Video controls */}
      <div className="absolute bottom-2 left-2 right-2">
        <div className="flex justify-between items-center">
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setIsPlaying(!isPlaying)}
              className="h-8 w-8 p-0"
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setIsMuted(!isMuted)}
              className="h-8 w-8 p-0"
            >
              {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </Button>
          </div>
          <Button
            size="sm"
            variant="secondary"
            className="h-8 w-8 p-0"
          >
            <Maximize className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

// Live camera feed component
function LiveCameraFeed({ cameraId }: { cameraId: number | null }) {
  const [isOnline, setIsOnline] = useState(true);

  if (!cameraId) {
    return (
      <div className="relative bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden aspect-video flex items-center justify-center">
        <div className="text-center text-gray-500">
          <Camera className="h-12 w-12 mx-auto mb-2" />
          <p className="text-sm">No Camera Selected</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
      {/* Live feed placeholder */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900 to-black flex items-center justify-center">
        <div className="text-center text-white">
          <div className="flex items-center justify-center mb-2">
            <div className="h-3 w-3 bg-red-500 rounded-full animate-pulse mr-2"></div>
            <span className="text-sm font-medium">LIVE</span>
          </div>
          <Camera className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p className="text-sm opacity-75">Camera {cameraId}</p>
        </div>
      </div>
      
      {/* Live feed overlay */}
      <div className="absolute top-2 left-2 right-2">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-white text-xs font-medium bg-red-600 px-2 py-1 rounded">
              LIVE
            </span>
          </div>
          <div className="text-white text-xs bg-black/50 px-2 py-1 rounded">
            {isOnline ? "Online" : "Offline"}
          </div>
        </div>
      </div>

      {/* Live feed controls */}
      <div className="absolute bottom-2 right-2">
        <Button
          size="sm"
          variant="secondary"
          className="h-8 w-8 p-0"
        >
          <Maximize className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

// Event details component
function EventDetails({ event, onAcknowledge }: { event: Event; onAcknowledge: (event: Event) => void }) {
  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{event.title}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {formatTimestamp(event.timestamp)}
            </p>
          </div>
          <Badge className={getSeverityColor(event.severity)}>
            {event.severity.toUpperCase()}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm">{event.description}</p>
        
        {/* Event metadata */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Event Details</h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-muted-foreground">Type:</span>
              <span className="ml-2 font-medium">{event.type.replace('_', ' ')}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Hub:</span>
              <span className="ml-2 font-medium">Hub-{event.hubId.toString().padStart(2, '0')}</span>
            </div>
            {event.cameraId && (
              <div>
                <span className="text-muted-foreground">Camera:</span>
                <span className="ml-2 font-medium">Camera {event.cameraId}</span>
              </div>
            )}
            {event.licensePlate && (
              <div className="col-span-2">
                <span className="text-muted-foreground">License Plate:</span>
                <span className="ml-2 font-mono font-bold text-blue-600 dark:text-blue-400">
                  {event.licensePlate}
                </span>
                {event.licensePlateConfidence && (
                  <span className="ml-1 text-xs text-muted-foreground">
                    ({Math.round(event.licensePlateConfidence * 100)}%)
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Metadata from AI analysis */}
        {event.metadata && typeof event.metadata === 'object' && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">AI Analysis</h4>
            <div className="text-xs space-y-1">
              {Object.entries(event.metadata as Record<string, any>).map(([key, value]) => (
                <div key={key} className="flex justify-between">
                  <span className="text-muted-foreground capitalize">
                    {key.replace('_', ' ')}:
                  </span>
                  <span className="font-medium">
                    {typeof value === 'number' && key.includes('confidence') 
                      ? `${Math.round(value * 100)}%`
                      : String(value)
                    }
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-2 pt-2">
          {!event.acknowledged && (
            <Button 
              size="sm" 
              onClick={() => onAcknowledge(event)}
              className="flex-1"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Acknowledge
            </Button>
          )}
          <Button size="sm" variant="outline" className="flex-1">
            <Eye className="h-4 w-4 mr-2" />
            View Full
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function MonitoringPortal() {
  const { selectedHubId } = useContext(HubContext);
  const { data: events = [], isLoading } = useEvents(selectedHubId || undefined);
  const acknowledgeMutation = useAcknowledgeEvent();
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  // Get unacknowledged events for priority monitoring
  const unacknowledgedEvents = events.filter(event => !event.acknowledged);
  const criticalEvents = events.filter(event => event.severity === 'critical' && !event.acknowledged);
  const highPriorityEvents = events.filter(event => (event.severity === 'high' || event.severity === 'critical') && !event.acknowledged);

  const handleAcknowledge = async (event: Event) => {
    try {
      await acknowledgeMutation.mutateAsync(event.id);
      if (selectedEvent?.id === event.id) {
        setSelectedEvent({ ...event, acknowledged: true });
      }
    } catch (error) {
      console.error('Failed to acknowledge event:', error);
    }
  };

  // Auto-select first unacknowledged critical event if nothing selected
  if (!selectedEvent && criticalEvents.length > 0) {
    setSelectedEvent(criticalEvents[0]);
  } else if (!selectedEvent && highPriorityEvents.length > 0) {
    setSelectedEvent(highPriorityEvents[0]);
  } else if (!selectedEvent && unacknowledgedEvents.length > 0) {
    setSelectedEvent(unacknowledgedEvents[0]);
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Shield className="h-12 w-12 mx-auto mb-4 text-muted-foreground animate-pulse" />
          <p className="text-muted-foreground">Loading monitoring portal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with real-time status */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Security Monitoring Portal</h1>
          <div className="flex items-center gap-4 mt-1">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-muted-foreground">Live Monitoring</span>
            </div>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              <span className="text-sm font-medium text-red-600 dark:text-red-400">
                {unacknowledgedEvents.length} Active Alerts
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            <Clock className="h-3 w-3 mr-1" />
            Live
          </Badge>
          {selectedHubId && (
            <Badge variant="secondary">
              Hub-{selectedHubId.toString().padStart(2, '0')}
            </Badge>
          )}
        </div>
      </div>

      {/* Main monitoring interface - everything visible at once */}
      <div className="grid grid-cols-12 gap-4 min-h-[800px]">
        {/* Left: Event List (3 columns) */}
        <Card className="col-span-3">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center justify-between">
              Active Events
              <Badge variant="destructive" className="text-xs">
                {unacknowledgedEvents.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[720px]">
              <div className="space-y-1 p-3">
                {unacknowledgedEvents.length === 0 ? (
                  <div className="text-center py-8">
                    <Shield className="h-8 w-8 mx-auto mb-2 text-green-500" />
                    <p className="text-sm text-muted-foreground">All Clear</p>
                  </div>
                ) : (
                  unacknowledgedEvents.map((event) => (
                    <div
                      key={event.id}
                      className={`p-2 rounded-md border cursor-pointer transition-all hover:shadow-sm ${
                        selectedEvent?.id === event.id
                          ? 'bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800'
                          : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                      }`}
                      onClick={() => setSelectedEvent(event)}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <Badge className={`${getSeverityColor(event.severity)} text-xs`}>
                          {event.severity}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatTimestamp(event.timestamp).split(' ')[1]}
                        </span>
                      </div>
                      <h4 className="text-sm font-medium mb-1 line-clamp-2">{event.title}</h4>
                      <p className="text-xs text-muted-foreground mb-1 line-clamp-1">
                        {event.description}
                      </p>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-muted-foreground">Cam {event.cameraId}</span>
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="h-6 text-xs px-2"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAcknowledge(event);
                          }}
                        >
                          ACK
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Center: Video Feeds (6 columns) */}
        <div className="col-span-6 space-y-4">
          {selectedEvent ? (
            <>
              {/* Event clip and live feed side by side */}
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Event Recording</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <EventVideoClip event={selectedEvent} />
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Live Feed</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <LiveCameraFeed cameraId={selectedEvent.cameraId} />
                  </CardContent>
                </Card>
              </div>

              {/* Multiple camera grid for context */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Hub Camera Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-2">
                    {[1, 2, 3, 4, 5, 6].map((camId) => (
                      <div key={camId} className="relative bg-black rounded aspect-video">
                        <div className="absolute inset-0 bg-gradient-to-br from-gray-700 to-black flex items-center justify-center">
                          <div className="text-center text-white">
                            <Camera className="h-4 w-4 mx-auto mb-1 opacity-50" />
                            <span className="text-xs opacity-75">Cam {camId}</span>
                          </div>
                        </div>
                        {selectedEvent.cameraId === camId && (
                          <div className="absolute top-1 left-1">
                            <div className="h-2 w-2 bg-red-500 rounded-full animate-pulse"></div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card className="h-full">
              <CardContent className="flex items-center justify-center h-full">
                <div className="text-center">
                  <Monitor className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium mb-2">No Active Events</h3>
                  <p className="text-muted-foreground">System monitoring - all cameras operational</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right: Event Details & Quick Actions (3 columns) */}
        <div className="col-span-3 space-y-4">
          {selectedEvent ? (
            <>
              <EventDetails event={selectedEvent} onAcknowledge={handleAcknowledge} />
              
              {/* IP Speaker Control */}
              <IPSpeakerControl hubId={selectedHubId} />
              
              {/* Quick Actions */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button className="w-full" size="sm">
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Dispatch Security
                  </Button>
                  <Button variant="outline" className="w-full" size="sm">
                    <Eye className="h-4 w-4 mr-2" />
                    Track Object
                  </Button>
                  <Button variant="outline" className="w-full" size="sm">
                    <Car className="h-4 w-4 mr-2" />
                    Add to Watch List
                  </Button>
                </CardContent>
              </Card>

              {/* Recent Events Summary */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {events.slice(0, 5).map((event) => (
                      <div key={event.id} className="flex justify-between items-center text-xs">
                        <div className="flex items-center gap-2">
                          <div className={`h-2 w-2 rounded-full ${
                            event.acknowledged ? 'bg-gray-400' : getSeverityColor(event.severity).includes('red') ? 'bg-red-500' : 
                            getSeverityColor(event.severity).includes('yellow') ? 'bg-yellow-500' : 'bg-blue-500'
                          }`}></div>
                          <span className="truncate">{event.title}</span>
                        </div>
                        <span className="text-muted-foreground">
                          {formatTimestamp(event.timestamp).split(' ')[1]}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center h-32">
                <div className="text-center">
                  <Shield className="h-8 w-8 mx-auto mb-2 text-green-500" />
                  <p className="text-sm text-muted-foreground">System Status: Normal</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}