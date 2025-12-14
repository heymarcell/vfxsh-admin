import { Edit2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useBuckets } from "../../api/buckets";
import { useUpdateUserAcl, useUserAcl, useUsers } from "../../api/users";
import type { UserAcl } from "../../types/api";
import Button from "../ui/Button";
import Modal from "../ui/Modal";
import Table, { TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/Table";

export default function UserList() {
  const { data: users, isLoading } = useUsers();
  const [editingUser, setEditingUser] = useState<string | null>(null);

  if (isLoading) return <div className="p-8 text-center text-muted-foreground">Loading users...</div>;

  return (
    <>
      <div className="rounded-lg border border-border overflow-hidden bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User ID</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Last Sign In</TableHead>
              <TableHead className="w-[100px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users?.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-mono text-xs text-muted-foreground">{user.id}</TableCell>
                <TableCell className="font-medium">
                  {user.email_addresses?.[0]?.email_address ?? "No Email"}
                </TableCell>
                <TableCell className="text-muted-foreground text-xs">
                  {user.last_sign_in_at
                    ? new Date(user.last_sign_in_at).toLocaleDateString()
                    : "Never"}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => setEditingUser(user.id)}
                  >
                    <Edit2 className="h-4 w-4" />
                    <span className="sr-only">Edit ACLs</span>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <UserAclModal
        userId={editingUser}
        isOpen={!!editingUser}
        onClose={() => setEditingUser(null)}
      />
    </>
  );
}

function UserAclModal({
  userId,
  isOpen,
  onClose,
}: {
  userId: string | null;
  isOpen: boolean;
  onClose: () => void;
}) {
  const { data: buckets } = useBuckets();
  const { data: acl } = useUserAcl(userId || "");
  const updateUserAcl = useUpdateUserAcl();
  
  const { register, handleSubmit } = useForm<{
    [bucketName: string]: string; // "read" | "write" | "admin" | "none"
  }>();

  const onSubmit = (data: Record<string, string>) => {
    if (!userId) return;

    // Transform form data to payload
    const payload: UserAcl = {
      allowed_buckets: [],
    };

    Object.entries(data).forEach(([bucket_name, permission]) => {
      if (typeof permission === 'string' && permission !== "none") {
        payload.allowed_buckets.push({
            bucket_name,
            permission: permission as "read" | "write" | "admin",
        });
      }
    });

    updateUserAcl.mutate(
      { userId, acl: payload },
      {
        onSuccess: () => {
          onClose();
        },
      }
    );
  };

  const currentPermissions = new Map(
    acl?.allowed_buckets?.map((b) => [b.bucket_name, b.permission]) || []
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Manage User Permissions">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-4">
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
            {!buckets?.length && <p className="text-sm text-muted-foreground text-center py-4">No buckets available.</p>}
            
            {buckets?.map((bucket) => {
              const currentPerm = currentPermissions.get(bucket.bucket_name) || "none";
              
              return (
              <div key={bucket.bucket_name} className="flex items-center justify-between space-x-4 border border-border p-3 rounded-md bg-muted/20">
                <div className="flex-1 space-y-1">
                  <p className="font-medium text-sm leading-none">{bucket.bucket_name}</p>
                  <p className="text-xs text-muted-foreground">{bucket.remote_bucket_name} {bucket.provider_name ? `on ${bucket.provider_name}` : ""}</p>
                </div>
                <select
                  className="h-8 w-[100px] rounded-md border border-input bg-background px-2 py-1 text-xs shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  defaultValue={currentPerm}
                  {...register(bucket.bucket_name)}
                >
                  <option value="none">No Access</option>
                  <option value="read">Read Only</option>
                  <option value="write">Read & Write</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            )})}
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={updateUserAcl.isPending}>
            Save Permissions
          </Button>
        </div>
      </form>
    </Modal>
  );
}
