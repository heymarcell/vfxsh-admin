import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useApiClient } from "./client";
import type { ClerkUser, UserAcl } from "../types/api";

export function useUsers() {
  const api = useApiClient();

  return useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const { data } = await api.get<{ users: ClerkUser[] }>("/admin/users");
      // Filter out users without email addresses to be safe
      return data.users.filter(u => u.email_addresses?.length > 0);
    },
  });
}

export function useUserAcl(userId: string) {
  const api = useApiClient();

  return useQuery({
    queryKey: ["users", userId, "acl"],
    queryFn: async () => {
      const { data } = await api.get<{ acl: UserAcl }>(`/admin/users/${userId}/acl`);
      return data.acl;
    },
    enabled: !!userId,
  });
}

export function useUpdateUserAcl() {
  const queryClient = useQueryClient();
  const api = useApiClient();

  return useMutation({
    mutationFn: async ({ userId, acl }: { userId: string; acl: UserAcl }) => {
      await api.put(`/admin/users/${userId}/acl`, acl);
    },
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: ["users", userId, "acl"] });
    },
  });
}

