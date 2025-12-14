/**
 * Platform Users Page - Super Admin Only
 * Manage super admin status for users
 */
import { useState } from "react";
import { Shield, ShieldCheck, Search, Users } from "lucide-react";
import { usePlatformUsers, useSetSuperAdmin } from "../../api/platform";
import Input from "../../components/ui/Input";

export default function PlatformUsers() {
  const { data: users, isLoading } = usePlatformUsers();
  const setSuperAdmin = useSetSuperAdmin();
  const [search, setSearch] = useState("");

  const filteredUsers = users?.filter(user => 
    user.email.toLowerCase().includes(search.toLowerCase()) ||
    user.name?.toLowerCase().includes(search.toLowerCase())
  );

  const handleToggleSuperAdmin = async (userId: string, currentStatus: boolean) => {
    await setSuperAdmin.mutateAsync({ userId, isSuperAdmin: !currentStatus });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">All Users</h1>
        </div>
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-16 rounded-lg border border-border bg-card/50 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">All Users</h1>
        <div className="text-sm text-muted-foreground">
          {users?.length} total users • {users?.filter(u => u.is_super_admin).length} super admins
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search users..."
          className="pl-9"
        />
      </div>

      {/* Users Table */}
      <div className="rounded-lg border border-border overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">User</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Organizations</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Joined</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Super Admin</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filteredUsers?.map((user) => (
              <tr key={user.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3">
                  <div>
                    <p className="font-medium">{user.email}</p>
                    {user.name && (
                      <p className="text-sm text-muted-foreground">{user.name}</p>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    {user.org_count} org{user.org_count !== 1 ? 's' : ''}
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-muted-foreground">
                  {new Date(user.created_at).toLocaleDateString()}
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => handleToggleSuperAdmin(user.id, !!user.is_super_admin)}
                    disabled={setSuperAdmin.isPending}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                      user.is_super_admin
                        ? "bg-purple-500/20 text-purple-300 border border-purple-500/30 hover:bg-purple-500/30"
                        : "bg-muted text-muted-foreground hover:bg-muted/80 border border-transparent"
                    }`}
                  >
                    {user.is_super_admin ? (
                      <>
                        <ShieldCheck className="h-4 w-4" />
                        Super Admin
                      </>
                    ) : (
                      <>
                        <Shield className="h-4 w-4" />
                        Regular User
                      </>
                    )}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredUsers?.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-4 opacity-30" />
            <p>No users found</p>
          </div>
        )}
      </div>
    </div>
  );
}
