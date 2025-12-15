import { createContext, useContext, useState, useEffect, useMemo, type ReactNode } from 'react';
import { useApiClient } from '../api/client';

export interface Organization {
  id: string;
  name: string;
  role_name: 'owner' | 'admin' | 'member' | 'viewer';
}

export type Permission = 
  | 'org:manage'
  | 'org:delete'
  | 'bucket:read'
  | 'bucket:write'
  | 'virtual-bucket:create'
  | 'virtual-bucket:delete'
  | 'provider:read'
  | 'acl:manage'
  | 'group:manage'
  | 'member:invite'
  | 'member:remove'
  | 'member:change-role'
  | 'key:manage'
  | 'key:own'
  | 'audit:read';

const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  owner: [
    'org:manage', 'org:delete',
    'bucket:read', 'bucket:write',
    'virtual-bucket:create', 'virtual-bucket:delete',
    'provider:read',
    'acl:manage',
    'group:manage',
    'member:invite', 'member:remove', 'member:change-role',
    'key:manage', 'key:own',
    'audit:read'
  ],
  admin: [
    'bucket:read', 'bucket:write',
    'virtual-bucket:create', 'virtual-bucket:delete',
    'provider:read',
    'acl:manage',
    'group:manage',
    'member:invite', 'member:remove',
    'key:manage', 'key:own',
    'audit:read'
  ],
  member: [
    'bucket:read', 'bucket:write',
    'provider:read',
    'key:own'
  ],
  viewer: [
    'bucket:read',
    'provider:read'
  ]
};

interface OrganizationContextType {
  organizations: Organization[];
  currentOrg: Organization | null;
  setCurrentOrg: (org: Organization) => void;
  isLoading: boolean;
  hasPermission: (perm: Permission) => boolean;
  isOwner: boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
}

const OrganizationContext = createContext<OrganizationContextType | undefined>(undefined);

export function OrganizationProvider({ children }: { children: ReactNode }) {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [currentOrg, setCurrentOrg] = useState<Organization | null>(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const api = useApiClient();

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        // Load user info and orgs
        const meRes = await api.get('/me');
        if (!mounted) return;
        const orgs = meRes.data.organizations || [];
        setOrganizations(orgs);
        
        // Restore from storage or default
        const stored = localStorage.getItem('vfxsh_org_id');
        const found = orgs.find((o: Organization) => o.id === stored) || orgs[0] || null;
        
        if (found) {
          setCurrentOrg(found);
          localStorage.setItem('vfxsh_org_id', found.id);
        }

        // Check super admin status
        try {
          const statusRes = await api.get('/platform/status');
          if (mounted) {
            setIsSuperAdmin(statusRes.data?.isSuperAdmin || false);
          }
        } catch {
          // Not super admin or endpoint not available
          setIsSuperAdmin(false);
        }
      } catch (e) {
        console.error("Failed to load organizations", e);
      } finally {
        if (mounted) setIsLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, [api]);

  const handleSetOrg = (org: Organization) => {
    setCurrentOrg(org);
    localStorage.setItem('vfxsh_org_id', org.id);
  };

  const hasPermission = useMemo(() => {
    return (perm: Permission): boolean => {
      if (!currentOrg) return false;
      const perms = ROLE_PERMISSIONS[currentOrg.role_name] || [];
      return perms.includes(perm);
    };
  }, [currentOrg]);

  const isOwner = currentOrg?.role_name === 'owner';
  const isAdmin = currentOrg?.role_name === 'admin' || currentOrg?.role_name === 'owner';

  return (
    <OrganizationContext.Provider value={{ 
      organizations, 
      currentOrg, 
      setCurrentOrg: handleSetOrg, 
      isLoading, 
      hasPermission, 
      isOwner,
      isAdmin,
      isSuperAdmin
    }}>
      {children}
    </OrganizationContext.Provider>
  );
}

export const useOrganization = () => {
  const ctx = useContext(OrganizationContext);
  if (!ctx) throw new Error("useOrganization must be used within OrganizationProvider");
  return ctx;
};
