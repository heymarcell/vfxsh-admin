import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useCreateAccessKey } from "../../api/keys";
import { useUsers } from "../../api/users";
import type { S3AccessKey } from "../../types/api";
import Button from "../ui/Button";
import Input from "../ui/Input";
import KeySecret from "./KeySecret";

const keySchema = z.object({
  name: z.string().optional(),
  user_id: z.string().min(1, "User ID / Email is required"),
  expiration: z.string().optional(), // ISO date string
});

type KeyFormValues = z.infer<typeof keySchema>;

export default function KeyForm({ onSuccess }: { onSuccess?: () => void }) {
  const createKey = useCreateAccessKey();
  const { data: users, isLoading: isLoadingUsers } = useUsers();
  const [createdKey, setCreatedKey] = useState<S3AccessKey | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<KeyFormValues>({
    resolver: zodResolver(keySchema),
  });

  const onSubmit = (data: KeyFormValues) => {
    // If expiration is empty string, make it undefined
    const payload = {
      ...data,
      expiration: data.expiration || undefined,
    };
    
    createKey.mutate(payload, {
      onSuccess: (response) => {
        setCreatedKey(response);
        reset();
        // Don't call onSuccess here - wait until user acknowledges secret
      },
    });
  };

  const handleSecretAcknowledged = () => {
    setCreatedKey(null);
    onSuccess?.(); // Now close the parent modal
  };

  return (
    <>
       {/* Modal to show secret only once */}
      {createdKey && (
        <KeySecret
          accessKeyId={createdKey.access_key_id}
          secretAccessKey={createdKey.secret_key || "No Secret Returned"}
          onClose={handleSecretAcknowledged}
        />
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

        <div className="space-y-2">
          <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            User
          </label>
          <select
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            {...register("user_id")}
            disabled={isLoadingUsers}
          >
            <option value="">Select a user...</option>
            {users?.map((user) => (
              <option key={user.id} value={user.id}>
                {user.email} ({user.name || "No Name"})
              </option>
            ))}
          </select>
          {errors.user_id && (
            <p className="text-sm font-medium text-destructive">{errors.user_id.message}</p>
          )}
        </div>

        <Input
          label="Key Name (Optional)"
          placeholder="Render Farm 01"
          {...register("name")}
        />

        <Input
          label="Expiration (Optional)"
          type="datetime-local"
           // Simple nice-to-have: could default to 30 days from now
          {...register("expiration")}
        />

        <Button type="submit" isLoading={createKey.isPending} className="w-full">
          Generate Access Key
        </Button>
      </form>
    </>
  );
}
