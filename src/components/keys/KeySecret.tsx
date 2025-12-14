import { useState } from "react";
import { Copy, Check, AlertTriangle } from "lucide-react";

interface KeySecretProps {
  accessKeyId: string;
  secretKey: string;
  onClose: () => void;
}

export default function KeySecret({
  accessKeyId,
  secretKey,
  onClose,
}: KeySecretProps) {
  const [copied, setCopied] = useState<"access" | "secret" | null>(null);

  const copyToClipboard = async (text: string, type: "access" | "secret") => {
    await navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-slate-800 rounded-lg p-6 max-w-lg w-full mx-4 border border-slate-700">
        <div className="flex items-center gap-3 text-yellow-400 mb-4">
          <AlertTriangle size={24} />
          <h2 className="text-lg font-semibold">Save Your Credentials</h2>
        </div>

        <p className="text-slate-400 mb-6">
          The secret key will only be shown once. Copy it now and store it
          securely.
        </p>

        <div className="space-y-4">
          <div>
            <label className="text-sm text-slate-400">Access Key ID</label>
            <div className="flex items-center gap-2 mt-1">
              <code className="flex-1 bg-slate-900 px-3 py-2 rounded font-mono text-sm border border-slate-700">
                {accessKeyId}
              </code>
              <button
                onClick={() => copyToClipboard(accessKeyId, "access")}
                className="p-2 hover:bg-slate-700 rounded transition-colors"
              >
                {copied === "access" ? (
                  <Check size={18} className="text-green-400" />
                ) : (
                  <Copy size={18} />
                )}
              </button>
            </div>
          </div>

          <div>
            <label className="text-sm text-slate-400">Secret Access Key</label>
            <div className="flex items-center gap-2 mt-1">
              <code className="flex-1 bg-slate-900 px-3 py-2 rounded font-mono text-sm break-all border border-slate-700">
                {secretKey}
              </code>
              <button
                onClick={() => copyToClipboard(secretKey, "secret")}
                className="p-2 hover:bg-slate-700 rounded transition-colors"
              >
                {copied === "secret" ? (
                  <Check size={18} className="text-green-400" />
                ) : (
                  <Copy size={18} />
                )}
              </button>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full mt-6 bg-purple-600 hover:bg-purple-700 py-2 rounded-lg transition-colors font-medium"
        >
          I've Saved My Credentials
        </button>
      </div>
    </div>
  );
}
