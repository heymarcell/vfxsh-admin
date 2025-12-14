import { useState, useMemo } from "react";
import { useUsers } from "../../api/users";
import Table, { TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/Table";
import { FolderOpen, Key, Shield, Search } from "lucide-react";

export default function UserList() {
  const { data: users, isLoading } = useUsers();
  const [search, setSearch] = useState("");

  const filteredUsers = useMemo(() => {
    if (!users) return [];
    if (!search.trim()) return users;
    const q = search.toLowerCase();
    return users.filter((u: any) => 
      u.email?.toLowerCase().includes(q) || 
      u.name?.toLowerCase().includes(q)
    );
  }, [users, search]);

  if (isLoading) return <div className="p-8 text-center text-muted-foreground">Loading users...</div>;

  if (!users?.length) {
    return (
      <div className="rounded-md border border-dashed border-border p-12 text-center">
        <h3 className="text-lg font-medium">No Users</h3>
        <p className="text-sm text-muted-foreground mt-1">Users will appear here when they sign in.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search by email or name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-sm pl-10 pr-4 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>
      <div className="rounded-lg border border-border overflow-hidden bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Groups</TableHead>
              <TableHead>Buckets</TableHead>
              <TableHead>Keys</TableHead>
              <TableHead>Last Sign In</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                  No users match "{search}"
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user: any) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.email || "—"}</TableCell>
                  <TableCell className="text-muted-foreground">{user.name || "—"}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {user.groups?.length > 0 ? (
                        user.groups.slice(0, 3).map((g: { id: string; name: string }) => (
                          <span key={g.id} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-purple-500/20 text-purple-400">
                            <Shield className="h-3 w-3" />
                            {g.name}
                          </span>
                        ))
                      ) : (
                        <span className="text-muted-foreground text-xs">—</span>
                      )}
                      {user.groups?.length > 3 && (
                        <span className="text-xs text-muted-foreground">+{user.groups.length - 3}</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
                      <FolderOpen className="h-3.5 w-3.5" />
                      {user.bucket_count || 0}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
                      <Key className="h-3.5 w-3.5" />
                      {user.key_count || 0}
                    </span>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {user.last_sign_in_at
                      ? new Date(user.last_sign_in_at).toLocaleDateString()
                      : "Never"}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
