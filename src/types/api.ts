// Based on api_specs.md

export interface BucketProvider {
  id: string; // Internal UUID
  name: string; // Friendly name
  endpoint_url: string;
  region: string;
  enabled: boolean;
  created_at: string;
}

export interface BucketMapping {
  bucket_name: string; // The URL subdomain
  provider_id: string | null; // null for virtual buckets
  remote_bucket_name?: string; // undefined for virtual buckets
  provider_name?: string; // Joined field
  bucket_type: 'standard' | 'virtual';
  source_count?: number; // For virtual buckets only
  created_at?: string;
}

export interface VirtualBucketSource {
  id: number;
  virtual_bucket_name: string;
  source_bucket_name: string;
  source_prefix: string;
  display_name?: string;
  sort_order: number;
  provider_id?: string;
  provider_name?: string;
  mount_point?: string;
}

export interface VirtualBucketDetails {
  bucket: BucketMapping;
  sources: VirtualBucketSource[];
}

export interface BucketBrowseResponse {
  folders: { name: string; prefix: string }[];
  files: { key: string; size: number; lastModified: string }[];
  prefix: string;
  isTruncated: boolean;
}

export interface Group {
  id: string;
  name: string;
  description?: string;
  members_count?: number;
}

export interface GroupMember {
  id: string;
  email: string;
  name: string;
  joined_at: string;
}

export interface GroupAccess {
  group_id: string;
  bucket_name: string;
  permission: string;
}

export interface GroupDetails {
  group: Group;
  members: GroupMember[];
  access: GroupAccess[];
}

export interface S3AccessKey {
  access_key_id: string;
  secret_key?: string; // ONLY returned on creation
  user_id: string;
  name?: string;
  expiration?: string; // ISO Date
  created_at: string;
}

export interface ClerkUser {
  id: string;
  email: string;
  name?: string;
  role?: string;
  created_at?: string;
  last_sign_in_at: number | string | null;
}

export interface UserAcl {
  allowed_buckets: {
    bucket_name: string;
    permission: "read" | "write" | "admin";
  }[];
}

// Requests

export interface CreateProviderRequest {
  id: string;
  name: string;
  endpoint_url: string;
  region: string;
  access_key_id: string;
  secret_access_key: string;
}

export interface UpdateProviderRequest {
  name?: string;
  endpoint_url?: string;
  region?: string;
  access_key_id?: string;
  secret_access_key?: string;
}

export interface CreateBucketRequest {
  bucket_name: string;
  bucket_type?: 'standard' | 'virtual';
  provider_id?: string; // Required for standard buckets
  remote_bucket_name?: string; // Optional for standard buckets
}

export interface AddVirtualSourceRequest {
  source_bucket_name: string;
  source_prefix?: string;
  display_name?: string;
  sort_order?: number;
  mount_point?: string;
}

export interface CreateGroupRequest {
  id: string;
  name: string;
}

export interface AddGroupMemberRequest {
  userId: string;
}

export interface GrantGroupAccessRequest {
  bucket: string;
  permission: "read" | "write" | "admin";
}

