import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useUpdateBucket } from "../../api/buckets";
import { useProviders } from "../../api/providers";
import Button from "../ui/Button";
import Input from "../ui/Input";
import Modal from "../ui/Modal";
import { useEffect } from "react";
import type { BucketMapping } from "../../types/api";

const bucketSchema = z.object({
  provider_id: z.string().min(1, "Provider is required"),
  remote_bucket_name: z.string().min(1, "Remote bucket name is required"),
});

type BucketFormData = z.infer<typeof bucketSchema>;

interface BucketEditModalProps {
  bucket: BucketMapping | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function BucketEditModal({ bucket, isOpen, onClose }: BucketEditModalProps) {
  const updateBucket = useUpdateBucket();
  const { data: providers } = useProviders();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<BucketFormData>({
    resolver: zodResolver(bucketSchema),
  });

  useEffect(() => {
    if (bucket) {
      reset({
        provider_id: bucket.provider_id || '',
        remote_bucket_name: bucket.remote_bucket_name || '',
      });
    }
  }, [bucket, reset]);

  const onSubmit = (data: BucketFormData) => {
    if (!bucket) return;

    updateBucket.mutate(
      { bucket_name: bucket.bucket_name, ...data },
      {
        onSuccess: () => {
          onClose();
          reset();
        },
      }
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Edit Bucket: ${bucket?.bucket_name}`}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-4">
        <div className="space-y-2">
          <label className="text-sm font-medium leading-none">Provider</label>
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
            <p className="text-sm text-destructive">{errors.provider_id.message}</p>
          )}
        </div>

        <Input
          label="Remote Bucket Name"
          placeholder="actual-bucket-name-on-provider"
          error={errors.remote_bucket_name?.message}
          {...register("remote_bucket_name")}
        />

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={updateBucket.isPending}>
            Save Changes
          </Button>
        </div>
      </form>
    </Modal>
  );
}
