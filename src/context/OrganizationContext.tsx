import { createContext, useContext, useState, useEffect, useMemo, type ReactNode } from 'react';
import { useApiClient } from '../api/client';

export interface Organization {
  id: string;
  name: string;
  role_name: 'owner' | 'member' | 'viewer';
}

type Permission = 
  | 'org:manage'
  | 'bucket:create'
  | 'bucket:read'
  | 'bucket:write'
  | 'bucket:delete'
  | 'provider:manage'
  | 'provider:read'
  | 'acl:manage'
  | 'group:manage';

const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  owner: [
    'org:manage',
    'bucket:create', 'bucket:read', 'bucket:write', 'bucket:delete',
    'provider:manage', 'provider:read',
    'acl:manage',
    'group:manage'
  ],
  member: ['bucket:read', 'bucket:write', 'provider:read'],
  viewer: ['bucket:read', 'provider:read'],
};

interface OrganizationContextType {
  organizations: Organization[];
  currentOrg: Organization | null;
  setCurrentOrg: (org: Organization) => void;
  isLoading: boolean;
  hasPermission: (perm: Permission) => boolean;
  isOwner: boolean;
}

const OrganizationContext = createContext<OrganizationContextType | undefined>(undefined);

export function OrganizationProvider({ children }: { children: ReactNode }) {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [currentOrg, setCurrentOrg] = useState<Organization | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const api = useApiClient();

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const res = await api.get('/me');
        if (!mounted) return;
        const orgs = res.data.organizations || [];
        setOrganizations(orgs);
        
        // Restore from storage or default
        const stored = localStorage.getItem('vfxsh_org_id');
        const found = orgs.find((o: Organization) => o.id === stored) || orgs[0] || null;
        
        if (found) {
          setCurrentOrg(found);
          localStorage.setItem('vfxsh_org_id', found.id);
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

  return (
    <OrganizationContext.Provider value={{ organizations, currentOrg, setCurrentOrg: handleSetOrg, isLoading, hasPermission, isOwner }}>
      {children}
    </OrganizationContext.Provider>
  );
}

export const useOrganization = () => {
  const ctx = useContext(OrganizationContext);
  if (!ctx) throw new Error("useOrganization must be used within OrganizationProvider");
  return ctx;
};
