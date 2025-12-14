import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useApiClient } from "./client";
import type { 
  CreateGroupRequest, 
  AddGroupMemberRequest, 
  GrantGroupAccessRequest,
  GroupDetails,
  Group
} from "../types/api";

export function useGroups() {
  const api = useApiClient();

  return useQuery({
    queryKey: ["groups"],
    queryFn: async () => {
      const { data } = await api.get<{ groups: Group[] }>("/groups");
      return data.groups;
    },
  });
}

export function useGroup(id: string) {
  const api = useApiClient();

  return useQuery({
    queryKey: ["groups", id],
    queryFn: async () => {
      const { data } = await api.get<GroupDetails>(`/groups/${id}`);
      return data;
    },
    enabled: !!id,
  });
}

export function useCreateGroup() {
  const api = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateGroupRequest) => {
      const { data } = await api.post("/groups", input);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groups"] });
    },
  });
}

export function useAddGroupMember() {
  const api = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ groupId, userId }: { groupId: string; userId: string }) => {
      const input: AddGroupMemberRequest = { userId };
      await api.post(`/groups/${groupId}/members`, input);
    },
    onSuccess: (_, { groupId }) => {
      queryClient.invalidateQueries({ queryKey: ["groups", groupId] });
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      queryClient.invalidateQueries({ queryKey: ["users"] }); // Groups column on users
    },
  });
}

export function useRemoveGroupMember() {
  const api = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ groupId, userId }: { groupId: string; userId: string }) => {
      await api.delete(`/groups/${groupId}/members/${userId}`);
    },
    onSuccess: (_, { groupId }) => {
      queryClient.invalidateQueries({ queryKey: ["groups", groupId] });
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      queryClient.invalidateQueries({ queryKey: ["users"] }); // Groups column on users
    },
  });
}

export function useGrantGroupAccess() {
  const api = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ groupId, ...input }: GrantGroupAccessRequest & { groupId: string }) => {
      await api.post(`/groups/${groupId}/access`, input);
    },
    onSuccess: (_, { groupId }) => {
      queryClient.invalidateQueries({ queryKey: ["groups", groupId] });
    },
  });
}

export function useUpdateGroup() {
  const api = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ groupId, name, description }: { groupId: string; name?: string; description?: string }) => {
      await api.put(`/groups/${groupId}`, { name, description });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groups"] });
    },
  });
}

export function useDeleteGroup() {
  const api = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (groupId: string) => {
      await api.delete(`/groups/${groupId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groups"] });
    },
  });
}
