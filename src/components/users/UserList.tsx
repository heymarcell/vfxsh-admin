import { useState } from "react";
import { ChevronRight } from "lucide-react";
import { useUsers, useUserAcl, useUpdateUserAcl } from "../../api/users";
import { useBuckets } from "../../api/buckets";
import Table, { TableHeader, TableBody, TableRow, TableHead, TableCell } from "../ui/Table";
import Modal from "../ui/Modal";
import Button from "../ui/Button";
import type { UpdateAclInput } from "../../types/api";

export default function UserList() {
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const { data: users, isLoading, error } = useUsers();

  if (isLoading) {
    return (
      <div className="bg-slate-800 rounded-lg border border-slate-700 p-6 animate-pulse">
        <div className="h-4 bg-slate-700 rounded w-1/4 mb-4" />
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-8 bg-slate-700 rounded" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 text-red-400">
        <p>Failed to load users</p>
      </div>
    );
  }

  if (!users?.length) {
    return (
      <div className="text-center py-12 text-slate-400">
        <p>No users found</p>
        <p className="text-sm text-slate-500 mt-1">Users will appear here when they sign in</p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="w-16"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium text-white">
                  {user.email || "-"}
                </TableCell>
                <TableCell>{user.name || "-"}</TableCell>
                <TableCell>
                  <span className="px-2 py-0.5 rounded text-xs font-medium bg-purple-900/50 text-purple-400 border border-purple-800">
                    {user.role}
                  </span>
                </TableCell>
                <TableCell>
                  {new Date(user.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <button
                    onClick={() => setSelectedUserId(user.id)}
                    className="text-slate-400 hover:text-white p-1 transition-colors"
                  >
                    <ChevronRight size={16} />
                  </button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {selectedUserId && (
        <UserAclModal
          userId={selectedUserId}
          onClose={() => setSelectedUserId(null)}
        />
      )}
    </>
  );
}

function UserAclModal({ userId, onClose }: { userId: string; onClose: () => void }) {
  const { data: acl, isLoading } = useUserAcl(userId);
  const { data: buckets } = useBuckets();
  const updateAcl = useUpdateUserAcl(userId);
  const [permissions, setPermissions] = useState<Record<string, "read" | "write" | "admin" | null>>({});

  // Initialize permissions from current ACL
  useState(() => {
    if (acl) {
      const initial: Record<string, "read" | "write" | "admin" | null> = {};
      acl.forEach((a) => {
        initial[a.bucket_name] = a.permission;
      });
      setPermissions(initial);
    }
  });

  const handleSave = async () => {
    const aclInput: UpdateAclInput[] = Object.entries(permissions)
      .filter(([, perm]) => perm !== null)
      .map(([bucket_name, permission]) => ({
        bucket_name,
        permission: permission as "read" | "write" | "admin",
      }));

    try {
      await updateAcl.mutateAsync(aclInput);
      onClose();
    } catch (error) {
      console.error("Failed to update ACL:", error);
    }
  };

  return (
    <Modal isOpen={true} onClose={onClose} title="Edit User Permissions">
      {isLoading ? (
        <div className="py-8 text-center text-slate-400">Loading...</div>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-slate-400">
            Set bucket permissions for this user.
          </p>

          <div className="space-y-2 max-h-64 overflow-y-auto">
            {buckets?.map((bucket) => (
              <div
                key={bucket.bucket_name}
                className="flex items-center justify-between p-3 bg-slate-900 rounded-lg"
              >
                <span className="font-mono text-sm">{bucket.bucket_name}</span>
                <select
                  value={permissions[bucket.bucket_name] || ""}
                  onChange={(e) =>
                    setPermissions((prev) => ({
                      ...prev,
                      [bucket.bucket_name]: (e.target.value || null) as "read" | "write" | "admin" | null,
                    }))
                  }
                  className="px-2 py-1 bg-slate-800 border border-slate-600 rounded text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">No access</option>
                  <option value="read">Read</option>
                  <option value="write">Write</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={updateAcl.isPending}>
              {updateAcl.isPending ? "Saving..." : "Save Permissions"}
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
