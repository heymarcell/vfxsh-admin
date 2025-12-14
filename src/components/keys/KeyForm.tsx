import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useCreateAccessKey } from "../../api/keys";
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
        onSuccess?.();
      },
    });
  };

  return (
    <>
       {/* Modal to show secret only once */}
      {createdKey && (
        <KeySecret
          accessKeyId={createdKey.access_key_id}
          secretAccessKey={createdKey.secret_key || "No Secret Returned"}
          onClose={() => setCreatedKey(null)}
        />
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

        <Input
          label="User Email or ID"
          placeholder="artist@studio.com"
          error={errors.user_id?.message}
          {...register("user_id")}
        />

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
