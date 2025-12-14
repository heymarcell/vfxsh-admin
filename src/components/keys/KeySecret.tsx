import { Copy, Check, AlertTriangle } from "lucide-react";
import { useState } from "react";
import Button from "../ui/Button";

interface KeySecretProps {
  accessKeyId: string;
  secretAccessKey: string;
  onClose: () => void;
}

export default function KeySecret({ accessKeyId, secretAccessKey, onClose }: KeySecretProps) {
  const [copied, setCopied] = useState<"id" | "secret" | null>(null);

  const copyToClipboard = async (text: string, type: "id" | "secret") => {
    await navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Heavy Backdrop */}
      <div className="absolute inset-0 bg-background/95 backdrop-blur-md" />

      {/* Content */}
      <div className="relative w-full max-w-lg rounded-xl border border-border bg-card p-6 shadow-2xl">
         <div className="flex flex-col items-center text-center space-y-2 mb-6">
            <div className="p-3 bg-yellow-500/10 rounded-full text-yellow-500 mb-2">
                <AlertTriangle size={32} />
            </div>
            <h2 className="text-2xl font-bold">Save Secret Key</h2>
            <p className="text-muted-foreground">
              This secret key will <strong>only be shown once</strong>. You will not be able to retrieve it again.
            </p>
         </div>

         <div className="space-y-4">
            <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Access Key ID</label>
                <div className="flex gap-2">
                    <code className="flex-1 rounded-md border border-input bg-muted/50 px-3 py-2 text-sm font-mono text-foreground">
                        {accessKeyId}
                    </code>
                    <Button variant="outline" size="icon" onClick={() => copyToClipboard(accessKeyId, "id")}>
                         {copied === "id" ? <Check size={16} className="text-green-500"/> : <Copy size={16}/>}
                    </Button>
                </div>
            </div>

            <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Secret Access Key</label>
                <div className="flex gap-2">
                    <code className="flex-1 rounded-md border border-input bg-muted/50 px-3 py-2 text-sm font-mono text-foreground break-all">
                        {secretAccessKey}
                    </code>
                    <Button variant="outline" size="icon" onClick={() => copyToClipboard(secretAccessKey, "secret")}>
                         {copied === "secret" ? <Check size={16} className="text-green-500"/> : <Copy size={16}/>}
                    </Button>
                </div>
            </div>
         </div>

         <div className="mt-8">
            <Button className="w-full" size="lg" onClick={onClose}>
                I have saved these credentials
            </Button>
         </div>
      </div>
    </div>
  );
}
