import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useApiClient } from "../../api/client";
import { createFileSystemApi } from "../../api/filesystem";
import Table, { TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/Table";
import Button from "../../components/ui/Button";
import { Lock, Unlock, RefreshCw } from "lucide-react";

export default function PlatformLocks() {
  const client = useApiClient();
  const fsApi = createFileSystemApi(client);
  const queryClient = useQueryClient();
  const now = Date.now();

  const { data: locks, isLoading, error } = useQuery({
    queryKey: ['locks'],
    queryFn: () => fsApi.getActiveLocks(),
    refetchInterval: 5000,
  });

  const unlockMutation = useMutation({
    mutationFn: (path: string) => fsApi.releaseLock(path),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locks'] });
    },
  });

  if (error) return <div className="p-4 text-red-500">Error loading locks</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Active Locks</h1>
          <p className="text-muted-foreground mt-2">
            Monitor and release active global file locks.
          </p>
        </div>
        <Button 
          variant="outline" 
          onClick={() => queryClient.invalidateQueries({ queryKey: ['locks'] })}
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <div className="bg-card rounded-lg border border-border shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Path</TableHead>
              <TableHead>Owner</TableHead>
              <TableHead>Machine ID</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Expires In</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">Loading locks...</TableCell>
              </TableRow>
            ) : locks?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">No active locks</TableCell>
              </TableRow>
            ) : (
              locks?.map((lock) => {
                const timeLeft = Math.max(0, Math.floor((lock.expiresAt - now) / 1000));
                
                return (
                  <TableRow key={lock.path}>
                    <TableCell className="font-mono text-sm">{lock.path}</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">
                        {lock.ownerId}
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs">{lock.machineId}</TableCell>
                    <TableCell className="text-muted-foreground text-xs">
                      <div className="flex items-center space-x-1 text-green-500">
                        <Lock className="w-3 h-3" />
                        <span>Active</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {timeLeft}s
                    </TableCell>
                    <TableCell>
                      <Button 
                        size="sm" 
                        variant="secondary"
                        className="text-red-500 hover:text-red-600"
                        onClick={() => {
                          if (confirm(`Force release lock on ${lock.path}?`)) {
                            unlockMutation.mutate(lock.path);
                          }
                        }}
                      >
                        <Unlock className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
