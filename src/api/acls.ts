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
      // Get current matrix from cache
      const currentMatrix = queryClient.getQueryData<AclMatrix>(["acls", "users"]) || {};
      const userAcls = currentMatrix[userId] || {};
      
      // Build new ACL list
      const acls: { bucket_name: string; permission: string }[] = [];
      for (const [bucket, perm] of Object.entries(userAcls)) {
        if (bucket !== bucketName) {
          acls.push({ bucket_name: bucket, permission: perm });
        }
      }
      
      // Add new permission if not removing
      if (permission && permission !== 'none') {
        acls.push({ bucket_name: bucketName, permission });
      }

      await api.put(`/users/${userId}/acl`, { acls });
      return { userId, bucketName, permission };
    },
    onMutate: async ({ userId, bucketName, permission }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["acls", "users"] });

      // Snapshot the previous value
      const previousMatrix = queryClient.getQueryData<AclMatrix>(["acls", "users"]);

      // Optimistically update to the new value
      queryClient.setQueryData<AclMatrix>(["acls", "users"], (old) => {
        const newMatrix = { ...old };
        if (!newMatrix[userId]) newMatrix[userId] = {};
        
        if (permission && permission !== 'none') {
          newMatrix[userId] = { ...newMatrix[userId], [bucketName]: permission };
        } else {
          // Remove the bucket from user's permissions
          const { [bucketName]: _, ...rest } = newMatrix[userId];
          newMatrix[userId] = rest;
        }
        return newMatrix;
      });

      return { previousMatrix };
    },
    onError: (_err, _vars, context) => {
      // Rollback on error
      if (context?.previousMatrix) {
        queryClient.setQueryData(["acls", "users"], context.previousMatrix);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["acls", "users"] });
      queryClient.invalidateQueries({ queryKey: ["keys"] }); // Bucket count on keys
      queryClient.invalidateQueries({ queryKey: ["users"] }); // Bucket count on users
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
      return { groupId, bucketName, permission };
    },
    onMutate: async ({ groupId, bucketName, permission }) => {
      await queryClient.cancelQueries({ queryKey: ["acls", "groups"] });
      const previousMatrix = queryClient.getQueryData<AclMatrix>(["acls", "groups"]);

      queryClient.setQueryData<AclMatrix>(["acls", "groups"], (old) => {
        const newMatrix = { ...old };
        if (!newMatrix[groupId]) newMatrix[groupId] = {};
        
        if (permission && permission !== 'none') {
          newMatrix[groupId] = { ...newMatrix[groupId], [bucketName]: permission };
        } else {
          const { [bucketName]: _, ...rest } = newMatrix[groupId];
          newMatrix[groupId] = rest;
        }
        return newMatrix;
      });

      return { previousMatrix };
    },
    onError: (_err, _vars, context) => {
      if (context?.previousMatrix) {
        queryClient.setQueryData(["acls", "groups"], context.previousMatrix);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["acls", "groups"] });
      queryClient.invalidateQueries({ queryKey: ["keys"] }); // Bucket count on keys
      queryClient.invalidateQueries({ queryKey: ["users"] }); // Bucket count on users
    },
  });
}
