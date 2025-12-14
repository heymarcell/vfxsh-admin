import { Trash2, Pencil, Search, Layers } from "lucide-react";
import { useState, useMemo } from "react";
import { useBuckets, useDeleteBucket } from "../../api/buckets";
import Table, { TableHeader, TableBody, TableRow, TableHead, TableCell } from "../ui/Table";
import Button from "../ui/Button";
import BucketEditModal from "./BucketEditModal";
import VirtualBucketForm from "./VirtualBucketForm";
import Modal from "../ui/Modal";
import type { BucketMapping } from "../../types/api";

export default function BucketList() {
  const { data: buckets, isLoading, error } = useBuckets();
  const deleteBucket = useDeleteBucket();
  const [editingBucket, setEditingBucket] = useState<BucketMapping | null>(null);
  const [editingVirtualBucket, setEditingVirtualBucket] = useState<BucketMapping | null>(null);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<'all' | 'standard' | 'virtual'>('all');

  const filteredBuckets = useMemo(() => {
    if (!buckets) return [];
    let filtered = buckets;
    
    // Filter by type
    if (typeFilter !== 'all') {
      filtered = filtered.filter(b => b.bucket_type === typeFilter);
    }
    
    // Filter by search
    if (search.trim()) {
      const q = search.toLowerCase();
      filtered = filtered.filter((b) => 
        b.bucket_name.toLowerCase().includes(q) || 
        b.provider_name?.toLowerCase().includes(q) ||
        (b.remote_bucket_name && b.remote_bucket_name.toLowerCase().includes(q))
      );
    }
    
    return filtered;
  }, [buckets, search, typeFilter]);

  const handleDelete = (name: string, isVirtual: boolean) => {
    const msg = isVirtual 
      ? "Delete this virtual bucket? All source folder references will be removed. This cannot be undone."
      : "Delete this bucket mapping? This cannot be undone.";
    if (confirm(msg)) {
      deleteBucket.mutate(name);
    }
  };

  // Count by type
  const standardCount = buckets?.filter(b => b.bucket_type !== 'virtual').length || 0;
  const virtualCount = buckets?.filter(b => b.bucket_type === 'virtual').length || 0;

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
        {/* Filters Row */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search buckets..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          
          {/* Type Filter Tabs */}
          <div className="flex rounded-lg border border-border overflow-hidden text-sm">
            <button
              onClick={() => setTypeFilter('all')}
              className={`px-3 py-1.5 transition-colors ${
                typeFilter === 'all' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-background hover:bg-muted'
              }`}
            >
              All ({buckets.length})
            </button>
            <button
              onClick={() => setTypeFilter('standard')}
              className={`px-3 py-1.5 border-l border-border transition-colors ${
                typeFilter === 'standard' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-background hover:bg-muted'
              }`}
            >
              Standard ({standardCount})
            </button>
            <button
              onClick={() => setTypeFilter('virtual')}
              className={`px-3 py-1.5 border-l border-border transition-colors ${
                typeFilter === 'virtual' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-background hover:bg-muted'
              }`}
            >
              Virtual ({virtualCount})
            </button>
          </div>
        </div>
        
        <div className="rounded-lg border border-border overflow-hidden bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Bucket Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Provider / Sources</TableHead>
                <TableHead>Remote Bucket</TableHead>
                <TableHead className="w-[120px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBuckets.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                    No buckets match your filters
                  </TableCell>
                </TableRow>
              ) : (
                filteredBuckets.map((bucket) => {
                  const isVirtual = bucket.bucket_type === 'virtual';
                  
                  return (
                    <TableRow key={bucket.bucket_name}>
                      <TableCell className="font-mono font-medium text-primary">
                        {bucket.bucket_name}
                      </TableCell>
                      <TableCell>
                        {isVirtual ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-violet-500/10 text-violet-600 dark:text-violet-400">
                            <Layers size={12} />
                            Virtual
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                            Standard
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {isVirtual ? (
                          <span className="text-sm">
                            {bucket.source_count || 0} source{(bucket.source_count || 0) !== 1 ? 's' : ''}
                          </span>
                        ) : (
                          bucket.provider_name
                        )}
                      </TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {isVirtual ? (
                          <span className="text-muted-foreground/50">—</span>
                        ) : (
                          bucket.remote_bucket_name
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-1 justify-end">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              if (isVirtual) {
                                setEditingVirtualBucket(bucket);
                              } else {
                                setEditingBucket(bucket);
                              }
                            }}
                            className="h-8 w-8 text-muted-foreground hover:text-foreground"
                          >
                            <Pencil size={16} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(bucket.bucket_name, isVirtual)}
                            disabled={deleteBucket.isPending}
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
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

      <Modal
        isOpen={!!editingVirtualBucket}
        onClose={() => setEditingVirtualBucket(null)}
        title={`Edit ${editingVirtualBucket?.bucket_name}`}
        className="max-w-2xl"
      >
        {editingVirtualBucket && (
          <VirtualBucketForm
            existingBucketName={editingVirtualBucket.bucket_name}
            onSuccess={() => setEditingVirtualBucket(null)}
          />
        )}
      </Modal>
    </>
  );
}
