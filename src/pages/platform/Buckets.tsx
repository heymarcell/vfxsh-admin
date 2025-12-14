/**
 * Platform Source Buckets Page - Super Admin Only
 * Manage real S3 bucket mappings and assignments to organizations
 */
import { useState } from "react";
import { Plus, FolderOpen, Trash2, Building2, Link2, X } from "lucide-react";
import { 
  usePlatformBuckets, 
  useCreateSourceBucket, 
  useDeleteSourceBucket,
  usePlatformProviders,
  usePlatformOrganizations,
  useBucketAssignments,
  useAssignBucket,
  useUnassignBucket
} from "../../api/platform";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import Input from "../../components/ui/Input";

export default function PlatformBuckets() {
  const { data: buckets, isLoading } = usePlatformBuckets();
  const { data: providers } = usePlatformProviders();
  const { data: organizations } = usePlatformOrganizations();
  const { data: assignments } = useBucketAssignments();
  const createBucket = useCreateSourceBucket();
  const deleteBucket = useDeleteSourceBucket();
  const assignBucket = useAssignBucket();
  const unassignBucket = useUnassignBucket();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    bucket_name: "",
    remote_bucket_name: "",
    provider_id: "",
  });
  
  const [assignData, setAssignData] = useState({
    org_id: "",
    bucket_id: "",
  });

  const handleCreate = async () => {
    if (!formData.bucket_name || !formData.provider_id) return;
    
    await createBucket.mutateAsync({
      ...formData,
      remote_bucket_name: formData.remote_bucket_name || formData.bucket_name,
    });
    
    setFormData({ bucket_name: "", remote_bucket_name: "", provider_id: "" });
    setIsModalOpen(false);
  };

  const handleDelete = async (id: string) => {
    await deleteBucket.mutateAsync(id);
    setDeleteConfirm(null);
  };

  const handleAssign = async () => {
    if (!assignData.org_id || !assignData.bucket_id) return;
    await assignBucket.mutateAsync(assignData);
    setAssignData({ org_id: "", bucket_id: "" });
    setIsAssignModalOpen(false);
  };

  const getBucketAssignments = (bucketId: string) => {
    return assignments?.filter(a => a.bucket_id === bucketId) || [];
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Source Buckets</h1>
        </div>
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 rounded-lg border border-border bg-card/50 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Source Buckets</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setIsAssignModalOpen(true)}>
            <Link2 className="h-4 w-4 mr-2" />
            Assign to Org
          </Button>
          <Button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Bucket
          </Button>
        </div>
      </div>

      {/* Buckets List */}
      <div className="space-y-3">
        {buckets?.map((bucket) => {
          const bucketAssignments = getBucketAssignments(bucket.id);
          return (
            <div
              key={bucket.id}
              className="rounded-lg border border-border bg-card p-4 hover:border-primary/50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10">
                    <FolderOpen className="h-5 w-5 text-green-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{bucket.bucket_name}</h3>
                    <p className="text-xs text-muted-foreground">
                      {bucket.provider_name} → {bucket.remote_bucket_name}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {/* Assigned Orgs */}
                  <div className="flex items-center gap-1">
                    {bucketAssignments.map((assignment) => (
                      <div
                        key={assignment.id}
                        className="flex items-center gap-1 px-2 py-1 bg-primary/10 rounded-full text-xs"
                      >
                        <Building2 className="h-3 w-3" />
                        <span>{assignment.org_name}</span>
                        <button
                          onClick={() => unassignBucket.mutate(assignment.id)}
                          className="ml-1 hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                  
                  <button
                    onClick={() => {
                      setAssignData({ org_id: "", bucket_id: bucket.id });
                      setIsAssignModalOpen(true);
                    }}
                    className="p-1.5 rounded-md hover:bg-muted text-muted-foreground transition-colors"
                  >
                    <Link2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(bucket.id)}
                    className="p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {buckets?.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <FolderOpen className="h-12 w-12 mx-auto mb-4 opacity-30" />
            <p>No source buckets configured</p>
            <p className="text-sm">Add buckets from your S3 providers</p>
          </div>
        )}
      </div>

      {/* Create Bucket Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Source Bucket"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Provider</label>
            <select
              value={formData.provider_id}
              onChange={(e) => setFormData({ ...formData, provider_id: e.target.value })}
              className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm"
            >
              <option value="">Select provider...</option>
              {providers?.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Local Bucket Name</label>
            <Input
              value={formData.bucket_name}
              onChange={(e) => setFormData({ ...formData, bucket_name: e.target.value })}
              placeholder="my-bucket"
            />
            <p className="text-xs text-muted-foreground mt-1">
              The name users will see and use
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Remote Bucket Name (optional)</label>
            <Input
              value={formData.remote_bucket_name}
              onChange={(e) => setFormData({ ...formData, remote_bucket_name: e.target.value })}
              placeholder="Same as local name if empty"
            />
            <p className="text-xs text-muted-foreground mt-1">
              The actual bucket name on the S3 provider
            </p>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleCreate} 
              disabled={!formData.bucket_name || !formData.provider_id || createBucket.isPending}
            >
              {createBucket.isPending ? "Adding..." : "Add Bucket"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Assign to Org Modal */}
      <Modal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        title="Assign Bucket to Organization"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Bucket</label>
            <select
              value={assignData.bucket_id}
              onChange={(e) => setAssignData({ ...assignData, bucket_id: e.target.value })}
              className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm"
            >
              <option value="">Select bucket...</option>
              {buckets?.map((b) => (
                <option key={b.id} value={b.id}>{b.bucket_name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Organization</label>
            <select
              value={assignData.org_id}
              onChange={(e) => setAssignData({ ...assignData, org_id: e.target.value })}
              className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm"
            >
              <option value="">Select organization...</option>
              {organizations?.map((o) => (
                <option key={o.id} value={o.id}>{o.name}</option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setIsAssignModalOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleAssign} 
              disabled={!assignData.bucket_id || !assignData.org_id || assignBucket.isPending}
            >
              {assignBucket.isPending ? "Assigning..." : "Assign Bucket"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-lg p-6 max-w-md w-full mx-4 shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
                <Trash2 className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <h3 className="font-semibold">Delete Bucket</h3>
                <p className="text-sm text-muted-foreground">This action cannot be undone</p>
              </div>
              <button onClick={() => setDeleteConfirm(null)} className="ml-auto p-1 hover:bg-muted rounded">
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Bucket cannot be deleted if it is assigned to organizations.
              Remove all assignments first.
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
                Cancel
              </Button>
              <Button 
                variant="danger" 
                onClick={() => handleDelete(deleteConfirm)}
                disabled={deleteBucket.isPending}
              >
                {deleteBucket.isPending ? "Deleting..." : "Delete Bucket"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
