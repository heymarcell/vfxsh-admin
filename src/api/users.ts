import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useApiClient } from "./client";
import type { ClerkUser, UserAcl, UpdateAclInput } from "../types/api";

export function useUsers() {
  const api = useApiClient();

  return useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const { data } = await api.get<{ users: ClerkUser[] }>("/users");
      return data.users;
    },
  });
}

export function useUserAcl(userId: string) {
  const api = useApiClient();

  return useQuery({
    queryKey: ["users", userId, "acl"],
    queryFn: async () => {
      const { data } = await api.get<{ acl: UserAcl[] }>(`/users/${userId}/acl`);
      return data.acl;
    },
    enabled: !!userId,
  });
}

export function useUpdateUserAcl(userId: string) {
  const api = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: UpdateAclInput[]) => {
      const { data } = await api.put(`/users/${userId}/acl`, { acl: input });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users", userId, "acl"] });
    },
  });
}
