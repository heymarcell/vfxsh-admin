import { useUsers } from "../../api/users";
import Table, { TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/Table";
import { FolderOpen, Key, Shield } from "lucide-react";

export default function UserList() {
  const { data: users, isLoading } = useUsers();

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
          {users.map((user: any) => (
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
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
