import { useEvents, useAcknowledgeEvent } from "@/hooks/use-hub-data";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Check } from "lucide-react";
import { formatTimestamp, getSeverityColor } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
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

  return (
    <div className="space-y-3">
      {events.map((event) => (
        <div
          key={event.id}
          className={`flex items-start space-x-3 p-3 rounded-lg transition-opacity ${
            event.acknowledged ? "bg-slate-900/50 opacity-60" : "bg-slate-900"
          }`}
        >
          <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${getSeverityColor(event.severity)}`} />
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm text-white font-medium">{event.title}</p>
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
                        {event.metadata && typeof event.metadata === 'object' && (
                          <div className="mt-1 flex items-center space-x-2 text-xs text-slate-500">
                            {(event.metadata as any).vehicle_type && (
                              <span>{(event.metadata as any).vehicle_type}</span>
                            )}
                            {(event.metadata as any).color && (
                              <span>• {(event.metadata as any).color}</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
                <div className="flex items-center space-x-2 mt-1">
                  <p className="text-xs text-slate-500">{formatTimestamp(event.timestamp)}</p>
                  <span className="text-xs text-slate-600">•</span>
                  <p className="text-xs text-slate-500 capitalize">{event.type}</p>
                  {event.severity !== "low" && (
                    <>
                      <span className="text-xs text-slate-600">•</span>
                      <p className="text-xs text-slate-500 capitalize">{event.severity}</p>
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
      ))}
    </div>
  );
}
