import { cn } from "../../lib/utils";

interface TableProps {
  children?: React.ReactNode;
  className?: string;
}

export default function Table({ children, className }: TableProps) {
  return (
    <div className="w-full overflow-auto">
      <table className={cn("w-full caption-bottom text-sm", className)}>{children}</table>
    </div>
  );
}

export function TableHeader({ children }: { children: React.ReactNode }) {
  return (
    <thead className="[&_tr]:border-b border-border">
      {children}
    </thead>
  );
}

export function TableBody({ children }: { children: React.ReactNode }) {
  return <tbody className="[&_tr:last-child]:border-0">{children}</tbody>;
}

export function TableRow({ children, className }: TableProps) {
  return (
    <tr className={cn("border-b border-border transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted", className)}>
      {children}
    </tr>
  );
}

export function TableHead({ children, className }: TableProps) {
  return (
    <th
      className={cn(
        "h-10 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0",
        className
      )}
    >
      {children}
    </th>
  );
}

export function TableCell({ children, className, ...props }: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td className={cn("p-4 align-middle [&:has([role=checkbox])]:pr-0 text-foreground", className)} {...props}>
      {children}
    </td>
  );
}
