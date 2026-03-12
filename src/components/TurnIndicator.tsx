import { motion, AnimatePresence } from "framer-motion";
import { Volume2, VolumeOff } from "lucide-react";

interface TurnIndicatorProps {
  isYourTurn: boolean;
  currentPlayerName: string;
  soundEnabled?: boolean;
  onToggleSound?: () => void;
}

export function TurnIndicator({ isYourTurn, currentPlayerName }: TurnIndicatorProps) {
  return (
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
  );
}
