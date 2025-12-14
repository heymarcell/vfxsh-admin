import { Trash2 } from "lucide-react";
import { useBuckets, useDeleteBucket } from "../../api/buckets";
import Table, { TableHeader, TableBody, TableRow, TableHead, TableCell } from "../ui/Table";
import Button from "../ui/Button";

export default function BucketList() {
  const { data: buckets, isLoading, error } = useBuckets();
  const deleteBucket = useDeleteBucket();

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
    <div className="rounded-lg border border-border overflow-hidden bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Virtual Bucket</TableHead>
            <TableHead>Provider</TableHead>
            <TableHead>Remote Bucket</TableHead>
            <TableHead>Date Created</TableHead>
            <TableHead className="w-[80px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {buckets.map((bucket) => (
            <TableRow key={bucket.bucket_name}>
              <TableCell className="font-mono font-medium text-primary">
                {bucket.bucket_name}
              </TableCell>
              <TableCell className="text-muted-foreground">{bucket.provider_name}</TableCell>
              <TableCell className="font-mono text-xs text-muted-foreground">
                {bucket.remote_bucket_name}
              </TableCell>
              <TableCell className="text-muted-foreground text-xs">
                {new Date(bucket.created_at).toLocaleDateString()}
              </TableCell>
              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(bucket.bucket_name)}
                  disabled={deleteBucket.isPending}
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                >
                  <Trash2 size={16} />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
