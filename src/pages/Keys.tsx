import { Plus } from "lucide-react";
import { useState } from "react";
import KeyList from "../components/keys/KeyList";
import KeyForm from "../components/keys/KeyForm";
import Modal from "../components/ui/Modal";
import Button from "../components/ui/Button";

export default function Keys() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Access Keys</h1>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Access Key
        </Button>
      </div>

      <KeyList />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="New Access Key"
      >
        <KeyForm onSuccess={() => setIsModalOpen(false)} />
      </Modal>
    </div>
  );
}
