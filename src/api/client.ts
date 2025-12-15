import axios from "axios";
import { useAuth } from "@clerk/clerk-react";
import { useMemo } from "react";

const API_URL = import.meta.env.VITE_API_URL;

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Hook to get authenticated API client
export function useApiClient() {
  const { getToken } = useAuth();

  // Memoize the axios instance to prevent recreating on every render
  // This is critical for useEffect dependencies that depend on api
  const authApi = useMemo(() => {
    const instance = axios.create({
      baseURL: API_URL,
      headers: {
        "Content-Type": "application/json",
      },
    });

    instance.interceptors.request.use(async (config) => {
      const token = await getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      const orgId = localStorage.getItem('vfxsh_org_id');
      if (orgId) {
        config.headers['X-Organization-ID'] = orgId;
      }
      return config;
    });

    return instance;
  }, [getToken]);

  return authApi;
}
