import { useState } from "react";
import { Plus } from "lucide-react";
import BucketList from "../components/buckets/BucketList";
import BucketForm from "../components/buckets/BucketForm";
import Button from "../components/ui/Button";

export default function Buckets() {
  const [showForm, setShowForm] = useState(false);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Bucket Mappings</h1>
        <Button onClick={() => setShowForm(true)}>
          <Plus size={20} />
          Create Bucket
        </Button>
      </div>

      <BucketList />

      {showForm && <BucketForm onClose={() => setShowForm(false)} />}
    </div>
  );
}
