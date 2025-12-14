/**
 * FolderPicker Component
 * 
 * Modal component for browsing bucket contents and selecting folders.
 * Used when creating virtual buckets to select source folders.
 */

import { useState } from 'react';
import { useApiClient } from '../../api/client';
import { useBuckets } from '../../api/buckets';
import Button from '../ui/Button';
import type { BucketBrowseResponse } from '../../types/api';

interface FolderPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (bucketName: string, prefix: string, displayName?: string) => void;
}

export default function FolderPicker({ isOpen, onClose, onSelect }: FolderPickerProps) {
  const { data: buckets } = useBuckets();
  const api = useApiClient();
  
  const [selectedBucket, setSelectedBucket] = useState<string>('');
  const [currentPrefix, setCurrentPrefix] = useState<string>('');
  const [browseData, setBrowseData] = useState<BucketBrowseResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Filter to only standard buckets (virtual buckets can't be sources)
  const standardBuckets = (buckets || []).filter(b => b.bucket_type !== 'virtual');
  
  const loadFolder = async (bucketName: string, prefix: string) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (prefix) params.set('prefix', prefix);
      
      const response = await api.get<BucketBrowseResponse>(
        `/buckets/${encodeURIComponent(bucketName)}/browse?${params.toString()}`
      );
      setBrowseData(response.data);
      setCurrentPrefix(prefix);
    } catch (e: unknown) {
      const err = e as { response?: { data?: { error?: string } } };
      setError(err?.response?.data?.error || 'Failed to browse bucket');
    } finally {
      setLoading(false);
    }
  };
  
  const handleBucketSelect = (bucketName: string) => {
    setSelectedBucket(bucketName);
    setCurrentPrefix('');
    if (bucketName) {
      loadFolder(bucketName, '');
    } else {
      setBrowseData(null);
    }
  };
  
  const handleFolderClick = (folder: { name: string; prefix: string }) => {
    loadFolder(selectedBucket, folder.prefix);
  };
  
  const handleNavigateUp = () => {
    if (!currentPrefix) return;
    // Remove last folder from prefix
    const parts = currentPrefix.slice(0, -1).split('/');
    parts.pop();
    const newPrefix = parts.length > 0 ? parts.join('/') + '/' : '';
    loadFolder(selectedBucket, newPrefix);
  };
  
  const handleSelectCurrentFolder = () => {
    if (!selectedBucket) return;
    
    // Generate display name from prefix
    let displayName: string | undefined;
    if (currentPrefix) {
      const parts = currentPrefix.slice(0, -1).split('/');
      displayName = parts[parts.length - 1];
    }
    
    onSelect(selectedBucket, currentPrefix, displayName);
    onClose();
    
    // Reset state
    setSelectedBucket('');
    setCurrentPrefix('');
    setBrowseData(null);
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-background border border-border rounded-lg shadow-lg w-full max-w-2xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold">Select Source Folder</h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            ✕
          </button>
        </div>
        
        {/* Bucket Select */}
        <div className="p-4 border-b border-border">
          <label className="text-sm font-medium text-foreground mb-1.5 block">Source Bucket</label>
          <select
            value={selectedBucket}
            onChange={(e) => handleBucketSelect(e.target.value)}
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <option value="">Select a bucket...</option>
            {standardBuckets.map((bucket) => (
              <option key={bucket.bucket_name} value={bucket.bucket_name}>
                {bucket.bucket_name} ({bucket.provider_name})
              </option>
            ))}
          </select>
        </div>
        
        {/* Breadcrumb */}
        {selectedBucket && (
          <div className="px-4 py-2 border-b border-border bg-muted/50 flex items-center gap-2 text-sm">
            <button
              onClick={() => loadFolder(selectedBucket, '')}
              className="text-primary hover:underline"
            >
              {selectedBucket}
            </button>
            {currentPrefix && (
              <>
                <span className="text-muted-foreground">/</span>
                {currentPrefix.slice(0, -1).split('/').map((part, idx, arr) => {
                  const pathPrefix = arr.slice(0, idx + 1).join('/') + '/';
                  return (
                    <div key={pathPrefix} className="flex items-center gap-2">
                      <button
                        onClick={() => loadFolder(selectedBucket, pathPrefix)}
                        className="text-primary hover:underline"
                      >
                        {part}
                      </button>
                      {idx < arr.length - 1 && <span className="text-muted-foreground">/</span>}
                    </div>
                  );
                })}
              </>
            )}
          </div>
        )}
        
        {/* Content */}
        <div className="flex-1 overflow-auto min-h-[300px] p-4">
          {loading && (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              Loading...
            </div>
          )}
          
          {error && (
            <div className="flex items-center justify-center h-full text-destructive">
              {error}
            </div>
          )}
          
          {!loading && !error && !selectedBucket && (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              Select a bucket to browse
            </div>
          )}
          
          {!loading && !error && browseData && (
            <div className="space-y-1">
              {/* Navigate up */}
              {currentPrefix && (
                <button
                  onClick={handleNavigateUp}
                  className="flex items-center gap-2 w-full p-2 rounded-md hover:bg-muted text-left"
                >
                  <span className="text-lg">⬆️</span>
                  <span className="text-muted-foreground">..</span>
                </button>
              )}
              
              {/* Folders */}
              {browseData.folders.map((folder) => (
                <button
                  key={folder.prefix}
                  onClick={() => handleFolderClick(folder)}
                  className="flex items-center gap-2 w-full p-2 rounded-md hover:bg-muted text-left"
                >
                  <span className="text-lg">📁</span>
                  <span>{folder.name}</span>
                </button>
              ))}
              
              {/* Files (for context, not selectable) */}
              {browseData.files.map((file) => (
                <div
                  key={file.key}
                  className="flex items-center gap-2 w-full p-2 text-muted-foreground"
                >
                  <span className="text-lg">📄</span>
                  <span className="truncate flex-1">{file.key.split('/').pop()}</span>
                  <span className="text-xs">{formatBytes(file.size)}</span>
                </div>
              ))}
              
              {browseData.folders.length === 0 && browseData.files.length === 0 && (
                <div className="text-center text-muted-foreground py-8">
                  This folder is empty
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-border">
          <div className="text-sm text-muted-foreground">
            {selectedBucket && (
              <>
                Selected: <span className="font-mono">{selectedBucket}/{currentPrefix || '(root)'}</span>
              </>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={handleSelectCurrentFolder}
              disabled={!selectedBucket}
            >
              Select This Folder
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}
