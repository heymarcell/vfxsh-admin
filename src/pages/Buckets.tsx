import { Plus, ChevronDown, Layers, Database } from "lucide-react";
import { useState } from "react";
import BucketList from "../components/buckets/BucketList";
import BucketForm from "../components/buckets/BucketForm";
import VirtualBucketForm from "../components/buckets/VirtualBucketForm";
import Modal from "../components/ui/Modal";
import Button from "../components/ui/Button";
import { useOrganization } from "../context/OrganizationContext";

export default function Buckets() {
  const [isStandardModalOpen, setIsStandardModalOpen] = useState(false);
  const [isVirtualModalOpen, setIsVirtualModalOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { isSuperAdmin, hasPermission } = useOrganization();

  const canCreateVirtualBucket = hasPermission('virtual-bucket:create');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Bucket Mappings</h1>
        
        {/* Only show if user can create something */}
        {(isSuperAdmin || canCreateVirtualBucket) && (
          <div className="relative">
            {/* If super admin, show dropdown. Otherwise just show virtual bucket button */}
            {isSuperAdmin ? (
              <>
                <Button 
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  New Bucket
                  <ChevronDown className="h-4 w-4" />
                </Button>
                
                {isDropdownOpen && (
                  <>
                    {/* Backdrop to close dropdown */}
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setIsDropdownOpen(false)}
                    />
                    
                    {/* Dropdown menu */}
                    <div className="absolute right-0 mt-2 w-56 rounded-lg border border-border bg-popover shadow-lg z-20">
                      <div className="py-1">
                        <button
                          onClick={() => {
                            setIsStandardModalOpen(true);
                            setIsDropdownOpen(false);
                          }}
                          className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm hover:bg-muted transition-colors"
                        >
                          <Database className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <div className="font-medium">Standard Bucket</div>
                            <div className="text-xs text-muted-foreground">Map to a remote S3 bucket</div>
                          </div>
                        </button>
                        <button
                          onClick={() => {
                            setIsVirtualModalOpen(true);
                            setIsDropdownOpen(false);
                          }}
                          className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm hover:bg-muted transition-colors"
                        >
                          <Layers className="h-4 w-4 text-violet-500" />
                          <div>
                            <div className="font-medium">Virtual Bucket</div>
                            <div className="text-xs text-muted-foreground">Aggregate folders from buckets</div>
                          </div>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </>
            ) : (
              // Non-super admin: just show virtual bucket button
              <Button 
                onClick={() => setIsVirtualModalOpen(true)}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                New Virtual Bucket
              </Button>
            )}
          </div>
        )}
      </div>

      <BucketList />

      {/* Standard Bucket Modal - Super Admin Only */}
      {isSuperAdmin && (
        <Modal
          isOpen={isStandardModalOpen}
          onClose={() => setIsStandardModalOpen(false)}
          title="Map Remote Bucket"
        >
          <BucketForm onSuccess={() => setIsStandardModalOpen(false)} />
        </Modal>
      )}

      {/* Virtual Bucket Modal */}
      <Modal
        isOpen={isVirtualModalOpen}
        onClose={() => setIsVirtualModalOpen(false)}
        title="Create Virtual Bucket"
      >
        <VirtualBucketForm onSuccess={() => setIsVirtualModalOpen(false)} />
      </Modal>
    </div>
  );
}
