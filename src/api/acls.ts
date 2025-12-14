import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useApiClient } from "./client";

type AclMatrix = Record<string, Record<string, string>>;

export function useUserAclMatrix() {
  const api = useApiClient();

  return useQuery({
    queryKey: ["acls", "users"],
    queryFn: async () => {
      const { data } = await api.get<{ acls: AclMatrix }>("/acls/users");
      return data.acls;
    },
  });
}

export function useGroupAclMatrix() {
  const api = useApiClient();

  return useQuery({
    queryKey: ["acls", "groups"],
    queryFn: async () => {
      const { data } = await api.get<{ acls: AclMatrix }>("/acls/groups");
      return data.acls;
    },
  });
}

export function useSetUserBucketPermission() {
  const api = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, bucketName, permission }: { userId: string; bucketName: string; permission: string | null }) => {
      // Get current ACLs for this user
      const { data: currentAcls } = await api.get<{ acls: { bucket_name: string; permission: string }[] }>(`/users/${userId}/acl`);
      
      // Build new ACL list
      const acls = (currentAcls.acls || []).filter(a => a.bucket_name !== bucketName);
      if (permission && permission !== 'none') {
        acls.push({ bucket_name: bucketName, permission });
      }

      await api.put(`/users/${userId}/acl`, { acls });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["acls", "users"] });
    },
  });
}

export function useSetGroupBucketPermission() {
  const api = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ groupId, bucketName, permission }: { groupId: string; bucketName: string; permission: string | null }) => {
      if (!permission || permission === 'none') {
        await api.delete(`/groups/${groupId}/access/${bucketName}`);
      } else {
        await api.post(`/groups/${groupId}/access`, { bucket: bucketName, permission });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["acls", "groups"] });
    },
  });
}
