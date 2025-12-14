import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useApiClient } from "./client";
import type { BucketProvider, CreateProviderRequest, UpdateProviderRequest } from "../types/api";

export function useProviders() {
  const api = useApiClient();

  return useQuery({
    queryKey: ["providers"],
    queryFn: async () => {
      const { data } = await api.get<{ providers: BucketProvider[] }>("/providers");
      return data.providers;
    },
  });
}

export function useCreateProvider() {
  const api = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateProviderRequest) => {
      const { data } = await api.post("/providers", input);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["providers"] });
    },
  });
}

export function useUpdateProvider() {
  const api = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...input }: UpdateProviderRequest & { id: string }) => {
      const { data } = await api.put(`/providers/${id}`, input);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["providers"] });
    },
  });
}

export function useDeleteProvider() {
  const api = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/providers/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["providers"] });
    },
  });
}

