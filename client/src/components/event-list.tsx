import { useEvents, useAcknowledgeEvent } from "@/hooks/use-hub-data";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Check, AlertTriangle, Shield, Bell } from "lucide-react";
import { formatTimestamp, getSeverityColor } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { shouldTriggerAlert, getAlertPriority, getAlertMessage } from "@shared/alert-types";
import { getVehicleInfo, renderMetadataBadges } from "@/lib/event-utils";
import type { Event } from "@shared/schema";

interface EventListProps {
  hubId?: number;
  limit?: number;
  showAcknowledge?: boolean;
}

export default function EventList({ hubId, limit = 10, showAcknowledge = true }: EventListProps) {
  const { data: events, isLoading } = useEvents(hubId, limit);
  const acknowledgeEvent = useAcknowledgeEvent();
  const { toast } = useToast();

  const handleAcknowledge = async (event: Event) => {
    try {
      await acknowledgeEvent.mutateAsync(event.id);
      toast({
        title: "Event acknowledged",
        description: `${event.title} has been acknowledged`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to acknowledge event",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-start space-x-3 p-3 bg-slate-900 rounded-lg">
            <Skeleton className="w-2 h-2 rounded-full mt-2" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!events || events.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-slate-400">No events found</p>
        <p className="text-slate-500 text-sm mt-1">
          {hubId ? "No events for this hub" : "No recent events"}
        </p>
      </div>
    );
  }

  const getEventIcon = (event: Event): JSX.Element => {
    const isAlert = shouldTriggerAlert(event.type, event.severity, event.metadata);
    const priority = getAlertPriority(event.type, event.severity, event.metadata);
    
    if (isAlert) {
      if (priority === 'critical') return <AlertTriangle className="w-4 h-4 text-red-500" />;
      if (priority === 'high') return <Shield className="w-4 h-4 text-orange-500" />;
    }
    return <Bell className="w-4 h-4 text-blue-500" />;
  };

  const getEventBorderColor = (event: Event) => {
    const isAlert = shouldTriggerAlert(event.type, event.severity, event.metadata);
    const priority = getAlertPriority(event.type, event.severity, event.metadata);
    
    if (!isAlert) return "border-slate-700";
    if (priority === 'critical') return "border-red-500/50";
    if (priority === 'high') return "border-orange-500/50";
    return "border-yellow-500/50";
  };

  const getEventBgColor = (event: Event) => {
    const isAlert = shouldTriggerAlert(event.type, event.severity, event.metadata);
    const priority = getAlertPriority(event.type, event.severity, event.metadata);
    
    if (!isAlert) return "bg-slate-900";
    if (priority === 'critical') return "bg-red-950/30";
    if (priority === 'high') return "bg-orange-950/30";
    return "bg-yellow-950/30";
  };

  return (
    <div className="space-y-3">
      {events.map((event) => {
        const isAlert = shouldTriggerAlert(event.type, event.severity, event.metadata);
        const alertMessage = isAlert ? getAlertMessage(event.type, event.title, event.description || '') : event.title;
        
        return (
          <div
            key={event.id}
            className={`flex items-start space-x-3 p-3 rounded-lg border transition-opacity ${
              event.acknowledged ? "opacity-60" : ""
            } ${getEventBgColor(event)} ${getEventBorderColor(event)}`}
          >
            <div className="flex items-center space-x-2 flex-shrink-0">
              {getEventIcon(event)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <p className="text-sm text-white font-medium">{isAlert ? alertMessage : event.title}</p>
                    {isAlert && (
                      <Badge variant="destructive" className="text-xs">
                        ALERT
                      </Badge>
                    )}
                  </div>
                  {event.description && (
                    <p className="text-xs text-slate-400 mt-1">{event.description}</p>
                  )}
                  
                  {/* License Plate Information */}
                  {event.licensePlate && (
                    <div className="mt-2 p-2 bg-slate-800 rounded border border-slate-700">
                      <div className="flex items-center space-x-3">
                        {event.licensePlateThumbnail && (
                          <div className="flex-shrink-0">
                            <img 
                              src={event.licensePlateThumbnail} 
                              alt={`License plate ${event.licensePlate}`}
                              className="w-16 h-8 object-cover rounded border border-slate-600"
                            />
                          </div>
                        )}
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="text-xs font-mono text-white bg-slate-700 px-2 py-1 rounded">
                              {event.licensePlate}
                            </span>
                            {event.licensePlateConfidence && (
                              <span className="text-xs text-slate-400">
                                {event.licensePlateConfidence}% confidence
                              </span>
                            )}
                          </div>
                          {(() => {
                            const vehicleInfo = getVehicleInfo(event.metadata);
                            const badges = renderMetadataBadges(event);
                            
                            return (
                              <div className="mt-1 flex items-center space-x-2 text-xs text-slate-500">
                                {vehicleInfo.type && <span>{vehicleInfo.type}</span>}
                                {vehicleInfo.color && <span>• {vehicleInfo.color}</span>}
                                {badges.map((badge, idx) => (
                                  <Badge key={idx} variant={badge.variant} className="text-xs ml-2">
                                    {badge.label}
                                  </Badge>
                                ))}
                              </div>
                            );
                          })() as React.ReactElement}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center space-x-2 mt-2">
                    <p className="text-xs text-slate-500">{formatTimestamp(event.timestamp)}</p>
                    <span className="text-xs text-slate-600">•</span>
                    <p className="text-xs text-slate-500 capitalize">{event.type.replace('_', ' ')}</p>
                    <span className="text-xs text-slate-600">•</span>
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${getSeverityColor(event.severity)}`}
                    >
                      {event.severity}
                    </Badge>
                    {isAlert && (
                      <>
                        <span className="text-xs text-slate-600">•</span>
                        <span className="text-xs text-red-400 font-medium">Security Alert</span>
                      </>
                    )}
                  </div>
                </div>
                {showAcknowledge && !event.acknowledged && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleAcknowledge(event)}
                    disabled={acknowledgeEvent.isPending}
                    className="text-slate-400 hover:text-white"
                  >
                    <Check className="w-3 h-3" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
