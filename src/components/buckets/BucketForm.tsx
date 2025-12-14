import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useCreateBucket } from "../../api/buckets";
import { useProviders } from "../../api/providers";
import Button from "../ui/Button";
import Input from "../ui/Input";

const bucketSchema = z.object({
  bucket_name: z.string().min(1, "Virtual bucket name is required"),
  provider_id: z.string().min(1, "Provider is required"),
  remote_bucket_name: z.string().min(1, "Remote bucket name is required"),
});

type BucketFormValues = z.infer<typeof bucketSchema>;

export default function BucketForm({ onSuccess }: { onSuccess?: () => void }) {
  const { data: providers } = useProviders();
  const createBucket = useCreateBucket();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<BucketFormValues>({
    resolver: zodResolver(bucketSchema),
  });

  const onSubmit = (data: BucketFormValues) => {
    createBucket.mutate(data, {
      onSuccess: () => {
        reset();
        onSuccess?.();
      },
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        label="Virtual Bucket Name"
        placeholder="project-alpha"
        error={errors.bucket_name?.message}
        {...register("bucket_name")}
      />
      
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-foreground">Storage Provider</label>
        <select
          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          {...register("provider_id")}
        >
          <option value="">Select a provider...</option>
          {providers?.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
        {errors.provider_id && (
          <p className="text-[0.8rem] font-medium text-destructive">{errors.provider_id.message}</p>
        )}
      </div>

      <Input
        label="Remote Bucket Name"
        placeholder="s3-bucket-name"
        error={errors.remote_bucket_name?.message}
        {...register("remote_bucket_name")}
      />

      <Button type="submit" isLoading={createBucket.isPending} className="w-full">
        Create Mapping
      </Button>
    </form>
  );
}
