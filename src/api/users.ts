import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useApiClient } from "./client";
import type { ClerkUser, UserAcl } from "../types/api";

export function useUsers() {
  const api = useApiClient();

  return useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      // In a real app this would probably be paginated
      const { data } = await api.get<{ users: ClerkUser[] }>("/users");
      return data.users;
    },
  });
}

export function useUserAcl(userId: string) {
  const api = useApiClient();
  
  return useQuery({
    queryKey: ["userAcl", userId],
    queryFn: async () => {
      const { data } = await api.get<UserAcl>(`/users/${userId}/acl`);
      return data;
    },
    enabled: !!userId,
  });
}

export function useUpdateUserAcl() {
  const api = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, acl }: { userId: string; acl: UserAcl }) => {
      const { data } = await api.put(`/users/${userId}/acl`, acl);
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["userAcl", variables.userId] });
    },
  });
}

export function useInviteUser() {
  const api = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ email, role }: { email: string; role: string }) => {
      const { data } = await api.post('/organization/members', { email, role });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}
