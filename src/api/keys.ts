import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useApiClient } from "./client";
import type { S3AccessKey } from "../types/api";

// Assuming CreateKeyRequest structure based on usage
interface CreateKeyRequest {
  user_id: string;
  name?: string;
  expiration?: string;
}

export function useAccessKeys() {
  const api = useApiClient();

  return useQuery({
    queryKey: ["keys"],
    queryFn: async () => {
      const { data } = await api.get<{ keys: S3AccessKey[] }>("/admin/keys");
      return data.keys;
    },
  });
}

export function useCreateAccessKey() {
  const api = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateKeyRequest) => {
      const { data } = await api.post<S3AccessKey>("/admin/keys", input);
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
      await api.delete(`/admin/keys/${keyId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["keys"] });
    },
  });
}

