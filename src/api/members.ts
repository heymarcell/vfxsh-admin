import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useApiClient } from "./client";

export interface OrgMember {
  user_id: string;
  email: string;
  name: string | null;
  role_name: 'owner' | 'admin' | 'member' | 'viewer';
  created_at: string;
}

export function useOrgMembers() {
  const api = useApiClient();

  return useQuery({
    queryKey: ["orgMembers"],
    queryFn: async () => {
      const { data } = await api.get<{ members: OrgMember[] }>("/organization/members");
      return data.members;
    },
  });
}

export function useUpdateMemberRole() {
  const api = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      const { data } = await api.put(`/organization/members/${userId}`, { role });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orgMembers"] });
    },
  });
}

export function useRemoveMember() {
  const api = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      const { data } = await api.delete(`/organization/members/${userId}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orgMembers"] });
    },
  });
}
