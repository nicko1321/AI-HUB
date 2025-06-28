import { useEvents, useAcknowledgeEvent } from "@/hooks/use-hub-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
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
  Car
} from "lucide-react";
import { useState, useContext } from "react";
import { HubContext } from "@/components/hub-selector";
import type { Event } from "../../../shared/schema";

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
  const { selectedHub } = useContext(HubContext);
  const { data: events = [], isLoading } = useEvents(selectedHub?.id);
  const acknowledgeMutation = useAcknowledgeEvent();
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  // Get unacknowledged events for priority monitoring
  const unacknowledgedEvents = events.filter(event => !event.acknowledged);
  const recentEvents = events.slice(0, 10);

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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Monitoring Portal</h1>
          <p className="text-muted-foreground">
            Real-time event monitoring with video clips and live feeds
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            <Clock className="h-3 w-3 mr-1" />
            Live
          </Badge>
          {selectedHub && (
            <Badge variant="secondary">
              {selectedHub.name}
            </Badge>
          )}
        </div>
      </div>

      <Tabs defaultValue="active" className="space-y-4">
        <TabsList>
          <TabsTrigger value="active">
            Active Events ({unacknowledgedEvents.length})
          </TabsTrigger>
          <TabsTrigger value="recent">
            Recent Events
          </TabsTrigger>
          <TabsTrigger value="all">
            All Events
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          {unacknowledgedEvents.length === 0 ? (
            <Card className="p-8">
              <div className="text-center">
                <Shield className="h-12 w-12 mx-auto mb-4 text-green-500" />
                <h3 className="text-lg font-medium mb-2">All Clear</h3>
                <p className="text-muted-foreground">No active events requiring attention</p>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Event list */}
              <Card className="lg:col-span-1">
                <CardHeader>
                  <CardTitle className="text-lg">Active Events</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <ScrollArea className="h-[600px]">
                    <div className="space-y-2 p-4">
                      {unacknowledgedEvents.map((event) => (
                        <div
                          key={event.id}
                          className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                            selectedEvent?.id === event.id
                              ? 'bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800'
                              : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                          }`}
                          onClick={() => setSelectedEvent(event)}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="text-sm font-medium truncate">{event.title}</h4>
                            <Badge className={`${getSeverityColor(event.severity)} text-xs`}>
                              {event.severity}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                            {event.description}
                          </p>
                          <div className="flex justify-between items-center text-xs text-muted-foreground">
                            <span>{formatTimestamp(event.timestamp)}</span>
                            <span>Camera {event.cameraId}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

              {/* Video and live feed */}
              {selectedEvent && (
                <div className="lg:col-span-2 space-y-4">
                  {/* Video clips and live feed */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-medium mb-2">Event Clip</h3>
                      <EventVideoClip event={selectedEvent} />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium mb-2">Live Camera Feed</h3>
                      <LiveCameraFeed cameraId={selectedEvent.cameraId} />
                    </div>
                  </div>

                  {/* Event details */}
                  <EventDetails event={selectedEvent} onAcknowledge={handleAcknowledge} />
                </div>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="recent">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {recentEvents.map((event) => (
              <Card key={event.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <h3 className="text-sm font-medium truncate">{event.title}</h3>
                    <Badge className={getSeverityColor(event.severity)}>
                      {event.severity}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="aspect-video bg-black rounded mb-3 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-black flex items-center justify-center">
                      <Play className="h-8 w-8 text-white opacity-50" />
                    </div>
                    <div className="absolute bottom-2 left-2 text-white text-xs bg-black/50 px-2 py-1 rounded">
                      {formatTimestamp(event.timestamp)}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                    {event.description}
                  </p>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground">Camera {event.cameraId}</span>
                    {event.acknowledged ? (
                      <Badge variant="outline" className="text-xs">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Acknowledged
                      </Badge>
                    ) : (
                      <Button size="sm" onClick={() => handleAcknowledge(event)}>
                        Acknowledge
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="all">
          <div className="space-y-4">
            {events.map((event) => (
              <Card key={event.id}>
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-16 bg-black rounded flex items-center justify-center">
                      <Play className="h-4 w-4 text-white opacity-50" />
                    </div>
                    <div>
                      <h3 className="font-medium">{event.title}</h3>
                      <p className="text-sm text-muted-foreground">{event.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatTimestamp(event.timestamp)} • Camera {event.cameraId}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getSeverityColor(event.severity)}>
                      {event.severity}
                    </Badge>
                    {event.acknowledged ? (
                      <Badge variant="outline">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Acknowledged
                      </Badge>
                    ) : (
                      <Button size="sm" onClick={() => handleAcknowledge(event)}>
                        Acknowledge
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}