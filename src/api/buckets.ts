import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useApiClient } from "./client";
import type { BucketMapping, CreateBucketRequest } from "../types/api";

export function useBuckets() {
  const api = useApiClient();

  return useQuery({
    queryKey: ["buckets"],
    queryFn: async () => {
      const { data } = await api.get<{ buckets: BucketMapping[] }>("/buckets");
      return data.buckets;
    },
  });
}

export function useCreateBucket() {
  const api = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateBucketRequest) => {
      const { data } = await api.post("/buckets", input);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["buckets"] });
    },
  });
}

export function useDeleteBucket() {
  const api = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (name: string) => {
      await api.delete(`/buckets/${name}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["buckets"] });
    },
  });
}

export function useUpdateBucket() {
  const api = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ bucket_name, ...input }: { bucket_name: string; provider_id?: string; remote_bucket_name?: string }) => {
      const { data } = await api.put(`/buckets/${bucket_name}`, input);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["buckets"] });
    },
  });
}
