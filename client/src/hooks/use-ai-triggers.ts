import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { AITrigger } from "@shared/schema";

export function useAITriggers() {
  return useQuery<AITrigger[]>({
    queryKey: ["/api/ai-triggers"],
  });
}

export function useAITrigger(id: number) {
  return useQuery<AITrigger>({
    queryKey: ["/api/ai-triggers", id],
    enabled: !!id,
  });
}

export function useCreateAITrigger() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (trigger: Omit<AITrigger, 'id' | 'createdAt' | 'updatedAt'>) => {
      const response = await apiRequest("POST", "/api/ai-triggers", trigger);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ai-triggers"] });
    },
  });
}

export function useUpdateAITrigger() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: Partial<AITrigger> }) => {
      const response = await apiRequest("PATCH", `/api/ai-triggers/${id}`, updates);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ai-triggers"] });
    },
  });
}

export function useDeleteAITrigger() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/ai-triggers/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ai-triggers"] });
    },
  });
}

export function useAnalyzeImage() {
  return useMutation({
    mutationFn: async ({ imageData, triggerId }: { imageData: string; triggerId: number }) => {
      const response = await apiRequest("POST", "/api/ai-triggers/analyze", { imageData, triggerId });
      return response.json();
    },
  });
}