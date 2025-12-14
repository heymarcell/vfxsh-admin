/**
 * Platform Audit Log Page - Super Admin Only
 * View all actions across the platform
 */
import { useState } from "react";
import { FileText, RefreshCw } from "lucide-react";
import { useAuditLogs } from "../../api/platform";
import Button from "../../components/ui/Button";

const actionColors: Record<string, string> = {
  "provider:create": "text-green-400",
  "provider:delete": "text-red-400",
  "bucket:create": "text-green-400",
  "bucket:delete": "text-red-400",
  "bucket:assign": "text-blue-400",
  "bucket:unassign": "text-orange-400",
  "org:create": "text-green-400",
  "org:delete": "text-red-400",
  "member:invite": "text-blue-400",
  "member:remove": "text-orange-400",
  "member:role-change": "text-purple-400",
};

export default function PlatformAudit() {
  const [limit, setLimit] = useState(50);
  const { data, isLoading, refetch, isFetching } = useAuditLogs({ limit });

  const formatAction = (action: string) => {
    return action.replace(":", " → ").replace("-", " ");
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Audit Log</h1>
        </div>
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-16 rounded-lg border border-border bg-card/50 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Audit Log</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {data?.total} total events
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => refetch()} disabled={isFetching}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isFetching ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="rounded-lg border border-border overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Time</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">User</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Action</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Resource</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {data?.logs.map((log) => (
              <tr key={log.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 text-sm">
                  <div className="text-foreground">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(log.timestamp).toLocaleDateString()}
                  </div>
                </td>
                <td className="px-4 py-3 text-sm">
                  {log.userEmail || log.userId.slice(0, 8)}
                </td>
                <td className="px-4 py-3">
                  <span className={`text-sm font-medium capitalize ${actionColors[log.action] || "text-muted-foreground"}`}>
                    {formatAction(log.action)}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="text-sm">
                    <span className="text-muted-foreground">{log.resourceType}</span>
                    {log.resourceId && (
                      <span className="text-xs ml-1 text-muted-foreground/60">
                        ({log.resourceId.slice(0, 8)}...)
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-muted-foreground max-w-[200px] truncate">
                  {log.details ? JSON.stringify(log.details) : "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {data?.logs.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-30" />
            <p>No audit logs yet</p>
          </div>
        )}
      </div>

      {/* Load More */}
      {data && data.logs.length < data.total && (
        <div className="flex justify-center">
          <Button
            variant="outline"
            onClick={() => setLimit((prev) => prev + 50)}
          >
            Load More ({data.total - data.logs.length} remaining)
          </Button>
        </div>
      )}
    </div>
  );
}
