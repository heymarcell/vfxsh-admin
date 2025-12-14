import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useApiClient } from "./client";
import type { Provider, CreateProviderInput } from "../types/api";

export function useProviders() {
  const api = useApiClient();

  return useQuery({
    queryKey: ["providers"],
    queryFn: async () => {
      const { data } = await api.get<{ providers: Provider[] }>("/providers");
      return data.providers;
    },
  });
}

export function useCreateProvider() {
  const api = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateProviderInput) => {
      const { data } = await api.post("/providers", input);
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
