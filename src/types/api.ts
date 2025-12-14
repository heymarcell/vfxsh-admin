export interface Provider {
  id: string;
  name: string;
  endpoint_url: string;
  region: string;
  enabled: boolean;
  created_at: string;
}

export interface Bucket {
  bucket_name: string;
  provider_id: string;
  remote_bucket_name: string;
  provider_name: string;
  created_at: string;
}

export interface AccessKey {
  access_key_id: string;
  name: string | null;
  user_id: string;
  user_email: string | null;
  enabled: boolean;
  expiration: string | null;
  created_at: string;
}

export interface UserAcl {
  bucket_name: string;
  permission: "read" | "write" | "admin";
  created_at: string;
}

export interface ClerkUser {
  id: string;
  email: string | null;
  name: string | null;
  role: string;
  created_at: string;
}

export interface CreateProviderInput {
  id: string;
  name: string;
  endpoint_url: string;
  access_key_id: string;
  secret_access_key: string;
  region?: string;
}

export interface CreateBucketInput {
  bucket_name: string;
  provider_id: string;
  remote_bucket_name: string;
}

export interface CreateKeyInput {
  user_id: string;
  name?: string;
  expiration?: string;
}

export interface CreateKeyResponse {
  access_key_id: string;
  secret_key: string;
  name: string | null;
  user_id: string;
}

export interface UpdateAclInput {
  bucket_name: string;
  permission: "read" | "write" | "admin";
}
