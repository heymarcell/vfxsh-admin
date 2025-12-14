import { Trash2, Copy, Check, FolderOpen } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useAccessKeys, useDeleteAccessKey } from "../../api/keys";
import Table, { TableHeader, TableBody, TableRow, TableHead, TableCell } from "../ui/Table";
import Button from "../ui/Button";

export default function KeyList() {
  const { data: keys, isLoading, error } = useAccessKeys();
  const deleteKey = useDeleteAccessKey();
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(text);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = (keyId: string) => {
    if (confirm("Delete this access key? This cannot be undone.")) {
      deleteKey.mutate(keyId);
    }
  };

  if (isLoading) {
    return (
      <div className="rounded-md border border-border p-8 text-center text-muted-foreground">
        Loading keys...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-md border border-destructive/50 bg-destructive/10 p-8 text-center text-destructive">
        Failed to load access keys
      </div>
    );
  }

  if (!keys?.length) {
    return (
      <div className="rounded-md border border-dashed border-border p-12 text-center">
        <h3 className="text-lg font-medium">No Access Keys</h3>
        <p className="text-sm text-muted-foreground mt-1">Create an access key to get started.</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border overflow-hidden bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Access Key ID</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>User</TableHead>
            <TableHead>Buckets</TableHead>
            <TableHead>Expires</TableHead>
            <TableHead className="w-[100px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {keys.map((key: any) => (
            <TableRow key={key.access_key_id}>
              <TableCell>
                <div className="flex items-center gap-2">
                  <code className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded text-foreground">
                    {key.access_key_id}
                  </code>
                  <button onClick={() => copyToClipboard(key.access_key_id)} className="text-muted-foreground hover:text-foreground">
                     {copiedId === key.access_key_id ? <Check size={14} className="text-green-500"/> : <Copy size={14}/>}
                  </button>
                </div>
              </TableCell>
              <TableCell className="font-medium">{key.name || "—"}</TableCell>
              <TableCell>
                <Link to="/users" className="text-primary hover:underline text-sm">
                  {key.user_email || key.user_id}
                </Link>
              </TableCell>
              <TableCell>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-green-500/20 text-green-400">
                  <FolderOpen className="h-3 w-3" />
                  {key.bucket_count || 0} {key.bucket_count === "all" ? "(all)" : ""}
                </span>
              </TableCell>
              <TableCell className="text-muted-foreground text-xs">
                {key.expiration
                  ? new Date(key.expiration).toLocaleDateString()
                  : "Never"}
              </TableCell>
              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(key.access_key_id)}
                  disabled={deleteKey.isPending}
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
