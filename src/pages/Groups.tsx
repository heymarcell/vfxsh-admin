import { Plus } from "lucide-react";
import { useState } from "react";
import GroupList from "../components/groups/GroupList";
import GroupForm from "../components/groups/GroupForm";
import Modal from "../components/ui/Modal";
import Button from "../components/ui/Button";

export default function Groups() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">User Groups</h1>
          <p className="text-muted-foreground">
            Manage teams and control their access to buckets.
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Group
        </Button>
      </div>

      <GroupList />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create New Group"
      >
        <GroupForm onSuccess={() => setIsModalOpen(false)} />
      </Modal>
    </div>
  );
}
