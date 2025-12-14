# VFX Admin Panel - Bootstrap Guide

> Complete guide to bootstrap the `admin.vfx.sh` frontend that connects to `api.vfx.sh`

## Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                      admin.vfx.sh                               │
│                     (This Frontend)                             │
├─────────────────────────────────────────────────────────────────┤
│  • React/Vite + TypeScript                                      │
│  • Clerk for authentication                                     │
│  • TanStack Query for API calls                                 │
│  • Tailwind CSS for styling                                     │
│  • Cloudflare Pages for hosting                                 │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      api.vfx.sh                                 │
│                     (vfxsh-worker)                              │
├─────────────────────────────────────────────────────────────────┤
│  Endpoints:                                                     │
│  • GET/POST /providers     - Storage providers                  │
│  • GET/POST /buckets       - Bucket mappings                    │
│  • GET/POST /keys          - S3 access keys                     │
│  • GET/PUT  /users/:id/acl - User permissions                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 1. Tech Stack

| Category       | Technology            | Why                                |
| -------------- | --------------------- | ---------------------------------- |
| **Framework**  | React 18 + Vite       | Fast dev, modern tooling           |
| **Language**   | TypeScript            | Type safety with API               |
| **Auth**       | Clerk React SDK       | Already configured for vfx.sh      |
| **API Client** | TanStack Query        | Caching, loading states, mutations |
| **Styling**    | Tailwind CSS          | Rapid UI development               |
| **Icons**      | Lucide React          | Clean, consistent icons            |
| **Forms**      | React Hook Form + Zod | Validation matching API            |
| **Tables**     | TanStack Table        | Sortable, filterable data          |
| **Hosting**    | Cloudflare Pages      | Edge deployment, easy DNS          |

---

## 2. Project Setup

### 2.1 Create New Project

```bash
# Create with Vite
npx create-vite vfxsh-admin --template react-ts
cd vfxsh-admin

# Install dependencies
npm install @clerk/clerk-react @tanstack/react-query axios
npm install tailwindcss postcss autoprefixer
npm install lucide-react react-hook-form @hookform/resolvers zod
npm install @tanstack/react-table react-router-dom

# Initialize Tailwind
npx tailwindcss init -p
```

### 2.2 Project Structure

```
vfxsh-admin/
├── src/
│   ├── api/
│   │   ├── client.ts         # Axios instance with Clerk auth
│   │   ├── providers.ts      # Provider API hooks
│   │   ├── buckets.ts        # Bucket API hooks
│   │   ├── keys.ts           # Access keys API hooks
│   │   └── users.ts          # User ACL API hooks
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Header.tsx
│   │   │   └── Layout.tsx
│   │   ├── providers/
│   │   │   ├── ProviderList.tsx
│   │   │   ├── ProviderForm.tsx
│   │   │   └── ProviderCard.tsx
│   │   ├── buckets/
│   │   │   ├── BucketList.tsx
│   │   │   └── BucketForm.tsx
│   │   ├── keys/
│   │   │   ├── KeyList.tsx
│   │   │   ├── KeyForm.tsx
│   │   │   └── KeySecret.tsx   # Show secret once on creation
│   │   └── ui/
│   │       ├── Button.tsx
│   │       ├── Input.tsx
│   │       ├── Card.tsx
│   │       ├── Modal.tsx
│   │       └── Table.tsx
│   ├── pages/
│   │   ├── Dashboard.tsx
│   │   ├── Providers.tsx
│   │   ├── Buckets.tsx
│   │   ├── Keys.tsx
│   │   └── Users.tsx
│   ├── hooks/
│   │   └── useAuth.ts        # Clerk auth hook wrapper
│   ├── types/
│   │   └── api.ts            # API response types
│   ├── lib/
│   │   └── utils.ts          # Utility functions
│   ├── App.tsx
│   └── main.tsx
├── public/
├── .env                      # Local env vars
├── .env.production           # Production env vars
├── tailwind.config.js
├── vite.config.ts
└── package.json
```

---

## 3. Environment Variables

### `.env` (development)

```env
VITE_CLERK_PUBLISHABLE_KEY=pk_live_Y2xlcmsudmZ4LnNoJA
VITE_API_URL=https://api.vfx.sh
```

### `.env.production`

```env
VITE_CLERK_PUBLISHABLE_KEY=pk_live_Y2xlcmsudmZ4LnNoJA
VITE_API_URL=https://api.vfx.sh
```

---

## 4. Clerk Integration

### 4.1 Main Entry (`src/main.tsx`)

