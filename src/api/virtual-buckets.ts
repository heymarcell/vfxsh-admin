/**
 * Virtual Bucket API Hooks
 * 
 * React Query hooks for managing virtual buckets - buckets that aggregate
 * content from subdirectories of multiple real buckets.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useApiClient } from './client';
import type {
  VirtualBucketDetails,
  AddVirtualSourceRequest,
  BucketBrowseResponse,
} from '../types/api';

/**
 * Fetches virtual bucket details including all source folders.
 */
export function useVirtualBucket(bucketName: string) {
  const api = useApiClient();
  
  return useQuery({
    queryKey: ['virtual-bucket', bucketName],
    queryFn: async () => {
      const response = await api.get(`/virtual-buckets/${encodeURIComponent(bucketName)}`);
      return response.data as VirtualBucketDetails;
    },
    enabled: !!bucketName,
  });
}

/**
 * Fetches sources for a virtual bucket.
 */
export function useVirtualBucketSources(bucketName: string) {
  const { data } = useVirtualBucket(bucketName);
  return data?.sources || [];
}

/**
 * Adds a new source folder to a virtual bucket.
 */
export function useAddVirtualSource(virtualBucketName: string) {
  const api = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: AddVirtualSourceRequest) => {
      const response = await api.post(
        `/virtual-buckets/${encodeURIComponent(virtualBucketName)}/sources`,
        data
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['virtual-bucket', virtualBucketName] });
      queryClient.invalidateQueries({ queryKey: ['buckets'] });
    },
  });
}

/**
 * Updates a virtual bucket source (display name, sort order).
 */
export function useUpdateVirtualSource(virtualBucketName: string) {
  const api = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      sourceId,
      data,
    }: {
      sourceId: number;
      data: { display_name?: string; sort_order?: number; mount_point?: string };
    }) => {
      const response = await api.put(
        `/virtual-buckets/${encodeURIComponent(virtualBucketName)}/sources/${sourceId}`,
        data
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['virtual-bucket', virtualBucketName] });
    },
  });
}

/**
 * Removes a source folder from a virtual bucket.
 */
export function useRemoveVirtualSource(virtualBucketName: string) {
  const api = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (sourceId: number) => {
      const response = await api.delete(
        `/virtual-buckets/${encodeURIComponent(virtualBucketName)}/sources/${sourceId}`
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['virtual-bucket', virtualBucketName] });
      queryClient.invalidateQueries({ queryKey: ['buckets'] });
    },
  });
}

/**
 * Browses contents of a bucket for folder selection.
 * Lists folders and files at the given prefix.
 */
export function useBrowseBucket(bucketName: string, prefix: string = '') {
  const api = useApiClient();
  
  return useQuery({
    queryKey: ['bucket-browse', bucketName, prefix],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (prefix) params.set('prefix', prefix);
      
      const response = await api.get(
        `/buckets/${encodeURIComponent(bucketName)}/browse?${params.toString()}`
      );
      return response.data as BucketBrowseResponse;
    },
    enabled: !!bucketName,
  });
}
