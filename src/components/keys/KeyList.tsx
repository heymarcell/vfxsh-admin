import { Trash2, Copy, Check, FolderOpen, RefreshCw, Search } from "lucide-react";
import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useAccessKeys, useDeleteAccessKey, useRotateAccessKey } from "../../api/keys";
import Table, { TableHeader, TableBody, TableRow, TableHead, TableCell } from "../ui/Table";
import Button from "../ui/Button";
import KeySecret from "./KeySecret";

export default function KeyList() {
  const { data: keys, isLoading, error } = useAccessKeys();
  const deleteKey = useDeleteAccessKey();
  const rotateKey = useRotateAccessKey();
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [rotatedKey, setRotatedKey] = useState<{ access_key_id: string; secret_key: string } | null>(null);
  const [search, setSearch] = useState("");

  const filteredKeys = useMemo(() => {
    if (!keys) return [];
    if (!search.trim()) return keys;
    const q = search.toLowerCase();
    return keys.filter((k: any) => 
      k.access_key_id.toLowerCase().includes(q) || 
      k.name?.toLowerCase().includes(q) ||
      k.user_email?.toLowerCase().includes(q)
    );
  }, [keys, search]);

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

  const handleRotate = (keyId: string) => {
    if (confirm("Rotate secret key? The old secret will be immediately invalidated.")) {
      rotateKey.mutate(keyId, {
        onSuccess: (data) => setRotatedKey(data),
      });
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
    <>
      {rotatedKey && (
        <KeySecret
          accessKeyId={rotatedKey.access_key_id}
          secretAccessKey={rotatedKey.secret_key}
          onClose={() => setRotatedKey(null)}
        />
      )}
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by key ID, name, or user..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full max-w-sm pl-10 pr-4 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div className="rounded-lg border border-border overflow-hidden bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Access Key ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Buckets</TableHead>
                <TableHead>Expires</TableHead>
                <TableHead className="w-[120px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredKeys.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                    No keys match "{search}"
                  </TableCell>
                </TableRow>
              ) : (
                filteredKeys.map((key: any) => (
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
                        {key.bucket_count || 0}
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs">
                      {key.expiration
                        ? new Date(key.expiration).toLocaleDateString()
                        : "Never"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRotate(key.access_key_id)}
                          disabled={rotateKey.isPending}
                          title="Rotate secret key"
                          className="h-8 w-8 text-muted-foreground hover:text-primary"
                        >
                          <RefreshCw size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(key.access_key_id)}
                          disabled={deleteKey.isPending}
                          title="Delete key"
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
    </>
  );
}
