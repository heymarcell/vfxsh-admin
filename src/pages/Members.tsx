import { useState } from "react";
import { useOrgMembers, useUpdateMemberRole, useRemoveMember } from "../api/members";
import { useOrganization } from "../context/OrganizationContext";
import { InviteUserModal } from "../components/users/InviteUserModal";
import Table, { TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/Table";
import RoleBadge from "../components/ui/RoleBadge";
import Button from "../components/ui/Button";
import { Users, Trash2, ChevronDown } from "lucide-react";

export default function Members() {
  const { data: members, isLoading } = useOrgMembers();
  const { currentOrg } = useOrganization();
  const updateRole = useUpdateMemberRole();
  const removeMember = useRemoveMember();
  
  const [editingUserId, setEditingUserId] = useState<string | null>(null);

  const handleRoleChange = async (userId: string, newRole: string) => {
    await updateRole.mutateAsync({ userId, role: newRole });
    setEditingUserId(null);
  };

  const handleRemove = async (userId: string, email: string) => {
    if (!confirm(`Remove ${email} from this organization?`)) return;
    await removeMember.mutateAsync(userId);
  };

  if (isLoading) {
    return <div className="p-8 text-center text-muted-foreground">Loading members...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <Users className="h-8 w-8 text-purple-400" />
            Organization Members
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage who has access to <span className="font-medium text-foreground">{currentOrg?.name || "this organization"}</span>
          </p>
        </div>
        <InviteUserModal />
      </div>

      {!members?.length ? (
        <div className="rounded-md border border-dashed border-border p-12 text-center">
          <Users className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-medium">No Members Yet</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Invite users to join this organization.
          </p>
        </div>
      ) : (
        <div className="rounded-lg border border-border overflow-hidden bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.map((member) => (
                <TableRow key={member.user_id}>
                  <TableCell className="font-medium">{member.email}</TableCell>
                  <TableCell className="text-muted-foreground">{member.name || "—"}</TableCell>
                  <TableCell>
                    {editingUserId === member.user_id ? (
                      <div className="relative inline-block">
                        <select
                          className="appearance-none bg-background border border-border rounded-md px-3 py-1.5 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-ring cursor-pointer"
                          defaultValue={member.role_name}
                          onChange={(e) => handleRoleChange(member.user_id, e.target.value)}
                          onBlur={() => setEditingUserId(null)}
                          autoFocus
                        >
                          <option value="owner">Owner</option>
                          <option value="member">Member</option>
                          <option value="viewer">Viewer</option>
                        </select>
                        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                      </div>
                    ) : (
                      <button
                        onClick={() => setEditingUserId(member.user_id)}
                        className="hover:opacity-80 transition-opacity"
                        title="Click to change role"
                      >
                        <RoleBadge role={member.role_name} />
                      </button>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {new Date(member.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => handleRemove(member.user_id, member.email)}
                      disabled={removeMember.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <div className="bg-muted/30 rounded-lg p-4 border border-border">
        <h4 className="font-medium mb-2">Role Permissions</h4>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <RoleBadge role="owner" className="mb-2" />
            <p className="text-muted-foreground">Full access: Manage org, buckets, providers, ACLs, and groups</p>
          </div>
          <div>
            <RoleBadge role="member" className="mb-2" />
            <p className="text-muted-foreground">Can read and write to buckets, view providers</p>
          </div>
          <div>
            <RoleBadge role="viewer" className="mb-2" />
            <p className="text-muted-foreground">Read-only access to buckets and providers</p>
          </div>
        </div>
      </div>
    </div>
  );
}
