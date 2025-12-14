import { Trash2 } from "lucide-react";
import { useAccessKeys, useDeleteAccessKey } from "../../api/keys";
import Table, { TableHeader, TableBody, TableRow, TableHead, TableCell } from "../ui/Table";

export default function KeyList() {
  const { data: keys, isLoading, error } = useAccessKeys();
  const deleteKey = useDeleteAccessKey();

  const handleDelete = (keyId: string) => {
    if (confirm("Delete this access key? This cannot be undone.")) {
      deleteKey.mutate(keyId);
    }
  };

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
        <p>Failed to load access keys</p>
      </div>
    );
  }

  if (!keys?.length) {
    return (
      <div className="text-center py-12 text-slate-400">
        <p>No access keys created yet</p>
        <p className="text-sm text-slate-500 mt-1">Create an access key for users to connect via S3</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Access Key ID</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>User</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Expires</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="w-16"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {keys.map((key) => (
            <TableRow key={key.access_key_id}>
              <TableCell className="font-mono text-xs text-white">
                {key.access_key_id}
              </TableCell>
              <TableCell>{key.name || "-"}</TableCell>
              <TableCell className="text-slate-400">
                {key.user_email || key.user_id}
              </TableCell>
              <TableCell>
                <span
                  className={`px-2 py-0.5 rounded text-xs font-medium ${
                    key.enabled
                      ? "bg-green-900/50 text-green-400 border border-green-800"
                      : "bg-red-900/50 text-red-400 border border-red-800"
                  }`}
                >
                  {key.enabled ? "Active" : "Disabled"}
                </span>
              </TableCell>
              <TableCell>
                {key.expiration
                  ? new Date(key.expiration).toLocaleDateString()
                  : "Never"}
              </TableCell>
              <TableCell>
                {new Date(key.created_at).toLocaleDateString()}
              </TableCell>
              <TableCell>
                <button
                  onClick={() => handleDelete(key.access_key_id)}
                  disabled={deleteKey.isPending}
                  className="text-red-400 hover:text-red-300 p-1 disabled:opacity-50"
                >
                  <Trash2 size={16} />
                </button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
