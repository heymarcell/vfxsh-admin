export interface Provider {
  id: string;
  name: string;
  description?: string;
  type: "s3" | "r2" | "minio" | "gcs";
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
  allowed_buckets: {
    bucket_name: string;
    permission: "read" | "write" | "admin";
  }[];
}

export interface ClerkUser {
  id: string;
  email_addresses: { email_address: string }[];
  last_sign_in_at: number | null;
}

export interface CreateProviderInput {
  name: string;
  type: "s3" | "r2" | "minio" | "gcs";
  description?: string;
  endpoint_url: string;
  region: string;
  access_key_id: string;
  secret_access_key: string;
  enabled?: boolean;
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
  secret_access_key: string;
  status: string;
  name: string | null;
  user_id: string;
}

export interface UpdateAclInput {
  bucket_name: string;
  permission: "read" | "write" | "admin";
}