```tsx
import React from "react";
import ReactDOM from "react-dom/client";
import { ClerkProvider } from "@clerk/clerk-react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!clerkPubKey) {
  throw new Error("Missing Clerk Publishable Key");
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60, // 1 minute
      retry: 1,
    },
  },
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ClerkProvider publishableKey={clerkPubKey}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </QueryClientProvider>
    </ClerkProvider>
  </React.StrictMode>
);
```

### 4.2 Protected Routes (`src/App.tsx`)

```tsx
import { SignedIn, SignedOut, RedirectToSignIn } from "@clerk/clerk-react";
import { Routes, Route } from "react-router-dom";
import Layout from "./components/layout/Layout";
import Dashboard from "./pages/Dashboard";
import Providers from "./pages/Providers";
import Buckets from "./pages/Buckets";
import Keys from "./pages/Keys";
import Users from "./pages/Users";

export default function App() {
  return (
    <>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
      <SignedIn>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/providers" element={<Providers />} />
            <Route path="/buckets" element={<Buckets />} />
            <Route path="/keys" element={<Keys />} />
            <Route path="/users" element={<Users />} />
          </Routes>
        </Layout>
      </SignedIn>
    </>
  );
}
```

---

## 5. API Client

### 5.1 Axios Instance (`src/api/client.ts`)

```tsx
import axios from "axios";
import { useAuth } from "@clerk/clerk-react";

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

  const authApi = axios.create({
    baseURL: API_URL,
    headers: {
      "Content-Type": "application/json",
    },
  });

  authApi.interceptors.request.use(async (config) => {
    const token = await getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  return authApi;
}
```

### 5.2 Provider Hooks (`src/api/providers.ts`)

```tsx
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useApiClient } from "./client";

export interface Provider {
  id: string;
  name: string;
  endpoint_url: string;
  region: string;
  enabled: boolean;
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

export function useProviders() {
  const api = useApiClient();

  return useQuery({
    queryKey: ["providers"],
    queryFn: async () => {
      const { data } = await api.get<{ providers: Provider[] }>("/providers");
      return data.providers;
    },
  });
}

export function useCreateProvider() {
  const api = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateProviderInput) => {
      const { data } = await api.post("/providers", input);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["providers"] });
    },
  });
}

export function useDeleteProvider() {
  const api = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/providers/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["providers"] });
    },
  });
}
```

### 5.3 Bucket Hooks (`src/api/buckets.ts`)

```tsx
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useApiClient } from "./client";

export interface Bucket {
  bucket_name: string;
  provider_id: string;
  remote_bucket_name: string;
  provider_name: string;
  created_at: string;
}

export interface CreateBucketInput {
  bucket_name: string;
  provider_id: string;
  remote_bucket_name: string;
}

export function useBuckets() {
  const api = useApiClient();

  return useQuery({
    queryKey: ["buckets"],
    queryFn: async () => {
      const { data } = await api.get<{ buckets: Bucket[] }>("/buckets");
      return data.buckets;
    },
  });
}

export function useCreateBucket() {
  const api = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateBucketInput) => {
      const { data } = await api.post("/buckets", input);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["buckets"] });
    },
  });
}

export function useDeleteBucket() {
  const api = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (name: string) => {
      await api.delete(`/buckets/${name}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["buckets"] });
    },
  });
}
```

### 5.4 Access Keys Hooks (`src/api/keys.ts`)

```tsx
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useApiClient } from "./client";

export interface AccessKey {
  access_key_id: string;
  name: string | null;
  user_id: string;
  user_email: string | null;
  enabled: boolean;
  expiration: string | null;
  created_at: string;
}

export interface CreateKeyInput {
  user_id: string;
  name?: string;
  expiration?: string;
}

export interface CreateKeyResponse {
  access_key_id: string;
  secret_key: string; // Only returned on creation!
  name: string | null;
  user_id: string;
}

export function useAccessKeys() {
  const api = useApiClient();

  return useQuery({
    queryKey: ["keys"],
    queryFn: async () => {
      const { data } = await api.get<{ keys: AccessKey[] }>("/keys");
      return data.keys;
    },
  });
}

export function useCreateAccessKey() {
  const api = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateKeyInput) => {
      const { data } = await api.post<CreateKeyResponse>("/keys", input);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["keys"] });
    },
  });
}

