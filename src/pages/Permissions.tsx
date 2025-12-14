import { useState } from "react";
import { useBuckets } from "../api/buckets";
import { useUsers } from "../api/users";
import { useGroups } from "../api/groups";
import { useUserAclMatrix, useGroupAclMatrix, useSetUserBucketPermission, useSetGroupBucketPermission } from "../api/acls";
import Button from "../components/ui/Button";
import { ChevronRight, Shield, Users, Group, Search, Plus, X } from "lucide-react";

type PermissionLevel = "none" | "read" | "write" | "admin";

const PERMISSION_COLORS: Record<PermissionLevel, string> = {
  admin: "bg-purple-500/20 text-purple-400 border-purple-500/50",
  write: "bg-blue-500/20 text-blue-400 border-blue-500/50",
  read: "bg-green-500/20 text-green-400 border-green-500/50",
  none: "bg-muted/30 text-muted-foreground border-border",
};

export default function Permissions() {
  const [selectedBucket, setSelectedBucket] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [addingAccess, setAddingAccess] = useState(false);

  const { data: buckets } = useBuckets();
  const { data: users } = useUsers();
  const { data: groups } = useGroups();
  const { data: userAcls } = useUserAclMatrix();
  const { data: groupAcls } = useGroupAclMatrix();

  const setUserPermission = useSetUserBucketPermission();
  const setGroupPermission = useSetGroupBucketPermission();

  // Get access entries for selected bucket
  const getAccessEntries = () => {
    if (!selectedBucket) return [];
    const entries: { id: string; type: "user" | "group"; label: string; sublabel?: string; permission: PermissionLevel }[] = [];

    // Users with access
    if (userAcls) {
      for (const [userId, bucketPerms] of Object.entries(userAcls)) {
        if (bucketPerms[selectedBucket]) {
          const user = users?.find(u => u.id === userId);
          entries.push({
            id: userId,
            type: "user",
            label: user?.email || userId,
            sublabel: user?.name,
            permission: bucketPerms[selectedBucket] as PermissionLevel,
          });
        }
      }
    }

    // Groups with access
    if (groupAcls) {
      for (const [groupId, bucketPerms] of Object.entries(groupAcls)) {
        if (bucketPerms[selectedBucket]) {
          const group = groups?.find(g => g.id === groupId);
          entries.push({
            id: groupId,
            type: "group",
            label: group?.name || groupId,
            sublabel: group?.description,
            permission: bucketPerms[selectedBucket] as PermissionLevel,
          });
        }
      }
    }

    return entries.sort((a, b) => a.label.localeCompare(b.label));
  };

  // Filter entities for adding new access
  const getAvailableEntities = () => {
    if (!selectedBucket) return { users: [], groups: [] };
    
    const currentUserIds = new Set(Object.keys(userAcls || {}).filter(id => userAcls?.[id]?.[selectedBucket]));
    const currentGroupIds = new Set(Object.keys(groupAcls || {}).filter(id => groupAcls?.[id]?.[selectedBucket]));

    const availableUsers = users?.filter(u => 
      !currentUserIds.has(u.id) && 
      (u.email?.toLowerCase().includes(searchQuery.toLowerCase()) || u.name?.toLowerCase().includes(searchQuery.toLowerCase()))
    ) || [];

    const availableGroups = groups?.filter(g => 
      !currentGroupIds.has(g.id) && 
      g.name.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

    return { users: availableUsers, groups: availableGroups };
  };

  const handlePermissionChange = (entityId: string, entityType: "user" | "group", permission: PermissionLevel) => {
    if (!selectedBucket) return;
    if (entityType === "user") {
      setUserPermission.mutate({ userId: entityId, bucketName: selectedBucket, permission: permission === "none" ? null : permission });
    } else {
      setGroupPermission.mutate({ groupId: entityId, bucketName: selectedBucket, permission: permission === "none" ? null : permission });
    }
  };

  const handleAddAccess = (entityId: string, entityType: "user" | "group") => {
    if (!selectedBucket) return;
    handlePermissionChange(entityId, entityType, "read");
    setSearchQuery("");
    setAddingAccess(false);
  };

  const accessEntries = getAccessEntries();
  const { users: availableUsers, groups: availableGroups } = getAvailableEntities();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Permissions</h1>
        <p className="text-muted-foreground mt-1">
          Select a bucket to manage access permissions
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bucket List */}
        <div className="lg:col-span-1">
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="p-4 border-b border-border bg-muted/30">
              <h2 className="font-semibold flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Buckets
              </h2>
            </div>
            <div className="divide-y divide-border max-h-[500px] overflow-y-auto">
              {buckets?.map((bucket) => {
                const accessCount = (
                  Object.values(userAcls || {}).filter(b => b[bucket.bucket_name]).length +
                  Object.values(groupAcls || {}).filter(b => b[bucket.bucket_name]).length
                );
                return (
                  <button
                    key={bucket.bucket_name}
                    onClick={() => { setSelectedBucket(bucket.bucket_name); setAddingAccess(false); }}
                    className={`w-full p-4 text-left hover:bg-muted/30 transition-colors flex items-center justify-between ${
                      selectedBucket === bucket.bucket_name ? "bg-primary/10 border-l-2 border-l-primary" : ""
                    }`}
                  >
                    <div>
                      <code className="font-mono text-sm font-medium text-primary">{bucket.bucket_name}</code>
                      <p className="text-xs text-muted-foreground mt-0.5">{bucket.provider_name}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">{accessCount} grants</span>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Access Panel */}
        <div className="lg:col-span-2">
          {selectedBucket ? (
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <div className="p-4 border-b border-border bg-muted/30 flex items-center justify-between">
                <div>
                  <h2 className="font-semibold">
                    Access for <code className="text-primary">{selectedBucket}</code>
                  </h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {accessEntries.length} users/groups with access
                  </p>
                </div>
                <Button size="sm" onClick={() => setAddingAccess(!addingAccess)}>
                  {addingAccess ? <X className="h-4 w-4 mr-1" /> : <Plus className="h-4 w-4 mr-1" />}
                  {addingAccess ? "Cancel" : "Add Access"}
                </Button>
              </div>

              {/* Add Access Panel */}
              {addingAccess && (
                <div className="p-4 border-b border-border bg-muted/10">
                  <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Search users or groups..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4 max-h-[200px] overflow-y-auto">
                    <div>
                      <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-2 flex items-center gap-1">
                        <Users className="h-3 w-3" /> Users
                      </h4>
                      {availableUsers.slice(0, 5).map(user => (
                        <button
                          key={user.id}
                          onClick={() => handleAddAccess(user.id, "user")}
                          className="w-full text-left p-2 rounded-lg hover:bg-muted/50 text-sm mb-1"
                        >
                          {user.email}
                        </button>
                      ))}
                      {availableUsers.length === 0 && <p className="text-xs text-muted-foreground">No users available</p>}
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-2 flex items-center gap-1">
                        <Group className="h-3 w-3" /> Groups
                      </h4>
                      {availableGroups.slice(0, 5).map(group => (
                        <button
                          key={group.id}
                          onClick={() => handleAddAccess(group.id, "group")}
                          className="w-full text-left p-2 rounded-lg hover:bg-muted/50 text-sm mb-1"
                        >
                          {group.name}
                        </button>
                      ))}
                      {availableGroups.length === 0 && <p className="text-xs text-muted-foreground">No groups available</p>}
                    </div>
                  </div>
                </div>
              )}

              {/* Access Entries */}
              <div className="divide-y divide-border">
                {accessEntries.map((entry) => (
                  <div key={entry.id} className="p-4 flex items-center justify-between hover:bg-muted/10">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${entry.type === "user" ? "bg-blue-500/10 text-blue-400" : "bg-purple-500/10 text-purple-400"}`}>
                        {entry.type === "user" ? <Users className="h-4 w-4" /> : <Group className="h-4 w-4" />}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{entry.label}</p>
                        {entry.sublabel && <p className="text-xs text-muted-foreground">{entry.sublabel}</p>}
                      </div>
                    </div>
                    <select
                      value={entry.permission}
                      onChange={(e) => handlePermissionChange(entry.id, entry.type, e.target.value as PermissionLevel)}
                      className={`text-xs font-medium rounded-md border px-3 py-1.5 cursor-pointer transition-all focus:outline-none focus:ring-2 focus:ring-ring ${PERMISSION_COLORS[entry.permission]}`}
                    >
                      <option value="none">Remove</option>
                      <option value="read">Read</option>
                      <option value="write">Write</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                ))}
                {accessEntries.length === 0 && (
                  <div className="p-8 text-center text-muted-foreground">
                    <p>No one has access to this bucket yet.</p>
                    <p className="text-sm mt-1">Click "Add Access" to grant permissions.</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-border p-12 text-center text-muted-foreground">
              <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">Select a bucket</p>
              <p className="text-sm mt-1">Choose a bucket from the left to manage its access permissions</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
