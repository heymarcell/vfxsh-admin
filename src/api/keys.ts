import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useApiClient } from "./client";
import type { AccessKey, CreateKeyInput, CreateKeyResponse } from "../types/api";

export function useAccessKeys() {
  const api = useApiClient();

  return useQuery({
    queryKey: ["keys"],
    queryFn: async () => {
      const { data } = await api.get<{ keys: AccessKey[] }>("/keys");
      return data.keys;
    },
  });
}

export function useCreateAccessKey() {
  const api = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateKeyInput) => {
      const { data } = await api.post<CreateKeyResponse>("/keys", input);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["keys"] });
    },
  });
}

export function useDeleteAccessKey() {
  const api = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (keyId: string) => {
      await api.delete(`/keys/${keyId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["keys"] });
    },
  });
}
