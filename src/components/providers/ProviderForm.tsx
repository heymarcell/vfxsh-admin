import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateProvider } from "../../api/providers";
import Modal from "../ui/Modal";
import Input from "../ui/Input";
import Button from "../ui/Button";

const providerSchema = z.object({
  id: z.string().min(1, "ID is required").regex(/^[a-z0-9-]+$/, "Only lowercase letters, numbers, and hyphens"),
  name: z.string().min(1, "Name is required"),
  endpoint_url: z.string().url("Must be a valid URL"),
  access_key_id: z.string().min(1, "Access Key ID is required"),
  secret_access_key: z.string().min(1, "Secret Access Key is required"),
  region: z.string().optional(),
});

type ProviderFormData = z.infer<typeof providerSchema>;

interface ProviderFormProps {
  onClose: () => void;
}

export default function ProviderForm({ onClose }: ProviderFormProps) {
  const createProvider = useCreateProvider();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProviderFormData>({
    resolver: zodResolver(providerSchema),
    defaultValues: {
      region: "auto",
    },
  });

  const onSubmit = async (data: ProviderFormData) => {
    try {
      await createProvider.mutateAsync(data);
      onClose();
    } catch (error) {
      console.error("Failed to create provider:", error);
    }
  };

  return (
    <Modal isOpen={true} onClose={onClose} title="Add Storage Provider">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Provider ID"
          placeholder="e.g., cloudflare-r2"
          error={errors.id?.message}
          {...register("id")}
        />
        <Input
          label="Display Name"
          placeholder="e.g., Cloudflare R2"
          error={errors.name?.message}
          {...register("name")}
        />
        <Input
          label="Endpoint URL"
          placeholder="https://..."
          error={errors.endpoint_url?.message}
          {...register("endpoint_url")}
        />
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
        <Input
          label="Region"
          placeholder="auto"
          error={errors.region?.message}
          {...register("region")}
        />

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Create Provider"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
