import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useUpdateProvider } from "../../api/providers";
import Button from "../ui/Button";
import Input from "../ui/Input";
import Modal from "../ui/Modal";
import { useEffect } from "react";
import type { BucketProvider } from "../../types/api";

const providerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  endpoint_url: z.string().url("Must be a valid URL"),
  access_key_id: z.string().optional(),
  secret_access_key: z.string().optional(),
  region: z.string().min(1, "Region is required"),
});

type ProviderFormData = z.infer<typeof providerSchema>;

interface ProviderEditModalProps {
  provider: BucketProvider | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ProviderEditModal({ provider, isOpen, onClose }: ProviderEditModalProps) {
  const updateProvider = useUpdateProvider();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProviderFormData>({
    resolver: zodResolver(providerSchema),
  });

  useEffect(() => {
    if (provider) {
      reset({
        name: provider.name,
        endpoint_url: provider.endpoint_url,
        access_key_id: "",
        secret_access_key: "",
        region: provider.region,
      });
    }
  }, [provider, reset]);

  const onSubmit = (data: ProviderFormData) => {
    if (!provider) return;
    
    const payload: Record<string, string | undefined> = {
      name: data.name,
      endpoint_url: data.endpoint_url,
      region: data.region,
    };

    // Only include credentials if provided
    if (data.access_key_id) {
      payload.access_key_id = data.access_key_id;
    }
    if (data.secret_access_key) {
      payload.secret_access_key = data.secret_access_key;
    }

    updateProvider.mutate(
      { id: provider.id, ...payload },
      {
        onSuccess: () => {
          onClose();
          reset();
        },
      }
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Storage Provider">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-4">
        <Input
          label="Display Name"
          error={errors.name?.message}
          {...register("name")}
        />
        
        <Input
          label="Endpoint URL"
          placeholder="https://s3.example.com"
          error={errors.endpoint_url?.message}
          {...register("endpoint_url")}
        />

        <Input
          label="Region"
          placeholder="us-east-1"
          error={errors.region?.message}
          {...register("region")}
        />

        <div className="border-t pt-4 mt-4">
          <h3 className="text-sm font-medium mb-4">Credentials (Leave blank to keep unchanged)</h3>
          <div className="space-y-4">
            <Input
              label="Access Key ID"
              placeholder="Leave blank to keep unchanged"
              error={errors.access_key_id?.message}
              {...register("access_key_id")}
            />
            <Input
              label="Secret Access Key"
              type="password"
              placeholder="Leave blank to keep unchanged"
              error={errors.secret_access_key?.message}
              {...register("secret_access_key")}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={updateProvider.isPending}>
            Save Changes
          </Button>
        </div>
      </form>
    </Modal>
  );
}
