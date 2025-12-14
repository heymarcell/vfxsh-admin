import { useProviders } from "../../api/providers";
import ProviderCard from "./ProviderCard";

export default function ProviderList() {
  const { data: providers, isLoading, error } = useProviders();

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="bg-slate-800 rounded-lg p-6 border border-slate-700 animate-pulse"
          >
            <div className="h-6 bg-slate-700 rounded w-3/4 mb-2" />
            <div className="h-4 bg-slate-700 rounded w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 text-red-400">
        <p>Failed to load providers</p>
        <p className="text-sm text-slate-500 mt-1">Please check your connection and try again</p>
      </div>
    );
  }

  if (!providers?.length) {
    return (
      <div className="text-center py-12 text-slate-400">
        <p>No providers configured yet</p>
        <p className="text-sm text-slate-500 mt-1">Add your first storage provider to get started</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {providers.map((provider) => (
        <ProviderCard key={provider.id} provider={provider} />
      ))}
    </div>
  );
}
