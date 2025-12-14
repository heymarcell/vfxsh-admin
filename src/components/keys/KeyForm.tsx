import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateAccessKey } from "../../api/keys";
import { useUsers } from "../../api/users";
import Modal from "../ui/Modal";
import Input from "../ui/Input";
import Button from "../ui/Button";
import KeySecret from "./KeySecret";

const keySchema = z.object({
  user_id: z.string().min(1, "User is required"),
  name: z.string().optional(),
  expiration: z.string().optional(),
});

type KeyFormData = z.infer<typeof keySchema>;

interface KeyFormProps {
  onClose: () => void;
}

export default function KeyForm({ onClose }: KeyFormProps) {
  const [createdKey, setCreatedKey] = useState<{
    accessKeyId: string;
    secretKey: string;
  } | null>(null);

  const createKey = useCreateAccessKey();
  const { data: users } = useUsers();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<KeyFormData>({
    resolver: zodResolver(keySchema),
  });

  const onSubmit = async (data: KeyFormData) => {
    try {
      const result = await createKey.mutateAsync(data);
      setCreatedKey({
        accessKeyId: result.access_key_id,
        secretKey: result.secret_key,
      });
    } catch (error) {
      console.error("Failed to create key:", error);
    }
  };

  if (createdKey) {
    return (
      <KeySecret
        accessKeyId={createdKey.accessKeyId}
        secretKey={createdKey.secretKey}
        onClose={onClose}
      />
    );
  }

  return (
    <Modal isOpen={true} onClose={onClose} title="Create Access Key">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1">
          <label className="block text-sm font-medium text-slate-300">
            User
          </label>
          <select
            className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            {...register("user_id")}
          >
            <option value="">Select a user</option>
            {users?.map((user) => (
              <option key={user.id} value={user.id}>
                {user.email || user.name || user.id}
              </option>
            ))}
          </select>
          {errors.user_id && (
            <p className="text-sm text-red-400">{errors.user_id.message}</p>
          )}
        </div>

        <Input
          label="Key Name (optional)"
          placeholder="e.g., Production Key"
          error={errors.name?.message}
          {...register("name")}
        />

        <Input
          label="Expiration (optional)"
          type="datetime-local"
          error={errors.expiration?.message}
          {...register("expiration")}
        />

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Create Key"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
