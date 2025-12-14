import { UserButton } from "@clerk/clerk-react";
import { Link, useLocation } from "react-router-dom";
import {
  Database,
  Key,
  Users,
  FolderOpen,
  LayoutDashboard,
  Box,
  Group,
  Shield,
  UserCog,
  Building2,
  FileText,
  Layers
} from "lucide-react";
import { cn } from "../../lib/utils";
import { ModeToggle } from "./ModeToggle";
import { OrgSwitcher } from "./OrgSwitcher";
import { useOrganization } from "../../context/OrganizationContext";
import { useMemo } from "react";

type NavVisibility = 'always' | 'superAdmin' | 'orgAdmin' | 'member';

interface NavItem {
  path: string;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  show: NavVisibility;
}

const navItems: NavItem[] = [
  { path: "/", label: "Dashboard", icon: LayoutDashboard, show: "always" },
  // Super Admin only
  { path: "/platform/providers", label: "Providers", icon: Database, show: "superAdmin" },
  { path: "/platform/buckets", label: "Source Buckets", icon: FolderOpen, show: "superAdmin" },
  { path: "/platform/organizations", label: "Organizations", icon: Building2, show: "superAdmin" },
  { path: "/platform/users", label: "All Users", icon: Users, show: "superAdmin" },
  { path: "/platform/audit", label: "Audit Log", icon: FileText, show: "superAdmin" },
  // Org Admin (owner/admin)
  { path: "/buckets", label: "Virtual Buckets", icon: Layers, show: "orgAdmin" },
  { path: "/groups", label: "Groups", icon: Group, show: "orgAdmin" },
  { path: "/members", label: "Members", icon: UserCog, show: "orgAdmin" },
  { path: "/permissions", label: "Permissions", icon: Shield, show: "orgAdmin" },
  // Member+
  { path: "/keys", label: "Access Keys", icon: Key, show: "member" },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const { isSuperAdmin, isAdmin } = useOrganization();

  const filteredNavItems = useMemo(() => {
    return navItems.filter(item => {
      switch (item.show) {
        case 'always':
          return true;
        case 'superAdmin':
          return isSuperAdmin;
        case 'orgAdmin':
          return isAdmin; // owner or admin
        case 'member':
          return true; // everyone can see member items (but backend will restrict)
        default:
          return false;
      }
    });
  }, [isSuperAdmin, isAdmin]);

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 border-r border-border bg-card/50 backdrop-blur-xl z-20">
        <div className="flex h-16 items-center border-b border-border px-6">
          <Link to="/" className="flex items-center gap-2 font-bold text-lg">
             <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
               <Box className="h-5 w-5" />
             </div>
             <span>VFX Admin</span>
          </Link>
        </div>
        <nav className="p-4 space-y-1">
          {filteredNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>
        
        {/* Super Admin Badge */}
        {isSuperAdmin && (
          <div className="absolute bottom-4 left-4 right-4">
            <div className="px-3 py-2 rounded-lg bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30">
              <p className="text-xs font-medium text-purple-300">Super Admin</p>
            </div>
          </div>
        )}
      </aside>

      {/* Main content */}
      <div className="ml-64 flex-1 min-h-screen flex flex-col">
        {/* Header */}
        <header className="sticky top-0 z-10 h-16 border-b border-border bg-background/80 backdrop-blur-md px-6 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              {filteredNavItems.find(i => i.path === location.pathname)?.label || "Dashboard"}
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <OrgSwitcher />
            <ModeToggle />
            <UserButton 
              afterSignOutUrl="/" 
              appearance={{
                elements: {
                  avatarBox: "h-8 w-8"
                }
              }}
            />
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6 md:p-8 animate-in fade-in duration-300">
           <div className="mx-auto max-w-6xl space-y-6">
             {children}
           </div>
        </main>
      </div>
    </div>
  );
}
