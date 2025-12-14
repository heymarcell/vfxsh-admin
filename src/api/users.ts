import { useAuth } from "@clerk/clerk-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useApiClient } from "./client";
import type { ClerkUser, UserAcl } from "../types/api";

export function useUsers() {
  const api = useApiClient();

  return useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const { data } = await api.get<{ users: ClerkUser[] }>("/users");
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
      const { data } = await api.get<{ acl: UserAcl }>(`/users/${userId}/acl`);
      return data.acl;
    },
    enabled: !!userId,
  });
}

export function useUpdateUserAcl() {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();
  const api = useApiClient();

  return useMutation({
    mutationFn: async ({ userId, acl }: { userId: string; acl: UserAcl }) => {
      const token = await getToken();
      await api.put(`/users/${userId}/acl`, acl, {
        headers: { Authorization: `Bearer ${token}` },
      });
    },
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: ["users", userId, "acl"] });
    },
  });
}
