import clsx from "clsx";

type RoleType = 'owner' | 'member' | 'viewer';

const roleStyles: Record<RoleType, string> = {
  owner: "bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-300 border-purple-500/30",
  member: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  viewer: "bg-zinc-500/20 text-zinc-400 border-zinc-500/30",
};

const roleLabels: Record<RoleType, string> = {
  owner: "Owner",
  member: "Member",
  viewer: "Viewer",
};

interface RoleBadgeProps {
  role: RoleType;
  size?: "sm" | "md";
  className?: string;
}

export default function RoleBadge({ role, size = "sm", className }: RoleBadgeProps) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full border font-medium",
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm",
        roleStyles[role] || roleStyles.viewer,
        className
      )}
    >
      {roleLabels[role] || role}
    </span>
  );
}
