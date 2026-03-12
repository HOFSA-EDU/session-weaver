import { useNavigate, useParams } from "react-router-dom";
import { TurnIndicator } from "@/components/TurnIndicator";
import { InitiativeTracker } from "@/components/InitiativeTracker";
import { ReceivedAssets } from "@/components/ReceivedAssets";
import { NotesPanel } from "@/components/NotesPanel";
import { StatusEffectsPanel } from "@/components/StatusEffectsPanel";
import { useSession, useSessionPlayers, useSessionAssets, useSessionNotes, useCreateNote, useSessionRealtime } from "@/hooks/use-session-data";
import { useTurnSound } from "@/hooks/use-turn-sound";
import { getPlayerSession } from "@/lib/session-utils";
import { ArrowLeft } from "lucide-react";

export default function PlayerView() {
  const navigate = useNavigate();
  const { sessionId } = useParams<{ sessionId: string }>();
  const playerInfo = getPlayerSession(sessionId || '');

  const { data: session } = useSession(sessionId || null);
  const { data: players = [] } = useSessionPlayers(sessionId || null);
  const { data: assets = [] } = useSessionAssets(sessionId || null);
  const { data: notes = [] } = useSessionNotes(sessionId || null, playerInfo?.playerId);
  const createNote = useCreateNote();
  useSessionRealtime(sessionId || null);

  const currentPlayer = players.find(p => p.id === playerInfo?.playerId);
  const activePlayer = players.find(p => p.is_active);
  const isMyTurn = currentPlayer?.is_active || false;

  const myAssets = assets.filter(
    a => a.shared_with.includes('all') || (currentPlayer && a.shared_with.includes(currentPlayer.id))
  );

  const handleAddNote = async (content: string, type: 'personal' | 'session') => {
    if (!sessionId || !currentPlayer) return;
    await createNote.mutateAsync({
      session_id: sessionId,
      author_id: currentPlayer.id,
      author_name: currentPlayer.player_name,
      content,
      note_type: type,
    });
  };

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col gap-4">
        <p className="text-muted-foreground">Loading session...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex items-center gap-3 p-4">
        <button onClick={() => navigate("/")} className="p-2 rounded-lg card-hover btn-press">
          <ArrowLeft className="w-5 h-5 text-muted-foreground" />
        </button>
        <div className="flex-1">
          <h1 className="font-display text-base font-bold">{session.name}</h1>
          <p className="text-xs text-muted-foreground">Playing as {currentPlayer?.player_name || 'Unknown'}</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <TurnIndicator
          isYourTurn={isMyTurn}
          currentPlayerName={activePlayer?.player_name || currentPlayer?.player_name || 'someone'}
        />

        {currentPlayer && currentPlayer.status_effects.length > 0 && (
          <div className="card-surface p-4">
            <h3 className="font-display text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Active Effects</h3>
            <StatusEffectsPanel activeEffects={currentPlayer.status_effects} compact />
          </div>
        )}

        <ReceivedAssets assets={myAssets.map(a => ({
          id: a.id,
          title: a.title,
          description: a.description || '',
          imageUrl: a.file_url || '',
          type: a.asset_type as any,
          sharedWith: a.shared_with,
          createdAt: a.created_at,
        }))} />

        <InitiativeTracker
          players={players.map(p => ({
            id: p.id,
            name: p.player_name,
            initiative: null,
            statusEffects: p.status_effects,
            isActive: p.is_active,
          }))}
          isCompact
        />

        <NotesPanel
          notes={notes.map(n => ({
            id: n.id,
            content: n.content,
            authorId: n.author_id,
            authorName: n.author_name,
            type: n.note_type as 'personal' | 'session',
            createdAt: n.created_at,
            updatedAt: n.updated_at,
          }))}
          currentUserId={currentPlayer?.id || ''}
          onAddNote={handleAddNote}
        />
      </div>
    </div>
  );
}
