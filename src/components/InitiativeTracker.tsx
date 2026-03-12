import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, Plus, Play, SkipForward } from "lucide-react";
import { Player, STATUS_EFFECTS } from "@/lib/mock-data";

interface InitiativeTrackerProps {
  players: Player[];
  onNextTurn?: () => void;
  onAddCombatant?: () => void;
  isCompact?: boolean;
}

export function InitiativeTracker({ players, onNextTurn, onAddCombatant, isCompact = false }: InitiativeTrackerProps) {
  const sorted = [...players]
    .filter(p => p.initiative !== null)
    .sort((a, b) => (b.initiative ?? 0) - (a.initiative ?? 0));

  if (sorted.length === 0) {
    return (
      <div className="card-surface p-6 text-center">
        <p className="text-muted-foreground text-sm">The battlefield is empty. Add combatants.</p>
        {onAddCombatant && (
          <button
            onClick={onAddCombatant}
            className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-surface-hover text-foreground text-sm card-hover btn-press"
          >
            <Plus className="w-4 h-4" /> Add Combatant
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="card-surface p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-display text-sm font-semibold text-muted-foreground uppercase tracking-wider">Initiative</h3>
        <div className="flex gap-2">
          {onAddCombatant && (
            <button onClick={onAddCombatant} className="p-1.5 rounded-lg bg-surface-hover card-hover btn-press">
              <Plus className="w-4 h-4 text-muted-foreground" />
            </button>
          )}
          {onNextTurn && (
            <button onClick={onNextTurn} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium btn-press">
              <SkipForward className="w-3 h-3" /> Next
            </button>
          )}
        </div>
      </div>

      <div className={isCompact ? "flex flex-col gap-1.5" : "flex gap-2 overflow-x-auto pb-2 scrollbar-hide"}>
        <AnimatePresence mode="popLayout">
          {sorted.map((player) => (
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
                ${isCompact ? "flex items-center gap-3 p-3" : "flex-shrink-0 w-28 p-3"}
                rounded-xl bg-surface transition-all duration-200
                ${player.isActive ? "card-active animate-pulse-gold" : ""}
              `}
            >
              <div className={`tabular-nums text-lg font-bold ${player.isActive ? "text-primary" : "text-muted-foreground"}`}>
                {player.initiative}
              </div>
              <div className={isCompact ? "flex-1" : "mt-1"}>
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
              {player.isActive && isCompact && (
                <ChevronRight className="w-4 h-4 text-primary" />
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
