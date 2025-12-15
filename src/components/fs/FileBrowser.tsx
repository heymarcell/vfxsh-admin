import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useApiClient } from "../../api/client";
import { createFileSystemApi } from "../../api/filesystem";
import Table, { TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/Table";
import { Folder, File, Lock, Unlock, ChevronRight, Home, RefreshCw } from "lucide-react";
import Button from "../ui/Button";

interface FileBrowserProps {
  initialPath?: string;
}

export default function FileBrowser({ initialPath = "/" }: FileBrowserProps) {
  const [currentPath, setCurrentPath] = useState(initialPath);
  const client = useApiClient();
  const fsApi = createFileSystemApi(client);
  const queryClient = useQueryClient();

  // Queries
  const { data: files, isLoading, error } = useQuery({
    queryKey: ['files', currentPath],
    queryFn: () => fsApi.getFiles(currentPath),
  });

  const { data: locks } = useQuery({
    queryKey: ['locks'],
    queryFn: () => fsApi.getActiveLocks(),
    refetchInterval: 5000, 
  });

  // Mutations
  const unlockMutation = useMutation({
    mutationFn: (path: string) => fsApi.releaseLock(path),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locks'] });
      // Optionally invalidate files if lock status is embedded
      queryClient.invalidateQueries({ queryKey: ['files'] });
    },
  });

  // Navigation handlers
  const handleNavigate = (path: string) => {
    setCurrentPath(path);
  };

  const handleBreadcrumbClick = (index: number) => {
    const parts = currentPath.split('/').filter(p => p);
    const newPath = '/' + parts.slice(0, index + 1).join('/');
    setCurrentPath(newPath);
  };

  const breadcrumbs = currentPath.split('/').filter(Boolean);

  /* 
     Merge files with locks 
     Note: The API client defined 'locked' optional property on FileEntry. 
     We can also overlay the 'locks' query data if the files endpoint doesn't return authoritative lock info.
     Assumed 'files' endpoint might not return dynamic lock info, so we overlay from 'locks' query.
  */
  const mergedFiles = files?.map(f => {
    const fullPath = currentPath === '/' ? `/${f.name}` : `${currentPath}/${f.name}`;
    const activeLock = locks?.find(l => l.path === fullPath);
    return {
      ...f,
      locked: !!activeLock,
      lockOwner: activeLock?.ownerId
    };
  }) || [];

  // Sorting: Folders first, then alphabetical
  mergedFiles.sort((a, b) => {
    if (a.type === b.type) return a.name.localeCompare(b.name);
    return a.type === 'directory' ? -1 : 1;
  });

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (error) return <div className="p-4 text-red-500">Error loading files</div>;

  return (
    <div className="flex flex-col h-full bg-card rounded-lg shadow-sm border border-border">
      {/* Header / Breadcrumbs */}
      <div className="p-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center space-x-2 text-sm text-muted-foreground overflow-hidden">
          <button 
            onClick={() => setCurrentPath("/")}
            className="hover:text-foreground flex items-center transition-colors"
          >
            <Home className="w-4 h-4" />
          </button>
          
          {breadcrumbs.map((part, i) => (
            <div key={i} className="flex items-center">
              <ChevronRight className="w-4 h-4 mx-1" />
              <button 
                onClick={() => handleBreadcrumbClick(i)}
                className="hover:text-foreground font-medium transition-colors"
              >
                {part}
              </button>
            </div>
          ))}
        </div>
        
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => queryClient.invalidateQueries({ queryKey: ['files'] })}
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {/* File List */}
      <div className="flex-1 overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]"></TableHead>
              <TableHead>Name</TableHead>
              <TableHead className="w-[100px]">Size</TableHead>
              <TableHead className="w-[150px]">Last Modified</TableHead>
              <TableHead className="w-[150px]">Lock Status</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
               <TableRow>
                 <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">Loading...</TableCell>
               </TableRow>
            ) : mergedFiles.length === 0 ? (
               <TableRow>
                 <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">Empty directory</TableCell>
               </TableRow>
            ) : (
              mergedFiles.map((file) => (
                <TableRow 
                  key={file.name} 
                  className="group cursor-pointer"
                  // Simple navigation on row click for folders
                  onClick={() => {
                    if (file.type === 'directory') {
                      handleNavigate(currentPath === '/' ? `/${file.name}` : `${currentPath}/${file.name}`);
                    }
                  }}
                >
                  <TableCell>
                    {file.type === 'directory' ? 
                      <Folder className="w-5 h-5 text-blue-500 fill-blue-500/20" /> : 
                      <File className="w-5 h-5 text-slate-500" />
                    }
                  </TableCell>
                  <TableCell className="font-medium">{file.name}</TableCell>
                  <TableCell className="text-muted-foreground text-xs">
                    {file.type === 'file' ? formatSize(file.size) : '-'}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-xs">
                    {new Date(file.lastModified).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {file.locked && (
                      <div className="flex items-center space-x-2 text-amber-500 text-xs font-medium">
                        <Lock className="w-3 h-3" />
                        <span>{file.lockOwner || 'Locked'}</span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    {file.locked && (
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`Force unlock ${file.name}?`)) {
                            const fullPath = currentPath === '/' ? `/${file.name}` : `${currentPath}/${file.name}`;
                            unlockMutation.mutate(fullPath);
                          }
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-neutral-100 rounded text-red-500 transition-opacity"
                        title="Force Unlock"
                      >
                         <Unlock className="w-4 h-4" />
                      </button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* Footer / Status Bar - could go here */}
      <div className="p-2 border-t border-border text-xs text-muted-foreground bg-muted/20">
        {mergedFiles.length} items
      </div>
    </div>
  );
}
