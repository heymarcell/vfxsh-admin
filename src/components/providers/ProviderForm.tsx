import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useCreateProvider } from "../../api/providers";
import Button from "../ui/Button";
import Input from "../ui/Input";

const providerSchema = z.object({
  id: z.string().min(1, "ID is required").regex(/^[a-z0-9-]+$/, "Lowercase, numbers, and hyphens only"),
  name: z.string().min(1, "Name is required"),
  endpoint_url: z.string().url("Must be a valid URL"),
  region: z.string().min(1, "Region is required"),
  access_key_id: z.string().min(1, "Access Key ID is required"),
  secret_access_key: z.string().min(1, "Secret Access Key is required"),
});

type ProviderFormValues = z.infer<typeof providerSchema>;

export default function ProviderForm({ onSuccess }: { onSuccess?: () => void }) {
  const createProvider = useCreateProvider();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProviderFormValues>({
    resolver: zodResolver(providerSchema),
  });

  const onSubmit = (data: ProviderFormValues) => {
    createProvider.mutate(data, {
      onSuccess: () => {
        reset();
        onSuccess?.();
      },
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        label="Provider ID (Slug)"
        placeholder="e.g., idrive-eu"
        error={errors.id?.message}
        {...register("id")}
      />

      <Input
        label="Name"
        placeholder="e.g., iDrive Europe"
        error={errors.name?.message}
        {...register("name")}
      />
      
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Region"
          placeholder="e.g., us-east-1"
          error={errors.region?.message}
          {...register("region")}
        />
        <Input
          label="Endpoint URL"
          placeholder="https://..."
          error={errors.endpoint_url?.message}
          {...register("endpoint_url")}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Access Key ID"
          error={errors.access_key_id?.message}
          {...register("access_key_id")}
        />
        
        <Input
          label="Secret Access Key"
          type="password"
          error={errors.secret_access_key?.message}
          {...register("secret_access_key")}
        />
      </div>

      <Button type="submit" isLoading={createProvider.isPending} className="w-full">
        Create Provider
      </Button>
    </form>
  );
}

