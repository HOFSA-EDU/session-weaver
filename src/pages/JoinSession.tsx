import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, LogIn } from "lucide-react";
import { motion } from "framer-motion";
import { useSessionByCode, useJoinSession, useSessionPlayers } from "@/hooks/use-session-data";
import { useAuth } from "@/hooks/use-auth";

export default function JoinSession() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [joinCode, setJoinCode] = useState("");
  const [playerName, setPlayerName] = useState("");
  const [error, setError] = useState("");

  const { data: session, isLoading: lookingUp } = useSessionByCode(joinCode.length >= 4 ? joinCode : null);
  const { data: players = [] } = useSessionPlayers(session?.id || null);
  const joinSession = useJoinSession();

  // Check if already in this session
  const existingPlayer = players.find(p => p.user_id === user?.id);

  const isInactive = session && !session.is_active;

  const handleJoin = async () => {
    if (!session || isInactive) return;

    if (existingPlayer) {
      navigate(`/player/${session.id}`);
      return;
    }

    if (!playerName.trim()) return;
    setError("");
    try {
      await joinSession.mutateAsync({ sessionId: session.id, playerName: playerName.trim() });
      navigate(`/player/${session.id}`);
    } catch (e: any) {
      setError(e.message || "Failed to join session");
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
              placeholder="ABC123"
              className="w-full bg-surface rounded-xl px-4 py-3.5 text-lg font-mono font-bold text-center tracking-widest text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:ring-2 focus:ring-ring"
              maxLength={8}
            />
            {joinCode.length >= 4 && !lookingUp && !session && (
              <p className="text-xs text-crimson mt-1.5">Session not found.</p>
            )}
            {session && (
              <div className={`mt-2 p-3 rounded-lg ${isInactive ? 'bg-destructive/10' : 'bg-primary/10'}`}>
                <p className={`text-sm font-medium ${isInactive ? 'text-destructive' : 'text-primary'}`}>{session.name}</p>
                {session.description && <p className="text-xs text-muted-foreground mt-0.5">{session.description}</p>}
                {isInactive && (
                  <p className="text-xs text-destructive/80 mt-1.5 font-medium">✕ This session is inactive — you cannot join.</p>
                )}
                {!isInactive && existingPlayer && (
                  <p className="text-xs text-primary/80 mt-1.5 font-medium">✦ You're already in this session — tap below to rejoin</p>
                )}
              </div>
            )}
          </div>

          {!existingPlayer && (
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
          )}

          {error && <p className="text-xs text-crimson">{error}</p>}

          <button
            onClick={handleJoin}
            disabled={!session || (!existingPlayer && !playerName.trim()) || joinSession.isPending}
            className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-2xl bg-primary text-primary-foreground font-medium btn-press transition-all hover:brightness-110 disabled:opacity-30 disabled:pointer-events-none mt-4"
          >
            <LogIn className="w-5 h-5" />
            {existingPlayer ? 'Rejoin Session' : joinSession.isPending ? 'Joining...' : 'Enter the Fray'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
