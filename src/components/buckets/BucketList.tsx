import { Trash2 } from "lucide-react";
import { useBuckets, useDeleteBucket } from "../../api/buckets";
import Table, { TableHeader, TableBody, TableRow, TableHead, TableCell } from "../ui/Table";

export default function BucketList() {
  const { data: buckets, isLoading, error } = useBuckets();
  const deleteBucket = useDeleteBucket();

  const handleDelete = (name: string) => {
    if (confirm("Delete this bucket mapping? This cannot be undone.")) {
      deleteBucket.mutate(name);
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
        <p>Failed to load buckets</p>
      </div>
    );
  }

  if (!buckets?.length) {
    return (
      <div className="text-center py-12 text-slate-400">
        <p>No bucket mappings configured yet</p>
        <p className="text-sm text-slate-500 mt-1">Create your first bucket mapping to get started</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Bucket Name</TableHead>
            <TableHead>Provider</TableHead>
            <TableHead>Remote Bucket</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="w-16"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {buckets.map((bucket) => (
            <TableRow key={bucket.bucket_name}>
              <TableCell className="font-mono font-medium text-white">
                {bucket.bucket_name}
              </TableCell>
              <TableCell>{bucket.provider_name}</TableCell>
              <TableCell className="font-mono text-slate-400">
                {bucket.remote_bucket_name}
              </TableCell>
              <TableCell>
                {new Date(bucket.created_at).toLocaleDateString()}
              </TableCell>
              <TableCell>
                <button
                  onClick={() => handleDelete(bucket.bucket_name)}
                  disabled={deleteBucket.isPending}
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
