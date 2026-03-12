import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, LogIn } from "lucide-react";
import { motion } from "framer-motion";

export default function JoinSession() {
  const navigate = useNavigate();
  const [joinCode, setJoinCode] = useState("");
  const [playerName, setPlayerName] = useState("");

  const handleJoin = () => {
    if (joinCode.trim() && playerName.trim()) {
      navigate(`/player?code=${joinCode.trim()}&name=${encodeURIComponent(playerName.trim())}`);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-sm w-full"
      >
        <button onClick={() => navigate("/")} className="flex items-center gap-2 text-muted-foreground text-sm mb-8 card-hover p-2 rounded-lg btn-press">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <h1 className="font-display text-2xl font-bold mb-1">Join Session</h1>
        <p className="text-muted-foreground text-sm mb-8">Enter the code from your DM's screen.</p>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Join Code</label>
            <input
              type="text"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              placeholder="BLOOD42"
              className="w-full bg-surface rounded-xl px-4 py-3.5 text-lg font-mono font-bold text-center tracking-widest text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:ring-2 focus:ring-ring"
              maxLength={8}
            />
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Character Name</label>
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Aethon the Bold"
              className="w-full bg-surface rounded-xl px-4 py-3.5 text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <button
            onClick={handleJoin}
            disabled={!joinCode.trim() || !playerName.trim()}
            className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-2xl bg-primary text-primary-foreground font-medium btn-press transition-all hover:brightness-110 disabled:opacity-30 disabled:pointer-events-none mt-4"
          >
            <LogIn className="w-5 h-5" />
            Enter the Fray
          </button>
        </div>
      </motion.div>
    </div>
  );
}
