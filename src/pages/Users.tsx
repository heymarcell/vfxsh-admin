import UserList from "../components/users/UserList";
import { InviteUserModal } from "../components/users/InviteUserModal";

export default function Users() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
        <InviteUserModal />
      </div>
      
      <p className="text-muted-foreground">
        Manage user bucket permissions (ACLs). Users are automatically synchronized from Clerk when they first sign in.
      </p>

      <UserList />
    </div>
  );
}
