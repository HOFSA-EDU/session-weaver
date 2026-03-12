import { useNavigate, useSearchParams } from "react-router-dom";
import { TurnIndicator } from "@/components/TurnIndicator";
import { InitiativeTracker } from "@/components/InitiativeTracker";
import { ReceivedAssets } from "@/components/ReceivedAssets";
import { NotesPanel } from "@/components/NotesPanel";
import { StatusEffectsPanel } from "@/components/StatusEffectsPanel";
import { MOCK_PLAYERS, MOCK_ASSETS, MOCK_NOTES, MOCK_SESSION } from "@/lib/mock-data";
import { ArrowLeft } from "lucide-react";

export default function PlayerView() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const playerName = searchParams.get("name") || "Adventurer";

  // Simulate: player is Lyra (the active one)
  const currentPlayer = MOCK_PLAYERS.find(p => p.isActive) || MOCK_PLAYERS[0];
  const isMyTurn = currentPlayer.isActive;

  const myAssets = MOCK_ASSETS.filter(
    a => a.sharedWith.includes('all') || a.sharedWith.includes(currentPlayer.id)
  );

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 p-4">
        <button onClick={() => navigate("/")} className="p-2 rounded-lg card-hover btn-press">
          <ArrowLeft className="w-5 h-5 text-muted-foreground" />
        </button>
        <div className="flex-1">
          <h1 className="font-display text-base font-bold">{MOCK_SESSION.name}</h1>
          <p className="text-xs text-muted-foreground">Playing as {playerName}</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Turn Indicator - dominant */}
        <TurnIndicator isYourTurn={isMyTurn} currentPlayerName={currentPlayer.name} />

        {/* Status Effects */}
        {currentPlayer.statusEffects.length > 0 && (
          <div className="card-surface p-4">
            <h3 className="font-display text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Active Effects</h3>
            <StatusEffectsPanel activeEffects={currentPlayer.statusEffects} compact />
          </div>
        )}

        {/* Received Assets */}
        <ReceivedAssets assets={myAssets} />

        {/* Initiative */}
        <InitiativeTracker players={MOCK_PLAYERS} isCompact />

        {/* Notes */}
        <NotesPanel notes={MOCK_NOTES} currentUserId={currentPlayer.id} onAddNote={() => {}} />
      </div>
    </div>
  );
}