export function useDeleteAccessKey() {
  const api = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (keyId: string) => {
      await api.delete(`/keys/${keyId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["keys"] });
    },
  });
}
```

---

## 6. Key Components

### 6.1 Layout (`src/components/layout/Layout.tsx`)

```tsx
import { UserButton } from "@clerk/clerk-react";
import { Link, useLocation } from "react-router-dom";
import {
  Database,
  Key,
  Users,
  FolderOpen,
  LayoutDashboard,
} from "lucide-react";

const navItems = [
  { path: "/", label: "Dashboard", icon: LayoutDashboard },
  { path: "/providers", label: "Providers", icon: Database },
  { path: "/buckets", label: "Buckets", icon: FolderOpen },
  { path: "/keys", label: "Access Keys", icon: Key },
  { path: "/users", label: "Users", icon: Users },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-slate-800 border-r border-slate-700">
        <div className="p-6">
          <h1 className="text-xl font-bold text-purple-400">🎬 VFX Admin</h1>
        </div>
        <nav className="px-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-colors ${
                  isActive
                    ? "bg-purple-600 text-white"
                    : "text-slate-400 hover:bg-slate-700 hover:text-white"
                }`}
              >
                <Icon size={20} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main content */}
      <div className="ml-64">
        {/* Header */}
        <header className="sticky top-0 h-16 bg-slate-800 border-b border-slate-700 flex items-center justify-end px-6">
          <UserButton afterSignOutUrl="/" />
        </header>

        {/* Page content */}
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
```

### 6.2 Provider List Page (`src/pages/Providers.tsx`)

```tsx
import { useState } from "react";
import { Plus, Trash2, ExternalLink } from "lucide-react";
import { useProviders, useDeleteProvider } from "../api/providers";
import ProviderForm from "../components/providers/ProviderForm";

export default function Providers() {
  const [showForm, setShowForm] = useState(false);
  const { data: providers, isLoading, error } = useProviders();
  const deleteProvider = useDeleteProvider();

  if (isLoading) return <div className="text-slate-400">Loading...</div>;
  if (error) return <div className="text-red-400">Error loading providers</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Storage Providers</h1>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg"
        >
          <Plus size={20} />
          Add Provider
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {providers?.map((provider) => (
          <div
            key={provider.id}
            className="bg-slate-800 rounded-lg p-6 border border-slate-700"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-semibold text-lg">{provider.name}</h3>
                <p className="text-slate-400 text-sm">{provider.id}</p>
              </div>
              <span
                className={`px-2 py-1 rounded text-xs ${
                  provider.enabled
                    ? "bg-green-900 text-green-400"
                    : "bg-red-900 text-red-400"
                }`}
              >
                {provider.enabled ? "Active" : "Disabled"}
              </span>
            </div>

            <div className="space-y-2 text-sm text-slate-400">
              <p className="flex items-center gap-2">
                <ExternalLink size={14} />
                {provider.endpoint_url}
              </p>
              <p>Region: {provider.region}</p>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-700">
              <button
                onClick={() => {
                  if (confirm("Delete this provider?")) {
                    deleteProvider.mutate(provider.id);
                  }
                }}
                className="text-red-400 hover:text-red-300 flex items-center gap-2 text-sm"
              >
                <Trash2 size={14} />
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {showForm && <ProviderForm onClose={() => setShowForm(false)} />}
    </div>
  );
}
```

### 6.3 Access Key Creation with Secret Display

```tsx
// src/components/keys/KeySecret.tsx
import { useState } from "react";
import { Copy, Check, AlertTriangle } from "lucide-react";

interface KeySecretProps {
  accessKeyId: string;
  secretKey: string;
  onClose: () => void;
}

export default function KeySecret({
  accessKeyId,
  secretKey,
  onClose,
}: KeySecretProps) {
  const [copied, setCopied] = useState<"access" | "secret" | null>(null);

  const copyToClipboard = async (text: string, type: "access" | "secret") => {
    await navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-slate-800 rounded-lg p-6 max-w-lg w-full mx-4 border border-slate-700">
        <div className="flex items-center gap-3 text-yellow-400 mb-4">
          <AlertTriangle size={24} />
          <h2 className="text-lg font-semibold">Save Your Credentials</h2>
        </div>

        <p className="text-slate-400 mb-6">
          The secret key will only be shown once. Copy it now and store it
          securely.
        </p>

        <div className="space-y-4">
          <div>
            <label className="text-sm text-slate-400">Access Key ID</label>
            <div className="flex items-center gap-2 mt-1">
              <code className="flex-1 bg-slate-900 px-3 py-2 rounded font-mono text-sm">
                {accessKeyId}
              </code>
              <button
                onClick={() => copyToClipboard(accessKeyId, "access")}
                className="p-2 hover:bg-slate-700 rounded"
              >
                {copied === "access" ? (
                  <Check size={18} className="text-green-400" />
                ) : (
                  <Copy size={18} />
                )}
              </button>
            </div>
          </div>

          <div>
            <label className="text-sm text-slate-400">Secret Access Key</label>
            <div className="flex items-center gap-2 mt-1">
              <code className="flex-1 bg-slate-900 px-3 py-2 rounded font-mono text-sm break-all">
                {secretKey}
              </code>
              <button
                onClick={() => copyToClipboard(secretKey, "secret")}
                className="p-2 hover:bg-slate-700 rounded"
              >
                {copied === "secret" ? (
                  <Check size={18} className="text-green-400" />
                ) : (
                  <Copy size={18} />
                )}
              </button>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full mt-6 bg-purple-600 hover:bg-purple-700 py-2 rounded-lg"
        >
          I've Saved My Credentials
        </button>
      </div>
    </div>
  );
}
```

---

## 7. Tailwind Configuration

```js
// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        slate: {
          850: "#1a1f2e",
        },
      },
    },
  },
  plugins: [],
};
```

```css
/* src/index.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  @apply bg-slate-900 text-white antialiased;
}
```

---

## 8. Cloudflare Pages Deployment

### 8.1 Create `wrangler.toml` (optional for local dev)

```toml
name = "vfxsh-admin"
compatibility_date = "2024-01-01"
pages_build_output_dir = "./dist"
```

### 8.2 Build Configuration

For Cloudflare Pages dashboard:

| Setting                    | Value           |
| -------------------------- | --------------- |
| **Framework preset**       | Vite            |
| **Build command**          | `npm run build` |
| **Build output directory** | `dist`          |
| **Root directory**         | `/`             |

### 8.3 Environment Variables in Cloudflare

Add in Pages dashboard → Settings → Environment variables:

| Variable                     | Value                        |
| ---------------------------- | ---------------------------- |
| `VITE_CLERK_PUBLISHABLE_KEY` | `pk_live_Y2xlcmsudmZ4LnNoJA` |
| `VITE_API_URL`               | `https://api.vfx.sh`         |

### 8.4 Custom Domain

1. Go to Pages project → Custom domains
2. Add `admin.vfx.sh`
3. Follow DNS setup instructions (CNAME to `*.pages.dev`)

---

## 9. Feature Checklist

### Phase 1: Core Admin

- [ ] Project setup with Vite + React + TypeScript
- [ ] Clerk authentication integration
- [ ] Layout with sidebar navigation
- [ ] Dashboard with stats overview

### Phase 2: Provider Management

- [ ] List all providers
- [ ] Create new provider (with credentials)
- [ ] Edit provider settings
- [ ] Delete provider (warn if buckets exist)

### Phase 3: Bucket Management

- [ ] List all buckets with provider info
- [ ] Create bucket mapping
- [ ] Delete bucket (warn about ACL cleanup)

### Phase 4: Access Key Management

- [ ] List all keys with user info
- [ ] Create new key (show secret once!)
- [ ] Delete key
- [ ] Key expiration handling

### Phase 5: User Management

- [ ] List Clerk users synced to D1
- [ ] View/edit user bucket ACLs
- [ ] Assign permissions (read/write/admin)

### Phase 6: Polish

- [ ] Loading states and error handling
- [ ] Toast notifications
- [ ] Confirmation modals for destructive actions
- [ ] Mobile responsive design

---

## 10. API Response Types

```typescript
// src/types/api.ts

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
```

---

## Quick Start Commands

```bash
# Create project
npx create-vite vfxsh-admin --template react-ts
cd vfxsh-admin

# Install all dependencies
npm install @clerk/clerk-react @tanstack/react-query axios \
  tailwindcss postcss autoprefixer lucide-react \
  react-hook-form @hookform/resolvers zod \
  @tanstack/react-table react-router-dom

# Initialize Tailwind
npx tailwindcss init -p

# Create env file
echo "VITE_CLERK_PUBLISHABLE_KEY=pk_live_Y2xlcmsudmZ4LnNoJA" > .env
echo "VITE_API_URL=https://api.vfx.sh" >> .env

# Start development
npm run dev
```

---

## Notes

1. **Secret Key Display**: The secret key is only returned when creating an access key. The UI must display it immediately and warn users to save it.

2. **Admin Role**: Currently all Clerk users can access the admin API. To restrict access, implement role checking in both the API (`routes/admin.ts`) and frontend.

3. **CORS**: The API already has CORS configured. If you have issues, check the `CORS_ALLOWED_ORIGINS` in the worker.

4. **Error Handling**: The API returns errors as `{"error": "message"}`. Handle these in your mutation error callbacks.
