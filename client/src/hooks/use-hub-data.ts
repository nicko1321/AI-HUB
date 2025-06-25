import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { Hub, Camera, Event, Speaker } from "@shared/schema";

export function useHubs() {
  return useQuery<Hub[]>({
    queryKey: ["/api/hubs"],
  });
}

export function useHub(id: number) {
  return useQuery<Hub>({
    queryKey: ["/api/hubs", id],
    enabled: !!id,
  });
}

export function useCameras(hubId?: number) {
  return useQuery<Camera[]>({
    queryKey: hubId ? ["/api/cameras", { hubId }] : ["/api/cameras"],
  });
}

export function useEvents(hubId?: number, limit?: number) {
  return useQuery<Event[]>({
    queryKey: ["/api/events", { hubId, limit }],
  });
}

export function useSpeakers(hubId?: number) {
  return useQuery<Speaker[]>({
    queryKey: hubId ? ["/api/speakers", { hubId }] : ["/api/speakers"],
  });
}

export function useArmHub() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (hubId: number) => {
      const response = await apiRequest("POST", `/api/hubs/${hubId}/arm`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hubs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
    },
  });
}

export function useDisarmHub() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (hubId: number) => {
      const response = await apiRequest("POST", `/api/hubs/${hubId}/disarm`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hubs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
    },
  });
}

export function useAcknowledgeEvent() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (eventId: number) => {
      const response = await apiRequest("PATCH", `/api/events/${eventId}/acknowledge`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
    },
  });
}

export function useUpdateSpeaker() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: Partial<Speaker> }) => {
      const response = await apiRequest("PATCH", `/api/speakers/${id}`, updates);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/speakers"] });
    },
  });
}
