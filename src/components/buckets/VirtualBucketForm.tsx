/**
 * VirtualBucketForm Component
 * 
 * Form for creating and managing virtual buckets that aggregate
 * content from multiple source folders.
 */

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useCreateBucket } from '../../api/buckets';
import { useVirtualBucket, useAddVirtualSource, useRemoveVirtualSource, useUpdateVirtualSource } from '../../api/virtual-buckets';
import Button from '../ui/Button';
import Input from '../ui/Input';
import FolderPicker from './FolderPicker';
import type { VirtualBucketSource } from '../../types/api';

const virtualBucketSchema = z.object({
  bucket_name: z
    .string()
    .min(3, 'Bucket name must be at least 3 characters')
    .max(63, 'Bucket name must be at most 63 characters')
    .regex(/^[a-z0-9.-]+$/, 'Bucket name can only contain lowercase letters, numbers, dots, and hyphens'),
});

type VirtualBucketFormValues = z.infer<typeof virtualBucketSchema>;

interface VirtualBucketFormProps {
  onSuccess?: () => void;
  existingBucketName?: string; // For edit mode
}

export default function VirtualBucketForm({ onSuccess, existingBucketName }: VirtualBucketFormProps) {
  const createBucket = useCreateBucket();
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [pendingSources, setPendingSources] = useState<
    { sourceBucketName: string; sourcePrefix: string; displayName?: string; mountPoint?: string }[]
  >([]);
  const [createdBucketName, setCreatedBucketName] = useState<string | null>(existingBucketName || null);
  
  // For existing virtual bucket, use the API
  const { data: virtualBucketData } = useVirtualBucket(createdBucketName || '');
  const addSource = useAddVirtualSource(createdBucketName || '');
  const removeSource = useRemoveVirtualSource(createdBucketName || '');
  const updateSource = useUpdateVirtualSource(createdBucketName || '');
  
  const existingSources = virtualBucketData?.sources || [];
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<VirtualBucketFormValues>({
    resolver: zodResolver(virtualBucketSchema),
    defaultValues: existingBucketName ? { bucket_name: existingBucketName } : undefined,
  });
  
  const handleFolderSelect = (bucketName: string, prefix: string, displayName?: string) => {
    if (createdBucketName) {
      // If bucket already created, add source via API
      addSource.mutate({
        source_bucket_name: bucketName,
        source_prefix: prefix,
        display_name: displayName,
        sort_order: existingSources.length,
      });
    } else {
      // Otherwise add to pending list
      // Default mount point: bucket name (if root) or folder name
      const parts = prefix.split('/').filter(p => p);
      const defaultMount = parts.length > 0 ? parts[parts.length - 1] + '/' : bucketName + '/';

      setPendingSources([...pendingSources, { 
        sourceBucketName: bucketName, 
        sourcePrefix: prefix, 
        displayName,
        mountPoint: defaultMount
      }]);
    }
  };
  
  const handleRemovePendingSource = (index: number) => {
    setPendingSources(pendingSources.filter((_, i) => i !== index));
  };
  
  const handleRemoveExistingSource = (sourceId: number) => {
    removeSource.mutate(sourceId);
  };

  const handleUpdatePendingSource = (index: number, mountPoint: string) => {
    const newSources = [...pendingSources];
    newSources[index] = { ...newSources[index], mountPoint };
    setPendingSources(newSources);
  }

  const handleUpdateExistingSource = (sourceId: number, mountPoint: string) => {
    updateSource.mutate({ sourceId, data: { mount_point: mountPoint } });
  };
  
  const onSubmit = async (data: VirtualBucketFormValues) => {
    try {
      // Create the virtual bucket
      await createBucket.mutateAsync({
        bucket_name: data.bucket_name,
        bucket_type: 'virtual',
      });
      
      setCreatedBucketName(data.bucket_name);
      
      // Wait a moment for the bucket to be created, then add sources
      // In a real app, you might want to handle this more robustly
      setTimeout(async () => {
        for (let i = 0; i < pendingSources.length; i++) {
          const source = pendingSources[i];
          await addSource.mutateAsync({
            source_bucket_name: source.sourceBucketName,
            source_prefix: source.sourcePrefix,
            display_name: source.displayName,
            sort_order: i,
            mount_point: source.mountPoint
          });
        }
        
        setPendingSources([]);
        onSuccess?.();
      }, 500);
      
    } catch (error) {
      console.error('Failed to create virtual bucket:', error);
    }
  };
  
  const isEditMode = !!createdBucketName;
  const allSources = isEditMode 
    ? existingSources 
    : pendingSources.map((s, i) => ({
        id: i,
        source_bucket_name: s.sourceBucketName,
        source_prefix: s.sourcePrefix,
        display_name: s.displayName,
        sort_order: i,
        mount_point: s.mountPoint
      } as VirtualBucketSource));
  
  return (
    <div className="space-y-6">
      {/* Bucket Name */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Virtual Bucket Name"
          placeholder="my-virtual-bucket"
          error={errors.bucket_name?.message}
          disabled={isEditMode}
          {...register('bucket_name')}
        />
        
        {!isEditMode && (
          <p className="text-sm text-muted-foreground">
            This will be the subdomain used to access the virtual bucket (e.g., <code>my-virtual-bucket.vfx.sh</code>)
          </p>
        )}
        
        {!isEditMode && (
          <Button 
            type="submit" 
            isLoading={createBucket.isPending}
            disabled={pendingSources.length === 0}
            className="w-full"
          >
            Create Virtual Bucket
          </Button>
        )}
      </form>
      
      {/* Divider */}
      <div className="border-t border-border" />
      
      {/* Sources Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium">Source Folders</h3>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setIsPickerOpen(true)}
          >
            + Add Source
          </Button>
        </div>
        
        {allSources.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground border border-dashed border-border rounded-lg">
            <p>No source folders added yet.</p>
            <p className="text-sm mt-1">Click "Add Source" to browse and select folders.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {allSources.map((source, index) => (
              <div
                key={source.id}
                className="flex flex-col gap-2 p-3 bg-muted/50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">
                      {source.display_name || source.source_prefix || '(root)'}
                    </div>
                    <div className="text-xs text-muted-foreground truncate">
                      {source.source_bucket_name}/{source.source_prefix || ''}
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    #{index + 1}
                  </div>
                  <button
                    onClick={() => 
                      isEditMode 
                        ? handleRemoveExistingSource(source.id)
                        : handleRemovePendingSource(index)
                    }
                    className="text-destructive hover:text-destructive/80"
                    title="Remove source"
                  >
                    ✕
                  </button>
                </div>
                
                <div className="flex items-center gap-2">
                  <label className="text-xs font-medium whitespace-nowrap">Mount Path:</label>
                  <Input 
                    value={source.mount_point || ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (isEditMode) {
                        // Debouncing would be better here, but for now simple update
                        // We rely on onBlur to save
                      } else {
                        handleUpdatePendingSource(index, val);
                      }
                    }}
                    onBlur={(e) => {
                      if (isEditMode) {
                        handleUpdateExistingSource(source.id, e.target.value);
                      }
                    }}
                    placeholder="(root)"
                    className="h-7 text-xs"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
        
        <p className="text-xs text-muted-foreground">
          Sources are checked in order. The first source is also used for write operations.
        </p>
      </div>
      
      {/* Folder Picker Modal */}
      <FolderPicker
        isOpen={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        onSelect={handleFolderSelect}
      />
    </div>
  );
}
