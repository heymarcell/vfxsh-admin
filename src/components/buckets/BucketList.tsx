import { Trash2, Pencil, Search } from "lucide-react";
import { useState, useMemo } from "react";
import { useBuckets, useDeleteBucket } from "../../api/buckets";
import Table, { TableHeader, TableBody, TableRow, TableHead, TableCell } from "../ui/Table";
import Button from "../ui/Button";
import BucketEditModal from "./BucketEditModal";
import type { BucketMapping } from "../../types/api";

export default function BucketList() {
  const { data: buckets, isLoading, error } = useBuckets();
  const deleteBucket = useDeleteBucket();
  const [editingBucket, setEditingBucket] = useState<BucketMapping | null>(null);
  const [search, setSearch] = useState("");

  const filteredBuckets = useMemo(() => {
    if (!buckets) return [];
    if (!search.trim()) return buckets;
    const q = search.toLowerCase();
    return buckets.filter((b) => 
      b.bucket_name.toLowerCase().includes(q) || 
      b.provider_name?.toLowerCase().includes(q) ||
      b.remote_bucket_name.toLowerCase().includes(q)
    );
  }, [buckets, search]);

  const handleDelete = (name: string) => {
    if (confirm("Delete this bucket mapping? This cannot be undone.")) {
      deleteBucket.mutate(name);
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center text-muted-foreground">Loading buckets...</div>;
  }

  if (error) {
    return <div className="p-8 text-center text-destructive">Failed to load buckets.</div>;
  }

  if (!buckets?.length) {
    return (
      <div className="rounded-md border border-dashed border-border p-12 text-center">
        <h3 className="text-lg font-medium">No Bucket Mappings</h3>
        <p className="text-sm text-muted-foreground mt-1">Create a bucket mapping to expose storage.</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search buckets..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full max-w-sm pl-10 pr-4 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div className="rounded-lg border border-border overflow-hidden bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Virtual Bucket</TableHead>
                <TableHead>Provider</TableHead>
                <TableHead>Remote Bucket</TableHead>
                <TableHead className="w-[120px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBuckets.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center h-24 text-muted-foreground">
                    No buckets match "{search}"
                  </TableCell>
                </TableRow>
              ) : (
                filteredBuckets.map((bucket) => (
                  <TableRow key={bucket.bucket_name}>
                    <TableCell className="font-mono font-medium text-primary">
                      {bucket.bucket_name}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{bucket.provider_name}</TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {bucket.remote_bucket_name}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-1 justify-end">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setEditingBucket(bucket)}
                          className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        >
                          <Pencil size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(bucket.bucket_name)}
                          disabled={deleteBucket.isPending}
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <BucketEditModal
        bucket={editingBucket}
        isOpen={!!editingBucket}
        onClose={() => setEditingBucket(null)}
      />
    </>
  );
}
