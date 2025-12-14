import { Trash2, Search, UserPlus, Upload } from "lucide-react";
import { useState } from "react";
import { useAddGroupMember, useGroup, useRemoveGroupMember, useBulkAddGroupMembers } from "../../api/groups";
import { useUsers } from "../../api/users";
import Button from "../ui/Button";
import Modal from "../ui/Modal";

interface GroupManageModalProps {
  groupId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function GroupManageModal({ groupId, isOpen, onClose }: GroupManageModalProps) {
  const { data: groupDetails, isLoading } = useGroup(groupId || "");
  const { data: users } = useUsers();
  
  const addMember = useAddGroupMember();
  const removeMember = useRemoveGroupMember();
  const bulkAdd = useBulkAddGroupMembers();

  const [addSearch, setAddSearch] = useState("");
  const [memberSearch, setMemberSearch] = useState("");
  const [showBulkImport, setShowBulkImport] = useState(false);
  const [bulkEmails, setBulkEmails] = useState("");
  const [bulkResult, setBulkResult] = useState<{ added: number; skipped: number } | null>(null);

  // Moved hooks before early return
  const memberIds = new Set(groupDetails?.members?.map((m: any) => m.id) || []);
  
  const availableUsers = !addSearch.trim() ? [] : (users || [])
    .filter((u: any) => !memberIds.has(u.id))
    .filter((u: any) => {
      const q = addSearch.toLowerCase();
      return u.email?.toLowerCase().includes(q) || u.name?.toLowerCase().includes(q);
    })
    .slice(0, 8);

  const filteredMembers = !groupDetails?.members ? [] : 
    !memberSearch.trim() ? groupDetails.members :
    groupDetails.members.filter((m: any) => {
      const q = memberSearch.toLowerCase();
      return m.email?.toLowerCase().includes(q) || m.name?.toLowerCase().includes(q);
    });

  if (!groupId) return null;

  const handleAddMember = (userId: string) => {
    addMember.mutate(
      { groupId, userId },
      { onSuccess: () => setAddSearch("") }
    );
  };

  const handleRemoveMember = (userId: string) => {
    if (confirm("Remove this user from the group?")) {
      removeMember.mutate({ groupId, userId });
    }
  };

  const handleBulkImport = () => {
    const emails = bulkEmails
      .split(/[\n,;]/)
      .map(e => e.trim())
      .filter(e => e.includes("@"));
    
    if (emails.length === 0) return;
    
    bulkAdd.mutate(
      { groupId, emails },
      {
        onSuccess: (result) => {
          setBulkResult({ added: result.added, skipped: result.skipped });
          setBulkEmails("");
        },
      }
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Manage ${groupDetails?.group?.name || "Group"}`}>
      <div className="space-y-6 pt-4">
        
        {/* Add Member Section */}
        <div className="border-b pb-6">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium leading-none">Add Members</label>
            <button
              onClick={() => { setShowBulkImport(!showBulkImport); setBulkResult(null); }}
              className="text-xs text-primary hover:underline flex items-center gap-1"
            >
              <Upload className="h-3 w-3" />
              {showBulkImport ? "Search" : "Bulk Import"}
            </button>
          </div>

          {showBulkImport ? (
            <div className="space-y-3">
              <textarea
                placeholder="Paste emails (one per line, comma, or semicolon separated)..."
                value={bulkEmails}
                onChange={(e) => setBulkEmails(e.target.value)}
                className="w-full h-24 p-3 rounded-md border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none font-mono"
              />
              <div className="flex items-center justify-between">
                {bulkResult && (
                  <p className="text-sm text-muted-foreground">
                    Added {bulkResult.added}, skipped {bulkResult.skipped}
                  </p>
                )}
                <Button
                  onClick={handleBulkImport}
                  disabled={!bulkEmails.trim() || bulkAdd.isPending}
                  isLoading={bulkAdd.isPending}
                  size="sm"
                  className="ml-auto"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Import
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search users by email or name..."
                  value={addSearch}
                  onChange={(e) => setAddSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-md border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              {addSearch.trim() && (
                <div className="mt-2 border rounded-md divide-y max-h-[200px] overflow-y-auto">
                  {availableUsers.length === 0 ? (
                    <p className="p-3 text-sm text-muted-foreground text-center">No matching users</p>
                  ) : (
                    availableUsers.map((u: any) => (
                      <button
                        key={u.id}
                        onClick={() => handleAddMember(u.id)}
                        disabled={addMember.isPending}
                        className="w-full p-2 text-left hover:bg-muted/30 flex items-center justify-between text-sm"
                      >
                        <div>
                          <p className="font-medium">{u.email}</p>
                          <p className="text-xs text-muted-foreground">{u.name || "—"}</p>
                        </div>
                        <UserPlus className="h-4 w-4 text-muted-foreground" />
                      </button>
                    ))
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Members List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-muted-foreground">
              Members ({groupDetails?.members?.length || 0})
            </h3>
          </div>
          
          {(groupDetails?.members?.length || 0) > 5 && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Filter members..."
                value={memberSearch}
                onChange={(e) => setMemberSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-md border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          )}
          
          {isLoading && <p className="text-sm text-muted-foreground">Loading...</p>}
          
          {!isLoading && groupDetails?.members?.length === 0 && (
            <p className="text-sm text-muted-foreground italic py-4 text-center">No members in this group.</p>
          )}

          <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
            {filteredMembers.map((member: any) => (
              <div key={member.id} className="flex items-center justify-between p-2 rounded-md border bg-muted/20">
                <div className="text-sm min-w-0 flex-1">
                  <p className="font-medium truncate">{member.email}</p>
                  <p className="text-xs text-muted-foreground truncate">{member.name || "—"}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8 shrink-0"
                  onClick={() => handleRemoveMember(member.id)}
                  disabled={removeMember.isPending && removeMember.variables?.userId === member.id}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            {memberSearch && filteredMembers.length === 0 && groupDetails?.members?.length !== 0 && (
              <p className="text-sm text-muted-foreground text-center py-2">No members match "{memberSearch}"</p>
            )}
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <Button variant="ghost" onClick={onClose}>Close</Button>
        </div>
      </div>
    </Modal>
  );
}
