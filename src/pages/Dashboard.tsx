import { Database, FolderOpen, Key, Users, ArrowRight, Shield } from "lucide-react";
import { Link } from "react-router-dom";
import { useProviders } from "../api/providers";
import { useBuckets } from "../api/buckets";
import { useAccessKeys } from "../api/keys";
import { useUsers } from "../api/users";
import { useGroups } from "../api/groups";
import Card, { CardContent, CardHeader } from "../components/ui/Card";

export default function Dashboard() {
  const { data: providers } = useProviders();
  const { data: buckets } = useBuckets();
  const { data: keys } = useAccessKeys();
  const { data: users } = useUsers();
  const { data: groups } = useGroups();

  const stats = [
    {
      label: "Active Providers",
      value: providers?.filter(p => p.enabled).length ?? 0,
      total: providers?.length ?? 0,
      icon: Database,
      href: "/providers",
    },
    {
      label: "Bucket Mappings",
      value: buckets?.length ?? 0,
      icon: FolderOpen,
      href: "/buckets",
    },
    {
      label: "Active Keys",
      value: keys?.length ?? 0,
      icon: Key,
      href: "/keys",
    },
    {
      label: "User Groups",
      value: groups?.length ?? 0,
      icon: Shield,
      href: "/groups",
    },
    {
      label: "Total Users",
      value: users?.length ?? 0,
      icon: Users,
      href: "/users",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-2">Overview of your VFX storage infrastructure.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link key={stat.label} to={stat.href} className="group">
              <Card className="transition-all hover:bg-muted/50 hover:border-primary/50">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 border-none">
                  <span className="text-sm font-medium text-muted-foreground group-hover:text-primary transition-colors">
                    {stat.label}
                  </span>
                  <Icon className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {stat.value}
                    {stat.total !== undefined && (
                      <span className="text-sm font-normal text-muted-foreground ml-1">
                        / {stat.total}
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <h3 className="font-semibold text-lg">Quick Access</h3>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Link to="/providers" className="block p-4 rounded-lg bg-muted/30 border border-border/50 hover:bg-muted/80 hover:border-primary/50 transition-all group">
                <div className="flex items-center justify-between mb-2">
                  <Database className="h-5 w-5 text-primary" />
                  <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                </div>
                <div className="font-medium">Manage Storage Providers</div>
                <div className="text-sm text-muted-foreground mt-1">Configure AWS S3, Cloudflare R2, or MinIO connections.</div>
              </Link>
              
              <Link to="/buckets" className="block p-4 rounded-lg bg-muted/30 border border-border/50 hover:bg-muted/80 hover:border-primary/50 transition-all group">
                <div className="flex items-center justify-between mb-2">
                  <FolderOpen className="h-5 w-5 text-primary" />
                  <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                </div>
                <div className="font-medium">Configure Buckets</div>
                <div className="text-sm text-muted-foreground mt-1">Map remote buckets to virtual paths for your artists.</div>
              </Link>

              <Link to="/groups" className="block p-4 rounded-lg bg-muted/30 border border-border/50 hover:bg-muted/80 hover:border-primary/50 transition-all group">
                <div className="flex items-center justify-between mb-2">
                  <Shield className="h-5 w-5 text-primary" />
                  <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                </div>
                <div className="font-medium">Manage Groups</div>
                <div className="text-sm text-muted-foreground mt-1">Manage teams and their permissions.</div>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
             <h3 className="font-semibold text-lg">System Status</h3>
          </CardHeader>
          <CardContent>
             <div className="space-y-4">
               <div className="flex items-center justify-between">
                 <span className="text-sm text-muted-foreground">API Status</span>
                 <span className="flex items-center gap-2 text-sm text-green-500 bg-green-500/10 px-2 py-1 rounded-full">
                   <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                   Operational
                 </span>
               </div>
               <div className="flex items-center justify-between">
                 <span className="text-sm text-muted-foreground">Version</span>
                 <span className="font-mono text-sm">v1.0.0</span>
               </div>
               <div className="flex items-center justify-between">
                 <span className="text-sm text-muted-foreground">Environment</span>
                 <span className="text-sm font-medium">Production</span>
               </div>
             </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

