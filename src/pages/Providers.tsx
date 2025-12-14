import { Plus } from "lucide-react";
import { useState } from "react";
import ProviderList from "../components/providers/ProviderList";
import ProviderForm from "../components/providers/ProviderForm";
import Modal from "../components/ui/Modal";
import Button from "../components/ui/Button";

export default function Providers() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Storage Providers</h1>
        <Button onClick={() => setIsModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Provider
        </Button>
      </div>
      
      <ProviderList />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Connect Storage Provider"
      >
        <ProviderForm onSuccess={() => setIsModalOpen(false)} />
      </Modal>
    </div>
  );
}
