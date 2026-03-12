import { useState } from "react";
import { X, Send, Users, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Player {
  id: string;
  name: string;
}

interface ShareAssetDialogProps {
  assetTitle: string;
  players: Player[];
  onShare: (targetIds: string[]) => void;
  onClose: () => void;
}

export function ShareAssetDialog({ assetTitle, players, onShare, onClose }: ShareAssetDialogProps) {
  const [selected, setSelected] = useState<string[]>([]);

  const togglePlayer = (id: string) => {
    setSelected(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]);
  };

  const selectAll = () => setSelected(['all']);
  const isAll = selected.includes('all');

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />

      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="relative card-surface p-5 w-full max-w-sm"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-base font-bold">Send Asset</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg card-hover btn-press">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        <p className="text-xs text-muted-foreground mb-4">
          Share <span className="text-foreground font-medium">"{assetTitle}"</span> with:
        </p>

        {/* Send to all */}
        <button
          onClick={selectAll}
          className={`w-full flex items-center gap-3 p-3 rounded-xl mb-2 transition-all btn-press ${
            isAll ? 'bg-primary/20 card-active' : 'bg-surface card-hover'
          }`}
        >
          <Users className={`w-5 h-5 ${isAll ? 'text-primary' : 'text-muted-foreground'}`} />
          <span className={`text-sm font-medium ${isAll ? 'text-primary' : ''}`}>Entire Party</span>
        </button>

        {/* Individual players */}
        <div className="space-y-1.5 mb-4">
          {players.map(player => {
            const isSelected = !isAll && selected.includes(player.id);
            return (
              <button
                key={player.id}
                onClick={() => {
                  if (isAll) setSelected([player.id]);
                  else togglePlayer(player.id);
                }}
                className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all btn-press ${
                  isSelected ? 'bg-primary/20 card-active' : 'bg-surface card-hover'
                }`}
              >
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                  isSelected ? 'bg-primary text-primary-foreground' : 'bg-surface-hover text-muted-foreground'
                }`}>
                  {player.name[0]}
                </div>
                <span className={`text-sm font-medium ${isSelected ? 'text-primary' : ''}`}>{player.name}</span>
              </button>
            );
          })}
        </div>

        {players.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-4">No players in the session yet.</p>
        )}

        <button
          onClick={() => onShare(isAll ? ['all'] : selected)}
          disabled={selected.length === 0}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-medium btn-press hover:brightness-110 disabled:opacity-30 disabled:pointer-events-none"
        >
          <Send className="w-4 h-4" />
          {isAll ? 'Send to Party' : `Send to ${selected.length} player${selected.length !== 1 ? 's' : ''}`}
        </button>
      </motion.div>
    </motion.div>
  );
}
