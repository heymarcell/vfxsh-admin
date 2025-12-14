/**
 * Platform Organizations Page - Super Admin Only
 * Create and manage organizations
 */
import { useState } from "react";
import { Plus, Building2, Trash2, Users, FolderOpen, X } from "lucide-react";
import { usePlatformOrganizations, useCreateOrganization, useDeleteOrganization } from "../../api/platform";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import Input from "../../components/ui/Input";

export default function PlatformOrganizations() {
  const { data: organizations, isLoading } = usePlatformOrganizations();
  const createOrg = useCreateOrganization();
  const deleteOrg = useDeleteOrganization();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newOrgName, setNewOrgName] = useState("");
  const [newOrgOwnerEmail, setNewOrgOwnerEmail] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const handleCreate = async () => {
    if (!newOrgName.trim()) return;
    
    await createOrg.mutateAsync({ 
      name: newOrgName.trim(),
      owner_email: newOrgOwnerEmail.trim() || undefined
    });
    
    setNewOrgName("");
    setNewOrgOwnerEmail("");
    setIsModalOpen(false);
  };

  const handleDelete = async (id: string) => {
    await deleteOrg.mutateAsync(id);
    setDeleteConfirm(null);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Organizations</h1>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 rounded-lg border border-border bg-card/50 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Organizations</h1>
        <Button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          New Organization
        </Button>
      </div>

      {/* Organizations Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {organizations?.map((org) => (
          <div
            key={org.id}
            className="rounded-lg border border-border bg-card p-4 hover:border-primary/50 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Building2 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">{org.name}</h3>
                  <p className="text-xs text-muted-foreground">
                    Created {new Date(org.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setDeleteConfirm(org.id)}
                className="p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
            
            <div className="mt-4 flex gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Users className="h-4 w-4" />
                <span>{org.member_count} members</span>
              </div>
              <div className="flex items-center gap-1.5">
                <FolderOpen className="h-4 w-4" />
                <span>{org.bucket_count} buckets</span>
              </div>
            </div>
          </div>
        ))}

        {organizations?.length === 0 && (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            <Building2 className="h-12 w-12 mx-auto mb-4 opacity-30" />
            <p>No organizations yet</p>
            <p className="text-sm">Create your first organization to get started</p>
          </div>
        )}
      </div>

      {/* Create Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create Organization"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Organization Name</label>
            <Input
              value={newOrgName}
              onChange={(e) => setNewOrgName(e.target.value)}
              placeholder="Acme Corp"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Owner Email (optional)</label>
            <Input
              type="email"
              value={newOrgOwnerEmail}
              onChange={(e) => setNewOrgOwnerEmail(e.target.value)}
              placeholder="owner@example.com"
            />
            <p className="text-xs text-muted-foreground mt-1">
              If provided, this user will be added as the organization owner
            </p>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleCreate} 
              disabled={!newOrgName.trim() || createOrg.isPending}
            >
              {createOrg.isPending ? "Creating..." : "Create Organization"}
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
                <h3 className="font-semibold">Delete Organization</h3>
                <p className="text-sm text-muted-foreground">This action cannot be undone</p>
              </div>
              <button 
                onClick={() => setDeleteConfirm(null)} 
                className="ml-auto p-1 hover:bg-muted rounded"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              This will permanently delete the organization and remove all member associations.
              Bucket assignments will also be removed.
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
                Cancel
              </Button>
              <Button 
                variant="danger" 
                onClick={() => handleDelete(deleteConfirm)}
                disabled={deleteOrg.isPending}
              >
                {deleteOrg.isPending ? "Deleting..." : "Delete Organization"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
