import { useNavigate } from "react-router-dom";
import { Swords, Plus, LogIn } from "lucide-react";
import { motion } from "framer-motion";

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-md w-full"
      >
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6 gold-glow">
          <Swords className="w-8 h-8 text-primary" />
        </div>

        <h1 className="text-display font-bold mb-2">Arcane Table</h1>
        <p className="text-muted-foreground text-sm mb-10">
          Command the table. Distribute the lore.
        </p>

        <div className="space-y-3">
          <button
            onClick={() => navigate("/dm")}
            className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-2xl bg-primary text-primary-foreground font-medium btn-press transition-all hover:brightness-110"
          >
            <Plus className="w-5 h-5" />
            Create Session
          </button>

          <button
            onClick={() => navigate("/join")}
            className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-2xl bg-surface text-foreground font-medium btn-press card-hover"
          >
            <LogIn className="w-5 h-5" />
            Join Session
          </button>
        </div>

        <p className="text-[11px] text-muted-foreground mt-8">
          No account needed. Sessions persist automatically.
        </p>
      </motion.div>
    </div>
  );
}
