interface TableProps {
  children?: React.ReactNode;
  className?: string;
}

export default function Table({ children, className = "" }: TableProps) {
  return (
    <div className="overflow-x-auto">
      <table className={`w-full ${className}`}>{children}</table>
    </div>
  );
}

export function TableHeader({ children }: { children: React.ReactNode }) {
  return (
    <thead className="bg-slate-800 border-b border-slate-700">
      {children}
    </thead>
  );
}

export function TableBody({ children }: { children: React.ReactNode }) {
  return <tbody className="divide-y divide-slate-700">{children}</tbody>;
}

export function TableRow({ children, className = "" }: TableProps) {
  return (
    <tr className={`hover:bg-slate-800/50 transition-colors ${className}`}>
      {children}
    </tr>
  );
}

export function TableHead({ children, className = "" }: TableProps) {
  return (
    <th
      className={`px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider ${className}`}
    >
      {children}
    </th>
  );
}

export function TableCell({ children, className = "" }: TableProps) {
  return (
    <td className={`px-4 py-3 text-sm text-slate-300 ${className}`}>
      {children}
    </td>
  );
}
