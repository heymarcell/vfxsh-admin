import type { AxiosInstance } from "axios";

export interface FileEntry {
  name: string;
  type: 'file' | 'directory';
  size: number;
  lastModified: string;
  path: string;
  locked?: boolean;
  lockOwner?: string;
}

export interface LockEntry {
  path: string;
  ownerId: string;
  machineId: string;
  expiresAt: number;
  meta?: any;
}

export interface FileSystemApi {
  getFiles: (path: string) => Promise<FileEntry[]>;
  getFileDetails: (path: string) => Promise<FileEntry>;
  releaseLock: (path: string) => Promise<void>;
  getActiveLocks: () => Promise<LockEntry[]>;
}

export const createFileSystemApi = (client: AxiosInstance): FileSystemApi => ({
  getFiles: async (path = "/") => {
    const res = await client.get(`/fs/readdir`, { params: { path } });
    return res.data;
  },
  getFileDetails: async (path: string) => {
    const res = await client.get(`/fs/getattr`, { params: { path } });
    return res.data;
  },
  releaseLock: async (path: string) => {
    await client.post(`/locks/release`, { path });
  },
  getActiveLocks: async () => {
    const res = await client.get(`/locks/list`);
    // API returns { locks: [] }
    return res.data.locks;
  },
});
