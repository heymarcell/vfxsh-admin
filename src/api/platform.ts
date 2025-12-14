/**
 * Platform API hooks for super admin operations
 */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useApiClient } from "./client";

// ============= Types =============

export interface Provider {
  id: string;
  name: string;
  endpoint_url: string;
  region: string;
  enabled: boolean;
  created_at: string;
}

export interface SourceBucket {
  id: string;
  bucket_name: string;
  remote_bucket_name: string;
  provider_id: string;
  provider_name: string;
  bucket_type: string;
  created_at: string;
}

export interface PlatformOrganization {
  id: string;
  name: string;
  created_at: string;
  member_count: number;
  bucket_count: number;
}

export interface BucketAssignment {
  id: string;
  org_id: string;
  bucket_id: string;
  org_name: string;
  bucket_name: string;
  created_at: string;
}

export interface PlatformUser {
  id: string;
  email: string;
  name: string | null;
  is_super_admin: boolean;
  created_at: string;
  org_count: number;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userEmail: string | null;
  orgId: string | null;
  action: string;
  resourceType: string;
  resourceId: string | null;
  details: Record<string, unknown> | null;
  ipAddress: string | null;
}

// ============= Platform Status =============

export function usePlatformStatus() {
  const api = useApiClient();

  return useQuery({
    queryKey: ["platformStatus"],
    queryFn: async () => {
      const { data } = await api.get<{ isSuperAdmin: boolean }>("/platform/status");
      return data;
    },
  });
}

// ============= Providers =============

export function usePlatformProviders() {
  const api = useApiClient();

  return useQuery({
    queryKey: ["platformProviders"],
    queryFn: async () => {
      const { data } = await api.get<{ providers: Provider[] }>("/platform/providers");
      return data.providers;
    },
  });
}

export function useCreateProvider() {
  const api = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (provider: {
      id: string;
      name: string;
      endpoint_url: string;
      access_key_id: string;
      secret_access_key: string;
      region?: string;
    }) => {
      const { data } = await api.post("/platform/providers", provider);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["platformProviders"] });
    },
  });
}

export function useDeleteProvider() {
  const api = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.delete(`/platform/providers/${id}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["platformProviders"] });
    },
  });
}

// ============= Source Buckets =============

export function usePlatformBuckets() {
  const api = useApiClient();

  return useQuery({
    queryKey: ["platformBuckets"],
    queryFn: async () => {
      const { data } = await api.get<{ buckets: SourceBucket[] }>("/platform/buckets");
      return data.buckets;
    },
  });
}

export function useCreateSourceBucket() {
  const api = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (bucket: {
      bucket_name: string;
      remote_bucket_name: string;
      provider_id: string;
    }) => {
      const { data } = await api.post("/platform/buckets", { ...bucket, bucket_type: "standard" });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["platformBuckets"] });
    },
  });
}

export function useDeleteSourceBucket() {
  const api = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.delete(`/platform/buckets/${id}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["platformBuckets"] });
    },
  });
}

// ============= Organizations =============

export function usePlatformOrganizations() {
  const api = useApiClient();

  return useQuery({
    queryKey: ["platformOrganizations"],
    queryFn: async () => {
      const { data } = await api.get<{ organizations: PlatformOrganization[] }>("/platform/organizations");
      return data.organizations;
    },
  });
}

export function useCreateOrganization() {
  const api = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (org: { name: string; owner_email?: string }) => {
      const { data } = await api.post("/platform/organizations", org);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["platformOrganizations"] });
    },
  });
}

export function useDeleteOrganization() {
  const api = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.delete(`/platform/organizations/${id}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["platformOrganizations"] });
    },
  });
}

// ============= Bucket Assignments =============

export function useBucketAssignments() {
  const api = useApiClient();

  return useQuery({
    queryKey: ["bucketAssignments"],
    queryFn: async () => {
      const { data } = await api.get<{ assignments: BucketAssignment[] }>("/platform/assignments");
      return data.assignments;
    },
  });
}

export function useAssignBucket() {
  const api = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ org_id, bucket_id }: { org_id: string; bucket_id: string }) => {
      const { data } = await api.post("/platform/assignments", { org_id, bucket_id });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bucketAssignments"] });
      queryClient.invalidateQueries({ queryKey: ["platformOrganizations"] });
    },
  });
}

export function useUnassignBucket() {
  const api = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.delete(`/platform/assignments/${id}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bucketAssignments"] });
      queryClient.invalidateQueries({ queryKey: ["platformOrganizations"] });
    },
  });
}

// ============= Users =============

export function usePlatformUsers() {
  const api = useApiClient();

  return useQuery({
    queryKey: ["platformUsers"],
    queryFn: async () => {
      const { data } = await api.get<{ users: PlatformUser[] }>("/platform/users");
      return data.users;
    },
  });
}

export function useSetSuperAdmin() {
  const api = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, isSuperAdmin }: { userId: string; isSuperAdmin: boolean }) => {
      const { data } = await api.put(`/platform/users/${userId}/super-admin`, { is_super_admin: isSuperAdmin });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["platformUsers"] });
    },
  });
}

// ============= Audit Logs =============

export function useAuditLogs(filters?: {
  org_id?: string;
  user_id?: string;
  action?: string;
  limit?: number;
}) {
  const api = useApiClient();

  return useQuery({
    queryKey: ["auditLogs", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.org_id) params.set("org_id", filters.org_id);
      if (filters?.user_id) params.set("user_id", filters.user_id);
      if (filters?.action) params.set("action", filters.action);
      if (filters?.limit) params.set("limit", String(filters.limit));

      const { data } = await api.get<{ logs: AuditLog[]; total: number }>(
        `/platform/audit-logs?${params.toString()}`
      );
      return data;
    },
  });
}
