import { useState } from "react";
import { useCreateAccessKey } from "../../api/keys";
import { useUsers } from "../../api/users";
import type { S3AccessKey } from "../../types/api";
import Button from "../ui/Button";
import Input from "../ui/Input";
import KeySecret from "./KeySecret";
import { Search, X } from "lucide-react";

export default function KeyForm({ onSuccess }: { onSuccess?: () => void }) {
  const createKey = useCreateAccessKey();
  const { data: users } = useUsers();
  const [createdKey, setCreatedKey] = useState<S3AccessKey | null>(null);

  // Form state
  const [selectedUser, setSelectedUser] = useState<{ id: string; email: string; name?: string } | null>(null);
  const [userSearch, setUserSearch] = useState("");
  const [name, setName] = useState("");
  const [expiration, setExpiration] = useState("");

  // Filter users based on search
  const filteredUsers = !userSearch.trim() ? [] : (users || [])
    .filter((u: any) => {
      const q = userSearch.toLowerCase();
      return u.email?.toLowerCase().includes(q) || u.name?.toLowerCase().includes(q);
    })
    .slice(0, 8);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    createKey.mutate(
      {
        user_id: selectedUser.id,
        name: name || undefined,
        expiration: expiration || undefined,
      },
      {
        onSuccess: (response) => {
          setCreatedKey(response);
          setSelectedUser(null);
          setUserSearch("");
          setName("");
          setExpiration("");
        },
      }
    );
  };

  const handleSecretAcknowledged = () => {
    setCreatedKey(null);
    onSuccess?.();
  };

  const handleSelectUser = (user: any) => {
    setSelectedUser({ id: user.id, email: user.email, name: user.name });
    setUserSearch("");
  };

  return (
    <>
      {createdKey && (
        <KeySecret
          accessKeyId={createdKey.access_key_id}
          secretAccessKey={createdKey.secret_key || "No Secret Returned"}
          onClose={handleSecretAcknowledged}
        />
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium leading-none">User</label>
          
          {selectedUser ? (
            <div className="flex items-center gap-2 p-2 rounded-md border border-primary bg-primary/5">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{selectedUser.email}</p>
                <p className="text-xs text-muted-foreground truncate">{selectedUser.name || "—"}</p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-6 w-6 shrink-0"
                onClick={() => setSelectedUser(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search users by email or name..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-md border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
              {userSearch.trim() && (
                <div className="absolute top-full left-0 right-0 mt-1 border rounded-md bg-card z-10 shadow-lg max-h-[200px] overflow-y-auto">
                  {filteredUsers.length === 0 ? (
                    <p className="p-3 text-sm text-muted-foreground text-center">No matching users</p>
                  ) : (
                    filteredUsers.map((u: any) => (
                      <button
                        key={u.id}
                        type="button"
                        onClick={() => handleSelectUser(u)}
                        className="w-full p-2 text-left hover:bg-muted/30 text-sm border-b last:border-b-0"
                      >
                        <p className="font-medium">{u.email}</p>
                        <p className="text-xs text-muted-foreground">{u.name || "—"}</p>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        <Input
          label="Key Name (Optional)"
          placeholder="Render Farm 01"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <Input
          label="Expiration (Optional)"
          type="datetime-local"
          value={expiration}
          onChange={(e) => setExpiration(e.target.value)}
        />

        <Button 
          type="submit" 
          isLoading={createKey.isPending} 
          className="w-full"
          disabled={!selectedUser}
        >
          Generate Access Key
        </Button>
      </form>
    </>
  );
}
