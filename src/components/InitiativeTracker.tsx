import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ChevronUp, ChevronDown, SkipForward, EyeOff } from "lucide-react";
import { Player, STATUS_EFFECTS } from "@/lib/mock-data";

interface InitiativeTrackerProps {
  players: Player[];
  onNextTurn?: () => void;
  onClearFocus?: () => void;
  onMovePlayer?: (playerId: string, direction: 'up' | 'down') => void;
  isCompact?: boolean;
}

export function InitiativeTracker({ players, onNextTurn, onMovePlayer, isCompact = false }: InitiativeTrackerProps) {
  if (players.length === 0) {
    return (
      <div className="card-surface p-6 text-center">
        <p className="text-muted-foreground text-sm">The battlefield is empty. No players in the session.</p>
      </div>
    );
  }

  return (
    <div className="card-surface p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-display text-sm font-semibold text-muted-foreground uppercase tracking-wider">Turn Order</h3>
        {onNextTurn && (
          <button onClick={onNextTurn} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium btn-press">
            <SkipForward className="w-3 h-3" /> Next Turn
          </button>
        )}
      </div>

      <div className={isCompact ? "flex flex-col gap-1.5" : "flex flex-col gap-1.5"}>
        <AnimatePresence mode="popLayout">
          {players.map((player, index) => (
            <motion.div
              key={player.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{
                opacity: player.isActive ? 1 : 0.5,
                scale: player.isActive ? 1.02 : 1,
                filter: player.isActive ? 'none' : 'grayscale(50%)',
              }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className={`
                flex items-center gap-3 p-3
                rounded-xl bg-surface transition-all duration-200
                ${player.isActive ? "card-active animate-pulse-gold" : ""}
              `}
            >
              {/* Reorder buttons — DM only */}
              {onMovePlayer && (
                <div className="flex flex-col gap-0.5">
                  <button
                    onClick={() => onMovePlayer(player.id, 'up')}
                    disabled={index === 0}
                    className="p-0.5 rounded card-hover btn-press disabled:opacity-20"
                  >
                    <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" />
                  </button>
                  <button
                    onClick={() => onMovePlayer(player.id, 'down')}
                    disabled={index === players.length - 1}
                    className="p-0.5 rounded card-hover btn-press disabled:opacity-20"
                  >
                    <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                  </button>
                </div>
              )}

              <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-sm font-bold shrink-0 ${
                player.isActive ? "bg-primary text-primary-foreground" : "bg-surface-hover text-muted-foreground"
              }`}>
                {player.name[0]}
              </div>
              <div className="flex-1">
                <div className={`text-sm font-medium truncate ${player.isActive ? "text-foreground" : "text-muted-foreground"}`}>
                  {player.name}
                </div>
                {player.statusEffects.length > 0 && (
                  <div className="flex gap-1 mt-1 flex-wrap">
                    {player.statusEffects.map(effect => {
                      const info = STATUS_EFFECTS.find(e => e.id === effect);
                      return (
                        <span key={effect} className="h-5 px-1.5 rounded-full bg-foreground/10 text-foreground text-[10px] font-medium inline-flex items-center">
                          {info?.icon} {info?.name}
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>
              {player.isActive && (
                <ChevronRight className="w-4 h-4 text-primary shrink-0" />
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
