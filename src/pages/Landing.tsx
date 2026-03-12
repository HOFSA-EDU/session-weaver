import { useNavigate } from "react-router-dom";
import { Swords, Plus, LogIn, History, User } from "lucide-react";
import { motion } from "framer-motion";
import { useDMSessions, usePlayerSessions } from "@/hooks/use-session-data";

export default function Landing() {
  const navigate = useNavigate();
  const { data: pastSessions } = useDMSessions();
  const { data: playerSessions } = usePlayerSessions();

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
            onClick={() => navigate("/create")}
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

        {/* Player sessions - rejoin */}
        {playerSessions && playerSessions.length > 0 && (
          <div className="mt-10">
            <h2 className="font-display text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2 justify-center">
              <User className="w-4 h-4" /> My Characters
            </h2>
            <div className="space-y-2">
              {playerSessions.slice(0, 5).map(session => (
                <button
                  key={session.id}
                  onClick={() => navigate(`/player/${session.id}`)}
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-surface card-hover btn-press text-left"
                >
                  <div className="min-w-0">
                    <div className="text-sm font-medium truncate">{session.name}</div>
                    <div className="text-[10px] text-muted-foreground">
                      {new Date(session.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${session.is_active ? 'bg-primary/20 text-primary' : 'bg-surface-hover text-muted-foreground'}`}>
                    {session.is_active ? 'Rejoin' : 'Ended'}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Past DM sessions */}
        {pastSessions && pastSessions.length > 0 && (
          <div className="mt-10">
            <h2 className="font-display text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2 justify-center">
              <History className="w-4 h-4" /> DM Sessions
            </h2>
            <div className="space-y-2">
              {pastSessions.slice(0, 5).map(session => (
                <button
                  key={session.id}
                  onClick={() => navigate(`/dm/${session.id}`)}
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-surface card-hover btn-press text-left"
                >
                  <div className="min-w-0">
                    <div className="text-sm font-medium truncate">{session.name}</div>
                    <div className="text-[10px] text-muted-foreground">
                      Code: {session.join_code} · {new Date(session.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${session.is_active ? 'bg-primary/20 text-primary' : 'bg-surface-hover text-muted-foreground'}`}>
                    {session.is_active ? 'Active' : 'Ended'}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        <p className="text-[11px] text-muted-foreground mt-8">
          No account needed. Sessions persist automatically.
        </p>
      </motion.div>
    </div>
  );
}
