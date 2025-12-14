import { Plus } from "lucide-react";
import { useState } from "react";
import BucketList from "../components/buckets/BucketList";
import BucketForm from "../components/buckets/BucketForm";
import Modal from "../components/ui/Modal";
import Button from "../components/ui/Button";

export default function Buckets() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Bucket Mappings</h1>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Map New Bucket
        </Button>
      </div>

      <BucketList />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Map Remote Bucket"
      >
        <BucketForm onSuccess={() => setIsModalOpen(false)} />
      </Modal>
    </div>
  );
}
