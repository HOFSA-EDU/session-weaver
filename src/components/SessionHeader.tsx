import { Session } from "@/lib/mock-data";
import { QrCode, Copy, Settings, ArrowLeft } from "lucide-react";
import { useState } from "react";

interface SessionHeaderProps {
  session: Session;
  onBack?: () => void;
  showJoinCode?: boolean;
}

export function SessionHeader({ session, onBack, showJoinCode = true }: SessionHeaderProps) {
  const [copied, setCopied] = useState(false);

  const copyCode = () => {
    navigator.clipboard.writeText(session.joinCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center gap-4 p-4">
      {onBack && (
        <button onClick={onBack} className="p-2 rounded-lg card-hover btn-press">
          <ArrowLeft className="w-5 h-5 text-muted-foreground" />
        </button>
      )}
      <div className="flex-1 min-w-0">
        <h1 className="font-display text-lg font-bold truncate">{session.name}</h1>
        {session.description && (
          <p className="text-xs text-muted-foreground truncate">{session.description}</p>
        )}
      </div>
      {showJoinCode && (
        <button
          onClick={copyCode}
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-surface card-hover btn-press"
        >
          <QrCode className="w-4 h-4 text-primary" />
          <span className="text-sm font-mono font-bold tabular-nums text-primary">{session.joinCode}</span>
          {copied ? (
            <span className="text-[10px] text-primary">Copied!</span>
          ) : (
            <Copy className="w-3 h-3 text-muted-foreground" />
          )}
        </button>
      )}
    </div>
  );
}
