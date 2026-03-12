import { Player, STATUS_EFFECTS } from "@/lib/mock-data";
import { UserMinus, Shield, Swords } from "lucide-react";

interface PlayerListProps {
  players: Player[];
  onRemovePlayer?: (id: string) => void;
  onAssignEffect?: (playerId: string) => void;
}

export function PlayerList({ players, onRemovePlayer, onAssignEffect }: PlayerListProps) {
  return (
    <div className="card-surface p-4">
      <h3 className="font-display text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
        Party ({players.length})
      </h3>
      <div className="space-y-1.5">
        {players.map(player => (
          <div
            key={player.id}
            className={`flex items-center gap-3 p-3 rounded-xl card-hover transition-all duration-200 ${
              player.isActive ? "bg-primary/10 card-active" : "bg-surface"
            }`}
          >
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${
              player.isActive ? "bg-primary text-primary-foreground" : "bg-surface-hover text-muted-foreground"
            }`}>
              {player.name[0]}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">{player.name}</div>
              {player.statusEffects.length > 0 && (
                <div className="flex gap-1 mt-0.5 flex-wrap">
                  {player.statusEffects.map(effect => {
                    const info = STATUS_EFFECTS.find(e => e.id === effect);
                    return (
                      <span key={effect} className="h-5 px-1.5 rounded-full bg-foreground/10 text-[10px] font-medium inline-flex items-center gap-0.5">
                        {info?.icon} {info?.name}
                      </span>
                    );
                  })}
                </div>
              )}
            </div>
            <div className="flex gap-1">
              {onAssignEffect && (
                <button onClick={() => onAssignEffect(player.id)} className="p-1.5 rounded-lg card-hover btn-press">
                  <Shield className="w-3.5 h-3.5 text-muted-foreground" />
                </button>
              )}
              {onRemovePlayer && (
                <button onClick={() => onRemovePlayer(player.id)} className="p-1.5 rounded-lg card-hover btn-press">
                  <UserMinus className="w-3.5 h-3.5 text-crimson" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
