import { useState } from "react";
import { Plus } from "lucide-react";
import KeyList from "../components/keys/KeyList";
import KeyForm from "../components/keys/KeyForm";
import Button from "../components/ui/Button";

export default function Keys() {
  const [showForm, setShowForm] = useState(false);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Access Keys</h1>
        <Button onClick={() => setShowForm(true)}>
          <Plus size={20} />
          Create Key
        </Button>
      </div>

      <KeyList />

      {showForm && <KeyForm onClose={() => setShowForm(false)} />}
    </div>
  );
}
