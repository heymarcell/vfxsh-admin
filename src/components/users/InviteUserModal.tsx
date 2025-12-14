import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { UserPlus } from 'lucide-react';
import { useInviteUser } from '../../api/users';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Modal from '../ui/Modal';

const formSchema = z.object({
  email: z.string().email(),
  role: z.enum(['admin', 'member', 'viewer', 'owner']),
});

type FormData = z.infer<typeof formSchema>;

export function InviteUserModal() {
  const [open, setOpen] = useState(false);
  const inviteUser = useInviteUser();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      role: 'member',
    },
  });

  async function onSubmit(values: FormData) {
    try {
      await inviteUser.mutateAsync({ email: values.email, role: values.role });
      setOpen(false);
      reset();
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <UserPlus className="mr-2 h-4 w-4" />
        Invite User
      </Button>

      <Modal isOpen={open} onClose={() => setOpen(false)} title="Invite User">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-4">
          <Input
            label="Email Address"
            placeholder="user@example.com"
            error={errors.email?.message}
            {...register("email")}
          />
          
          <div className="space-y-2">
            <label className="text-sm font-medium leading-none">Role</label>
            <select
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              {...register("role")}
            >
              <option value="member">Member</option>
              <option value="owner">Owner</option>
              <option value="viewer">Viewer</option>
            </select>
            {errors.role && (
               <p className="text-sm text-destructive">{errors.role.message}</p>
            )}
          </div>
          
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={inviteUser.isPending}>
              Send Invitation
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
