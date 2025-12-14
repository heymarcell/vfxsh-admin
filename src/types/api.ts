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
  provider_id: string;
  remote_bucket_name: string;
  provider_name?: string; // Joined field
}

export interface Group {
  id: string;
  name: string;
  description?: string;
  members_count?: number;
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
  email_addresses: { email_address: string }[];
  last_sign_in_at: number | null;
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
  provider_id: string;
  remote_bucket_name?: string;
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

