import { motion, AnimatePresence } from "framer-motion";
import { Volume2, VolumeOff } from "lucide-react";

interface TurnIndicatorProps {
  isYourTurn: boolean;
  currentPlayerName: string;
  soundEnabled?: boolean;
  onToggleSound?: () => void;
}

export function TurnIndicator({ isYourTurn, currentPlayerName, soundEnabled, onToggleSound }: TurnIndicatorProps) {
  const showSoundToggle = onToggleSound !== undefined;
  return (
    <div className="relative">
      {showSoundToggle && (
        <button
          onClick={onToggleSound}
          className="absolute top-3 right-3 p-1.5 rounded-lg card-hover btn-press z-10"
          title={soundEnabled ? "Mute turn sound" : "Enable turn sound"}
        >
          {soundEnabled ? (
            <Volume2 className="w-4 h-4 text-muted-foreground" />
          ) : (
            <VolumeOff className="w-4 h-4 text-muted-foreground" />
          )}
        </button>
      )}
      <AnimatePresence mode="wait">
        {isYourTurn ? (
          <motion.div
            key="your-turn"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="card-surface card-active animate-pulse-gold p-8 text-center"
          >
            <div className="text-display text-primary font-bold">YOUR TURN</div>
            <p className="text-muted-foreground text-sm mt-2">Make your move, {currentPlayerName}</p>
          </motion.div>
        ) : (
          <motion.div
            key="waiting"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="card-surface p-6 text-center"
          >
            <p className="text-muted-foreground text-sm">
              Waiting... <span className="text-foreground font-medium">{currentPlayerName}</span>'s turn
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
