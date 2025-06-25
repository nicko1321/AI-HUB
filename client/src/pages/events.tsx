import { useState, useContext } from "react";
import { useEvents, useAcknowledgeEvent } from "@/hooks/use-hub-data";
import { HubContext } from "@/components/hub-selector";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Filter, Check, AlertCircle, Shield, Wifi, Activity } from "lucide-react";
import { formatTimestamp, getSeverityColor } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import type { Event } from "@shared/schema";

const eventTypeIcons = {
  motion: Activity,
  alarm: AlertCircle,
  system: Shield,
  connection: Wifi,
};

const severityFilters = [
  { label: "All Severity", value: "all" },
  { label: "Critical", value: "critical" },
  { label: "High", value: "high" },
  { label: "Medium", value: "medium" },
  { label: "Low", value: "low" },
];

const typeFilters = [
  { label: "All Types", value: "all" },
  { label: "Motion", value: "motion" },
  { label: "Alarm", value: "alarm" },
  { label: "System", value: "system" },
  { label: "Connection", value: "connection" },
];

export default function Events() {
  const { selectedHubId } = useContext(HubContext);
  const { data: events, isLoading } = useEvents();
  const acknowledgeEvent = useAcknowledgeEvent();
  const { toast } = useToast();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("all");

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

  const filteredEvents = events?.filter(event => {
    // Hub filter
    if (selectedHubId && event.hubId !== selectedHubId) return false;
    
    // Tab filter (acknowledged status)
    if (activeTab === "unacknowledged" && event.acknowledged) return false;
    if (activeTab === "acknowledged" && !event.acknowledged) return false;
    
    // Search filter
    if (searchTerm && !event.title.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !event.description?.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    
    // Severity filter
    if (severityFilter !== "all" && event.severity !== severityFilter) return false;
    
    // Type filter
    if (typeFilter !== "all" && event.type !== typeFilter) return false;
    
    return true;
  }) || [];

  const unacknowledgedCount = events?.filter(e => !e.acknowledged).length || 0;
  const acknowledgedCount = events?.filter(e => e.acknowledged).length || 0;

  if (isLoading) {
    return (
      <>
        <header className="bg-slate-900 border-b border-slate-700 px-6 py-4">
          <Skeleton className="h-8 w-32" />
        </header>
        <main className="flex-1 overflow-auto p-6">
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-24 bg-slate-850" />
            ))}
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      {/* Top Bar */}
      <header className="bg-slate-900 border-b border-slate-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h2 className="text-2xl font-semibold text-white">Events</h2>
            <div className="flex items-center space-x-2 text-sm text-slate-400">
              <span>{filteredEvents.length} events</span>
              {selectedHubId && (
                <>
                  <span>•</span>
                  <span>Hub {selectedHubId}</span>
                </>
              )}
            </div>
          </div>
          
          {/* Filters */}
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64 bg-slate-800 border-slate-600 text-white"
              />
            </div>
            
            <Select value={severityFilter} onValueChange={setSeverityFilter}>
              <SelectTrigger className="w-32 bg-slate-800 border-slate-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-600">
                {severityFilters.map((filter) => (
                  <SelectItem key={filter.value} value={filter.value} className="text-white hover:bg-slate-700">
                    {filter.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-32 bg-slate-800 border-slate-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-600">
                {typeFilters.map((filter) => (
                  <SelectItem key={filter.value} value={filter.value} className="text-white hover:bg-slate-700">
                    {filter.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </header>

      {/* Events Content */}
      <main className="flex-1 overflow-auto p-6">
        <div className="bg-slate-850 rounded-xl border border-slate-700 p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="bg-slate-800 border-slate-700">
              <TabsTrigger value="all" className="data-[state=active]:bg-slate-700">
                All Events ({events?.length || 0})
              </TabsTrigger>
              <TabsTrigger value="unacknowledged" className="data-[state=active]:bg-slate-700">
                Unacknowledged ({unacknowledgedCount})
              </TabsTrigger>
              <TabsTrigger value="acknowledged" className="data-[state=active]:bg-slate-700">
                Acknowledged ({acknowledgedCount})
              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="space-y-4">
              {filteredEvents.length === 0 ? (
                <div className="text-center py-12">
                  <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-400 text-lg">No events found</p>
                  <p className="text-slate-500 text-sm mt-1">
                    Try adjusting your filters or search criteria
                  </p>
                </div>
              ) : (
                filteredEvents.map((event) => {
                  const IconComponent = eventTypeIcons[event.type as keyof typeof eventTypeIcons] || AlertCircle;
                  
                  return (
                    <div
                      key={event.id}
                      className={`p-4 rounded-lg border transition-all ${
                        event.acknowledged
                          ? "bg-slate-900/50 border-slate-700/50 opacity-75"
                          : "bg-slate-900 border-slate-700 hover:border-slate-600"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4 flex-1">
                          {/* Event Icon & Severity */}
                          <div className="flex flex-col items-center space-y-2">
                            <div className={`w-3 h-3 rounded-full ${getSeverityColor(event.severity)}`} />
                            <IconComponent className="w-5 h-5 text-slate-400" />
                          </div>
                          
                          {/* Event Details */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className="text-white font-medium">{event.title}</h3>
                              <Badge variant="outline" className="border-slate-600 text-slate-400">
                                Hub {event.hubId}
                              </Badge>
                              <Badge variant="outline" className={`border-slate-600 capitalize ${
                                event.severity === "critical" ? "text-red-400" :
                                event.severity === "high" ? "text-amber-400" :
                                event.severity === "medium" ? "text-yellow-400" :
                                "text-green-400"
                              }`}>
                                {event.severity}
                              </Badge>
                              <Badge variant="outline" className="border-slate-600 text-slate-400 capitalize">
                                {event.type}
                              </Badge>
                            </div>
                            
                            {event.description && (
                              <p className="text-slate-400 text-sm mb-2">{event.description}</p>
                            )}
                            
                            <div className="flex items-center space-x-4 text-xs text-slate-500">
                              <span>{formatTimestamp(event.timestamp)}</span>
                              {event.cameraId && (
                                <>
                                  <span>•</span>
                                  <span>Camera {event.cameraId}</span>
                                </>
                              )}
                              {event.acknowledged && (
                                <>
                                  <span>•</span>
                                  <span className="text-green-400">Acknowledged</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        {/* Actions */}
                        {!event.acknowledged && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleAcknowledge(event)}
                            disabled={acknowledgeEvent.isPending}
                            className="border-slate-600 text-slate-300 hover:text-white"
                          >
                            <Check className="w-4 h-4 mr-2" />
                            Acknowledge
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </>
  );
}
