import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateBucket } from "../../api/buckets";
import { useProviders } from "../../api/providers";
import Modal from "../ui/Modal";
import Input from "../ui/Input";
import Button from "../ui/Button";

const bucketSchema = z.object({
  bucket_name: z.string().min(1, "Bucket name is required").regex(/^[a-z0-9-]+$/, "Only lowercase letters, numbers, and hyphens"),
  provider_id: z.string().min(1, "Provider is required"),
  remote_bucket_name: z.string().min(1, "Remote bucket name is required"),
});

type BucketFormData = z.infer<typeof bucketSchema>;

interface BucketFormProps {
  onClose: () => void;
}

export default function BucketForm({ onClose }: BucketFormProps) {
  const createBucket = useCreateBucket();
  const { data: providers } = useProviders();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<BucketFormData>({
    resolver: zodResolver(bucketSchema),
  });

  const onSubmit = async (data: BucketFormData) => {
    try {
      await createBucket.mutateAsync(data);
      onClose();
    } catch (error) {
      console.error("Failed to create bucket:", error);
    }
  };

  return (
    <Modal isOpen={true} onClose={onClose} title="Create Bucket Mapping">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Bucket Name"
          placeholder="e.g., my-project"
          error={errors.bucket_name?.message}
          {...register("bucket_name")}
        />

        <div className="space-y-1">
          <label className="block text-sm font-medium text-slate-300">
            Provider
          </label>
          <select
            className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            {...register("provider_id")}
          >
            <option value="">Select a provider</option>
            {providers?.map((provider) => (
              <option key={provider.id} value={provider.id}>
                {provider.name}
              </option>
            ))}
          </select>
          {errors.provider_id && (
            <p className="text-sm text-red-400">{errors.provider_id.message}</p>
          )}
        </div>

        <Input
          label="Remote Bucket Name"
          placeholder="Actual bucket name on the provider"
          error={errors.remote_bucket_name?.message}
          {...register("remote_bucket_name")}
        />

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Create Bucket"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
