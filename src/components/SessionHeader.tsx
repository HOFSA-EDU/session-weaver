import { Session } from "@/lib/mock-data";
import { QrCode, Copy, ArrowLeft, Trash2, Power } from "lucide-react";
import { useState } from "react";

interface SessionHeaderProps {
  session: Session;
  onBack?: () => void;
  showJoinCode?: boolean;
  onToggleActive?: () => void;
  onDeleteSession?: () => void;
}

export function SessionHeader({ session, onBack, showJoinCode = true, onToggleActive, onDeleteSession }: SessionHeaderProps) {
  const [copied, setCopied] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

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
        <div className="flex items-center gap-2">
          <h1 className="font-display text-lg font-bold truncate">{session.name}</h1>
          {!session.isActive && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-destructive/20 text-destructive font-medium shrink-0">
              Inactive
            </span>
          )}
        </div>
        {session.description && (
          <p className="text-xs text-muted-foreground truncate">{session.description}</p>
        )}
      </div>

      <div className="flex items-center gap-2">
        {onToggleActive && (
          <button
            onClick={onToggleActive}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg btn-press text-xs font-medium transition-colors ${
              session.isActive
                ? 'bg-surface card-hover text-muted-foreground hover:text-foreground'
                : 'bg-primary/20 text-primary hover:bg-primary/30'
            }`}
            title={session.isActive ? 'Mark inactive' : 'Reactivate session'}
          >
            <Power className="w-3.5 h-3.5" />
            {session.isActive ? 'Deactivate' : 'Reactivate'}
          </button>
        )}

        {onDeleteSession && (
          confirmDelete ? (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => { onDeleteSession(); setConfirmDelete(false); }}
                className="px-3 py-2 rounded-lg bg-destructive text-destructive-foreground text-xs font-medium btn-press"
              >
                Confirm
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                className="px-3 py-2 rounded-lg bg-surface text-muted-foreground text-xs font-medium btn-press card-hover"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmDelete(true)}
              className="p-2 rounded-lg card-hover btn-press text-muted-foreground hover:text-destructive transition-colors"
              title="Delete session"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )
        )}

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
    </div>
  );
}
