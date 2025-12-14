import { MoreVertical, Shield, Users } from "lucide-react";
import { useGroups } from "../../api/groups";
import Table, { TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/Table";
import Button from "../ui/Button";

export default function GroupList() {
  const { data: groups, isLoading } = useGroups();

  if (isLoading) {
    return <div>Loading groups...</div>;
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Group ID</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Members</TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {groups?.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center h-24 text-muted-foreground">
                No groups found. Create one to get started.
              </TableCell>
            </TableRow>
          ) : (
            groups?.map((group) => (
              <TableRow key={group.id}>
                <TableCell className="font-mono">{group.id}</TableCell>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-muted-foreground" />
                    {group.name}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                     <Users className="h-4 w-4 text-muted-foreground" />
                     {group.members_count ?? 0}
                  </div>
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
