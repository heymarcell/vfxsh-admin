/**
 * Platform Providers Page - Super Admin Only
 * Manage S3 backend providers
 */
import { useState } from "react";
import { Plus, Database, Trash2, Globe, X } from "lucide-react";
import { usePlatformProviders, useCreateProvider, useDeleteProvider } from "../../api/platform";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import Input from "../../components/ui/Input";

export default function PlatformProviders() {
  const { data: providers, isLoading } = usePlatformProviders();
  const createProvider = useCreateProvider();
  const deleteProvider = useDeleteProvider();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    endpoint_url: "",
    access_key_id: "",
    secret_access_key: "",
    region: "us-east-1",
  });

  const handleCreate = async () => {
    if (!formData.id || !formData.name || !formData.endpoint_url) return;
    
    await createProvider.mutateAsync(formData);
    
    setFormData({
      id: "",
      name: "",
      endpoint_url: "",
      access_key_id: "",
      secret_access_key: "",
      region: "us-east-1",
    });
    setIsModalOpen(false);
  };

  const handleDelete = async (id: string) => {
    await deleteProvider.mutateAsync(id);
    setDeleteConfirm(null);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Providers</h1>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2].map((i) => (
            <div key={i} className="h-36 rounded-lg border border-border bg-card/50 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Providers</h1>
        <Button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Provider
        </Button>
      </div>

      {/* Providers Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {providers?.map((provider) => (
          <div
            key={provider.id}
            className="rounded-lg border border-border bg-card p-4 hover:border-primary/50 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
                  <Database className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <h3 className="font-semibold">{provider.name}</h3>
                  <p className="text-xs text-muted-foreground font-mono">{provider.id}</p>
                </div>
              </div>
              <button
                onClick={() => setDeleteConfirm(provider.id)}
                className="p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
            
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Globe className="h-4 w-4" />
                <span className="truncate">{provider.endpoint_url}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <span className="px-2 py-0.5 bg-muted rounded text-xs">{provider.region}</span>
                <span className={`px-2 py-0.5 rounded text-xs ${provider.enabled ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>
                  {provider.enabled ? "Enabled" : "Disabled"}
                </span>
              </div>
            </div>
          </div>
        ))}

        {providers?.length === 0 && (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            <Database className="h-12 w-12 mx-auto mb-4 opacity-30" />
            <p>No providers configured</p>
            <p className="text-sm">Add your first S3-compatible provider</p>
          </div>
        )}
      </div>

      {/* Create Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Provider"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Provider ID</label>
              <Input
                value={formData.id}
                onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                placeholder="idrive-main"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Display Name</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="iDrive E2"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Endpoint URL</label>
            <Input
              value={formData.endpoint_url}
              onChange={(e) => setFormData({ ...formData, endpoint_url: e.target.value })}
              placeholder="https://s3.example.com"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Access Key ID</label>
              <Input
                value={formData.access_key_id}
                onChange={(e) => setFormData({ ...formData, access_key_id: e.target.value })}
                placeholder="AKIA..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Secret Access Key</label>
              <Input
                type="password"
                value={formData.secret_access_key}
                onChange={(e) => setFormData({ ...formData, secret_access_key: e.target.value })}
                placeholder="••••••••"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Region</label>
            <Input
              value={formData.region}
              onChange={(e) => setFormData({ ...formData, region: e.target.value })}
              placeholder="us-east-1"
            />
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleCreate} 
              disabled={!formData.id || !formData.name || !formData.endpoint_url || createProvider.isPending}
            >
              {createProvider.isPending ? "Adding..." : "Add Provider"}
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
                <h3 className="font-semibold">Delete Provider</h3>
                <p className="text-sm text-muted-foreground">This action cannot be undone</p>
              </div>
              <button onClick={() => setDeleteConfirm(null)} className="ml-auto p-1 hover:bg-muted rounded">
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Provider cannot be deleted if it has active bucket mappings.
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
                Cancel
              </Button>
              <Button 
                variant="danger" 
                onClick={() => handleDelete(deleteConfirm)}
                disabled={deleteProvider.isPending}
              >
                {deleteProvider.isPending ? "Deleting..." : "Delete Provider"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
