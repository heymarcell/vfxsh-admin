import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { useApiClient } from '../api/client';

export interface Organization {
  id: string;
  name: string;
  role_name: string;
}

interface OrganizationContextType {
  organizations: Organization[];
  currentOrg: Organization | null;
  setCurrentOrg: (org: Organization) => void;
  isLoading: boolean;
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
    // Force reload via window.location to ensure all query clients reset? 
    // Or just rely on React state updates?
    // Using React State is better UX.
  };

  return (
    <OrganizationContext.Provider value={{ organizations, currentOrg, setCurrentOrg: handleSetOrg, isLoading }}>
      {children}
    </OrganizationContext.Provider>
  );
}

export const useOrganization = () => {
  const ctx = useContext(OrganizationContext);
  if (!ctx) throw new Error("useOrganization must be used within OrganizationProvider");
  return ctx;
};
