import React, { useState } from "react";
import { useHubs } from "@/hooks/use-hub-data";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { getStatusColor } from "@/lib/utils";

// Context for selected hub
export const HubContext = React.createContext<{
  selectedHubId: number | null;
  setSelectedHubId: (id: number | null) => void;
}>({
  selectedHubId: null,
  setSelectedHubId: () => {},
});

export function HubProvider({ children }: { children: React.ReactNode }) {
  const [selectedHubId, setSelectedHubId] = useState<number | null>(1); // Default to first hub
  
  return (
    <HubContext.Provider value={{ selectedHubId, setSelectedHubId }}>
      {children}
    </HubContext.Provider>
  );
}

export default function HubSelector() {
  const { data: hubs, isLoading } = useHubs();
  const { selectedHubId, setSelectedHubId } = React.useContext(HubContext);

  if (isLoading) {
    return (
      <div className="p-4 border-t border-slate-700">
        <label className="block text-sm font-medium text-slate-300 mb-2">Active Hub</label>
        <Skeleton className="w-full h-10 bg-slate-800" />
      </div>
    );
  }

  const selectedHub = hubs?.find(hub => hub.id === selectedHubId);

  return (
    <div className="p-4 border-t border-slate-700">
      <label className="block text-sm font-medium text-slate-300 mb-2">Active Hub</label>
      <Select
        value={selectedHubId?.toString() || ""}
        onValueChange={(value) => setSelectedHubId(parseInt(value))}
      >
        <SelectTrigger className="w-full bg-slate-800 border-slate-600 text-white">
          <SelectValue placeholder="Select a hub">
            {selectedHub && (
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${getStatusColor(selectedHub.status)}`} />
                <span>{selectedHub.name} ({selectedHub.location})</span>
              </div>
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="bg-slate-800 border-slate-600">
          {hubs?.map((hub) => (
            <SelectItem key={hub.id} value={hub.id.toString()} className="text-white hover:bg-slate-700">
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${getStatusColor(hub.status)}`} />
                <span>{hub.name} ({hub.location})</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
