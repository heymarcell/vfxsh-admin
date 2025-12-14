import { useOrganization } from '../../context/OrganizationContext';
import { ChevronsUpDown, Check } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { cn } from '../../lib/utils';

export function OrgSwitcher() {
  const { organizations, currentOrg, setCurrentOrg, isLoading } = useOrganization();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [ref]);

  if (isLoading) return <div className="h-8 w-32 bg-muted/50 animate-pulse rounded-md" />;
  if (organizations.length === 0) return null;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-colors text-sm font-medium w-[200px] justify-between"
      >
        <span className="truncate">{currentOrg?.name || "Select Organization"}</span>
        <ChevronsUpDown className="h-4 w-4 opacity-50" />
      </button>

      {open && (
        <div className="absolute top-full right-0 mt-2 w-[240px] z-50 rounded-md border border-border bg-popover text-popover-foreground shadow-md animate-in fade-in zoom-in-95 duration-100">
          <div className="p-1">
            <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
              Organizations
            </div>
            {organizations.map((org) => (
              <div
                key={org.id}
                onClick={() => {
                  if (currentOrg?.id !== org.id) {
                    setCurrentOrg(org);
                    setOpen(false);
                    // Reload page to refresh all data with new org context
                    window.location.reload();
                  } else {
                    setOpen(false);
                  }
                }}
                className={cn(
                  "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 cursor-pointer",
                  currentOrg?.id === org.id && "bg-accent/50"
                )}
              >
                <div className="flex flex-col gap-0.5 flex-1">
                  <span className="font-medium">{org.name}</span>
                  <span className="text-xs text-muted-foreground capitalize">{org.role_name}</span>
                </div>
                {currentOrg?.id === org.id && (
                  <Check className="ml-auto h-4 w-4" />
                )}
              </div>
            ))}
            <div className="h-px bg-border my-1" />
            <div className="px-2 py-1.5 text-xs text-muted-foreground text-center">
              Create new organizations via Support
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
