import { Shield, Users, UserCog, Trash2, Search } from "lucide-react";
import { useState, useMemo } from "react";
import { useGroups, useDeleteGroup } from "../../api/groups";
import Table, { TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/Table";
import Button from "../ui/Button";
import GroupManageModal from "./GroupManageModal";

export default function GroupList() {
  const { data: groups, isLoading } = useGroups();
  const deleteGroup = useDeleteGroup();
  const [managingGroupId, setManagingGroupId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const filteredGroups = useMemo(() => {
    if (!groups) return [];
    if (!search.trim()) return groups;
    const q = search.toLowerCase();
    return groups.filter((g) => 
      g.name.toLowerCase().includes(q) || 
      g.id.toLowerCase().includes(q) ||
      g.description?.toLowerCase().includes(q)
    );
  }, [groups, search]);

  const handleDelete = (groupId: string, groupName: string) => {
    if (confirm(`Delete group "${groupName}"? This will remove all members and bucket access.`)) {
      deleteGroup.mutate(groupId);
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center text-muted-foreground">Loading groups...</div>;
  }

  if (!groups?.length) {
    return (
      <div className="rounded-md border border-dashed border-border p-12 text-center">
        <h3 className="text-lg font-medium">No Groups</h3>
        <p className="text-sm text-muted-foreground mt-1">Create a group to organize users.</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search groups..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full max-w-sm pl-10 pr-4 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div className="rounded-lg border border-border overflow-hidden bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>ID</TableHead>
                <TableHead>Members</TableHead>
                <TableHead className="w-[150px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredGroups.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center h-24 text-muted-foreground">
                    No groups match "{search}"
                  </TableCell>
                </TableRow>
              ) : (
                filteredGroups.map((group) => (
                  <TableRow key={group.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-purple-400" />
                        {group.name}
                      </div>
                      {group.description && (
                        <p className="text-xs text-muted-foreground mt-0.5">{group.description}</p>
                      )}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">{group.id}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>{group.members_count ?? 0}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => setManagingGroupId(group.id)}
                          title="Manage Members"
                        >
                          <UserCog className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleDelete(group.id, group.name)}
                          disabled={deleteGroup.isPending}
                          title="Delete Group"
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
      
      <GroupManageModal 
        groupId={managingGroupId}
        isOpen={!!managingGroupId}
        onClose={() => setManagingGroupId(null)}
      />
    </>
  );
}
