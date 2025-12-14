import UserList from "../components/users/UserList";

export default function Users() {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Users</h1>
      </div>

      <UserList />
    </div>
  );
}
