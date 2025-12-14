import { Trash2, ExternalLink, ShieldCheck, ShieldAlert } from "lucide-react";
import { useDeleteProvider } from "../../api/providers";
import type { Provider } from "../../types/api";
import Card, { CardContent, CardHeader, CardFooter } from "../ui/Card";
import Button from "../ui/Button";

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
    <Card className="overflow-hidden bg-card hover:bg-muted/30 transition-colors">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <h3 className="font-semibold text-lg truncate flex-1">{provider.name}</h3>
        {provider.enabled ? (
          <ShieldCheck className="text-green-500 h-5 w-5" />
        ) : (
          <ShieldAlert className="text-yellow-500 h-5 w-5" />
        )}
      </CardHeader>
      
      <CardContent className="space-y-3 pb-3">
        <div className="flex items-center justify-between text-sm">
           <span className="text-muted-foreground">ID</span>
           <code className="font-mono bg-muted px-1.5 py-0.5 rounded text-xs">{provider.id}</code>
        </div>
        <div className="flex items-center justify-between text-sm">
           <span className="text-muted-foreground">Region</span>
           <span className="font-medium">{provider.region}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
           <span className="text-muted-foreground">Endpoint</span>
           <a 
             href={provider.endpoint_url} 
             target="_blank" 
             rel="noreferrer"
             className="flex items-center gap-1 text-primary hover:underline truncate max-w-[150px]"
           >
             <span className="truncate">{new URL(provider.endpoint_url).hostname}</span>
             <ExternalLink className="h-3 w-3" />
           </a>
        </div>
      </CardContent>

      <CardFooter className="bg-muted/20 border-t border-border/50 flex justify-between py-3">
         <span className="text-xs text-muted-foreground">
           Added {new Date(provider.created_at).toLocaleDateString()}
         </span>
         <Button
           variant="ghost"
           size="sm"
           onClick={handleDelete}
           disabled={deleteProvider.isPending}
           className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 px-2"
         >
           <Trash2 className="h-4 w-4 mr-2" />
           Delete
         </Button>
      </CardFooter>
    </Card>
  );
}
