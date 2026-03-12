import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus } from "lucide-react";
import { motion } from "framer-motion";
import { useCreateSession } from "@/hooks/use-session-data";

export default function CreateSession() {
  const navigate = useNavigate();
  const createSession = useCreateSession();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const handleCreate = async () => {
    if (!name.trim()) return;
    try {
      const session = await createSession.mutateAsync({ name: name.trim(), description: description.trim() });
      navigate(`/dm/${session.id}`);
    } catch (e) {
      console.error("Failed to create session:", e);
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

        <h1 className="font-display text-2xl font-bold mb-1">Create Session</h1>
        <p className="text-muted-foreground text-sm mb-8">Set up a new game session for your party.</p>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Session Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Curse of the Blood Moon"
              className="w-full bg-surface rounded-xl px-4 py-3.5 text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Description (optional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="The party ventures into the Crimson Vale..."
              rows={3}
              className="w-full bg-surface rounded-xl px-4 py-3.5 text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            />
          </div>

          <button
            onClick={handleCreate}
            disabled={!name.trim() || createSession.isPending}
            className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-2xl bg-primary text-primary-foreground font-medium btn-press transition-all hover:brightness-110 disabled:opacity-30 disabled:pointer-events-none mt-4"
          >
            <Plus className="w-5 h-5" />
            {createSession.isPending ? 'Creating...' : 'Create Session'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
