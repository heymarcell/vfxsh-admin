import { Trash2, UserPlus } from "lucide-react";
import { useState } from "react";
import { useAddGroupMember, useGroup, useRemoveGroupMember } from "../../api/groups";
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

  const [selectedUserId, setSelectedUserId] = useState("");

  if (!groupId) return null;

  const handleAddMember = () => {
    if (!selectedUserId) return;
    addMember.mutate(
      { groupId, userId: selectedUserId },
      {
        onSuccess: () => {
          setSelectedUserId("");
        },
      }
    );
  };

  const handleRemoveMember = (userId: string) => {
    if (confirm("Are you sure you want to remove this user from the group?")) {
      removeMember.mutate({ groupId, userId });
    }
  };

  // Filter out users who are already members
  const availableUsers = users?.filter(
    (u) => !groupDetails?.members.some((m) => m.id === u.id)
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Manage ${groupDetails?.group.name || "Group"}`}>
      <div className="space-y-6 pt-4">
        
        {/* Add Member Section */}
        <div className="flex gap-2 items-end border-b pb-6">
          <div className="flex-1 space-y-2">
            <label className="text-sm font-medium leading-none">Add Member</label>
            <select
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
            >
                <option value="">Select user to add...</option>
                {availableUsers?.map((u) => (
                    <option key={u.id} value={u.id}>
                        {u.email} ({u.name || "No Name"})
                    </option>
                ))}
            </select>
          </div>
          <Button 
            onClick={handleAddMember} 
            disabled={!selectedUserId || addMember.isPending}
            isLoading={addMember.isPending}
            size="sm"
          >
            <UserPlus className="mr-2 h-4 w-4" />
            Add
          </Button>
        </div>

        {/* Members List */}
        <div className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground">Current Members</h3>
            
            {isLoading && <p>Loading...</p>}
            
            {!isLoading && groupDetails?.members.length === 0 && (
                <p className="text-sm text-muted-foreground italic">No members in this group.</p>
            )}

            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                {groupDetails?.members.map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-2 rounded-md border bg-muted/20">
                        <div className="text-sm">
                            <p className="font-medium">{member.name || "No Name"}</p>
                            <p className="text-xs text-muted-foreground">{member.email}</p>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8"
                            onClick={() => handleRemoveMember(member.id)}
                            isLoading={removeMember.isPending && removeMember.variables?.userId === member.id}
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                ))}
            </div>
        </div>

        <div className="flex justify-end pt-2">
            <Button variant="ghost" onClick={onClose}>Close</Button>
        </div>
      </div>
    </Modal>
  );
}
