import { Trash2, ExternalLink } from "lucide-react";
import { useDeleteProvider } from "../../api/providers";
import type { Provider } from "../../types/api";

interface ProviderCardProps {
  provider: Provider;
}

export default function ProviderCard({ provider }: ProviderCardProps) {
  const deleteProvider = useDeleteProvider();

  const handleDelete = () => {
    if (confirm("Delete this provider? This cannot be undone.")) {
      deleteProvider.mutate(provider.id);
    }
  };

  return (
    <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-semibold text-lg">{provider.name}</h3>
          <p className="text-slate-400 text-sm font-mono">{provider.id}</p>
        </div>
        <span
          className={`px-2 py-1 rounded text-xs font-medium ${
            provider.enabled
              ? "bg-green-900/50 text-green-400 border border-green-800"
              : "bg-red-900/50 text-red-400 border border-red-800"
          }`}
        >
          {provider.enabled ? "Active" : "Disabled"}
        </span>
      </div>

      <div className="space-y-2 text-sm text-slate-400">
        <p className="flex items-center gap-2">
          <ExternalLink size={14} className="flex-shrink-0" />
          <span className="truncate">{provider.endpoint_url}</span>
        </p>
        <p>Region: {provider.region}</p>
      </div>

      <div className="mt-4 pt-4 border-t border-slate-700">
        <button
          onClick={handleDelete}
          disabled={deleteProvider.isPending}
          className="text-red-400 hover:text-red-300 flex items-center gap-2 text-sm disabled:opacity-50"
        >
          <Trash2 size={14} />
          {deleteProvider.isPending ? "Deleting..." : "Delete"}
        </button>
      </div>
    </div>
  );
}
