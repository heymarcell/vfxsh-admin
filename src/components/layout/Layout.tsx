import { UserButton } from "@clerk/clerk-react";
import { Link, useLocation } from "react-router-dom";
import {
  Database,
  Key,
  Users,
  FolderOpen,
  LayoutDashboard,
  Box,
  Group
} from "lucide-react";
import { cn } from "../../lib/utils";
import { ModeToggle } from "./ModeToggle";

const navItems = [
  { path: "/", label: "Dashboard", icon: LayoutDashboard },
  { path: "/providers", label: "Providers", icon: Database },
  { path: "/buckets", label: "Buckets", icon: FolderOpen },
  { path: "/keys", label: "Access Keys", icon: Key },
  { path: "/groups", label: "Groups", icon: Group },
  { path: "/users", label: "Users", icon: Users },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();

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
          {navItems.map((item) => {
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
      </aside>

      {/* Main content */}
      <div className="ml-64 flex-1 min-h-screen flex flex-col">
        {/* Header */}
        <header className="sticky top-0 z-10 h-16 border-b border-border bg-background/80 backdrop-blur-md px-6 flex items-center justify-between">
          <div>
            {/* Breadcrumb-ish placeholder */}
            <h2 className="text-lg font-semibold text-foreground">
              {navItems.find(i => i.path === location.pathname)?.label || "Dashboard"}
            </h2>
          </div>
          <div className="flex items-center gap-4">
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
