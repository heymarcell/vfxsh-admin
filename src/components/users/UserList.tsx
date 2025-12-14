import { useState, useMemo } from "react";
import { useUsers } from "../../api/users";
import Table, { TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/Table";
import { FolderOpen, Key, Shield, Search, X } from "lucide-react";
import Button from "../ui/Button";

export default function UserList() {
  const { data: users, isLoading } = useUsers();
  const [search, setSearch] = useState("");
  const [viewingGroupsFor, setViewingGroupsFor] = useState<any>(null);

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
    <>
      {/* Groups Modal */}
      {viewingGroupsFor && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setViewingGroupsFor(null)}>
          <div className="bg-card border border-border rounded-xl p-6 max-w-md w-full mx-4 max-h-[80vh] overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">
                Groups for {viewingGroupsFor.email || viewingGroupsFor.name}
              </h3>
              <Button variant="ghost" size="icon" onClick={() => setViewingGroupsFor(null)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-2 max-h-[60vh] overflow-y-auto">
              {viewingGroupsFor.groups?.map((g: any) => (
                <div key={g.id} className="flex items-center gap-2 p-2 rounded-lg bg-muted/30">
                  <Shield className="h-4 w-4 text-purple-400" />
                  <span className="font-medium">{g.name}</span>
                  <span className="text-xs text-muted-foreground ml-auto font-mono">{g.id}</span>
                </div>
              ))}
              {!viewingGroupsFor.groups?.length && (
                <p className="text-muted-foreground text-center py-4">No groups</p>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by email or name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full max-w-sm pl-10 pr-4 py-2 rounded-lg border border-border bg-background text-sc focus:outline-none focus:ring-2 focus:ring-ring"
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
                      {user.groups && user.groups.length > 0 ? (
                        <button
                          onClick={() => setViewingGroupsFor(user)}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 transition-colors cursor-pointer"
                        >
                          <Shield className="h-3 w-3" />
                          {user.groups.length} group{user.groups.length !== 1 ? "s" : ""}
                        </button>
                      ) : (
                        <span className="text-muted-foreground text-xs">—</span>
                      )}
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
    </>
  );
}
