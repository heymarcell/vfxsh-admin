import { Database, FolderOpen, Key, Users } from "lucide-react";
import { useProviders } from "../api/providers";
import { useBuckets } from "../api/buckets";
import { useAccessKeys } from "../api/keys";
import { useUsers } from "../api/users";

export default function Dashboard() {
  const { data: providers } = useProviders();
  const { data: buckets } = useBuckets();
  const { data: keys } = useAccessKeys();
  const { data: users } = useUsers();

  const stats = [
    {
      label: "Providers",
      value: providers?.length ?? "-",
      icon: Database,
      color: "text-blue-400",
      bgColor: "bg-blue-400/10",
    },
    {
      label: "Buckets",
      value: buckets?.length ?? "-",
      icon: FolderOpen,
      color: "text-green-400",
      bgColor: "bg-green-400/10",
    },
    {
      label: "Access Keys",
      value: keys?.length ?? "-",
      icon: Key,
      color: "text-yellow-400",
      bgColor: "bg-yellow-400/10",
    },
    {
      label: "Users",
      value: users?.length ?? "-",
      icon: Users,
      color: "text-purple-400",
      bgColor: "bg-purple-400/10",
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="bg-slate-800 rounded-lg p-6 border border-slate-700"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">{stat.label}</p>
                  <p className="text-3xl font-bold mt-1">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <Icon className={stat.color} size={24} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 bg-slate-800 rounded-lg p-6 border border-slate-700">
        <h2 className="text-lg font-semibold mb-4">Quick Start</h2>
        <div className="space-y-3 text-slate-400">
          <p>
            <span className="text-purple-400 font-mono">1.</span> Add a storage
            provider (e.g., Cloudflare R2, AWS S3)
          </p>
          <p>
            <span className="text-purple-400 font-mono">2.</span> Create bucket
            mappings to expose storage
          </p>
          <p>
            <span className="text-purple-400 font-mono">3.</span> Generate
            access keys for users
          </p>
          <p>
            <span className="text-purple-400 font-mono">4.</span> Configure user
            permissions per bucket
          </p>
        </div>
      </div>
    </div>
  );
}
