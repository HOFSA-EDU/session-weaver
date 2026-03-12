import { STATUS_EFFECTS } from "@/lib/mock-data";

interface StatusEffectsPanelProps {
  activeEffects: string[];
  onToggleEffect?: (effectId: string) => void;
  compact?: boolean;
}

export function StatusEffectsPanel({ activeEffects, onToggleEffect, compact = false }: StatusEffectsPanelProps) {
  if (compact) {
    // Player view: only show active effects
    const active = STATUS_EFFECTS.filter(e => activeEffects.includes(e.id));
    if (active.length === 0) return null;

    return (
      <div className="flex gap-1.5 flex-wrap">
        {active.map(effect => (
          <div
            key={effect.id}
            className="h-7 px-2.5 rounded-full bg-foreground/10 text-foreground text-xs font-medium inline-flex items-center gap-1"
            title={effect.description}
          >
            <span>{effect.icon}</span> {effect.name}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="card-surface p-4">
      <h3 className="font-display text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Status Effects</h3>
      <div className="grid grid-cols-3 gap-1.5">
        {STATUS_EFFECTS.map(effect => {
          const isActive = activeEffects.includes(effect.id);
          return (
            <button
              key={effect.id}
              onClick={() => onToggleEffect?.(effect.id)}
              title={effect.description}
              className={`h-7 px-2 rounded-full text-[11px] font-medium inline-flex items-center gap-1 transition-all btn-press ${
                isActive
                  ? 'bg-primary/20 text-primary'
                  : 'bg-surface text-muted-foreground hover:bg-surface-hover'
              }`}
            >
              <span>{effect.icon}</span>
              <span className="truncate">{effect.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
