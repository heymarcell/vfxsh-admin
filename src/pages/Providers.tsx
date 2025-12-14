import { useState } from "react";
import { Plus } from "lucide-react";
import ProviderList from "../components/providers/ProviderList";
import ProviderForm from "../components/providers/ProviderForm";
import Button from "../components/ui/Button";

export default function Providers() {
  const [showForm, setShowForm] = useState(false);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Storage Providers</h1>
        <Button onClick={() => setShowForm(true)}>
          <Plus size={20} />
          Add Provider
        </Button>
      </div>

      <ProviderList />

      {showForm && <ProviderForm onClose={() => setShowForm(false)} />}
    </div>
  );
}
