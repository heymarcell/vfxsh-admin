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
        <header className="sticky top-0 h-16 bg-slate-800 border-b border-slate-700 flex items-center justify-end px-6 z-10">
          <UserButton afterSignOutUrl="/" />
        </header>

        {/* Page content */}
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
