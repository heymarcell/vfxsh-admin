import { useForm } from "react-hook-form";
import { useCreateGroup } from "../../api/groups";
import type { CreateGroupRequest } from "../../types/api";
import Button from "../ui/Button";
import Input from "../ui/Input";

interface GroupFormProps {
  onSuccess?: () => void;
}

export default function GroupForm({ onSuccess }: GroupFormProps) {
  const { register, handleSubmit, formState: { errors } } = useForm<CreateGroupRequest>();
  const createGroup = useCreateGroup();

  const onSubmit = (data: CreateGroupRequest) => {
    createGroup.mutate(data, {
      onSuccess: () => {
        onSuccess?.();
      },
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        label="Group ID (Slug)"
        {...register("id", { required: "Group ID is required", pattern: { value: /^[a-z0-9-]+$/, message: "Lowercase, numbers, and hyphens only" } })}
        error={errors.id?.message}
        placeholder="editors-eu"
      />
      
      <Input
        label="Display Name"
        {...register("name", { required: "Name is required" })}
        error={errors.name?.message}
        placeholder="European Editors"
      />

      <div className="flex justify-end pt-4">
        <Button type="submit" isLoading={createGroup.isPending}>
          Create Group
        </Button>
      </div>
    </form>
  );
}
