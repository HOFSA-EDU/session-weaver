import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { SessionHeader } from "@/components/SessionHeader";
import { InitiativeTracker } from "@/components/InitiativeTracker";
import { PlayerList } from "@/components/PlayerList";
import { AssetLibrary } from "@/components/AssetLibrary";
import { NotesPanel } from "@/components/NotesPanel";
import { StatusEffectsPanel } from "@/components/StatusEffectsPanel";
import { MOCK_SESSION, MOCK_PLAYERS, MOCK_ASSETS, MOCK_NOTES, Player } from "@/lib/mock-data";
import { useIsMobile } from "@/hooks/use-mobile";
import { Users, Swords, BookOpen, Image, Shield, Menu, X } from "lucide-react";

type MobileTab = 'initiative' | 'players' | 'assets' | 'notes' | 'effects';

export default function DMDashboard() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [players, setPlayers] = useState<Player[]>(MOCK_PLAYERS);
  const [activeTab, setActiveTab] = useState<MobileTab>('initiative');
  const [selectedPlayerEffects, setSelectedPlayerEffects] = useState<string | null>(null);

  const handleNextTurn = () => {
    setPlayers(prev => {
      const activeIndex = prev.findIndex(p => p.isActive);
      return prev.map((p, i) => ({
        ...p,
        isActive: i === (activeIndex + 1) % prev.length,
      }));
    });
  };

  const selectedPlayer = selectedPlayerEffects ? players.find(p => p.id === selectedPlayerEffects) : null;

  const tabs: { id: MobileTab; icon: React.ElementType; label: string }[] = [
    { id: 'initiative', icon: Swords, label: 'Initiative' },
    { id: 'players', icon: Users, label: 'Party' },
    { id: 'assets', icon: Image, label: 'Assets' },
    { id: 'notes', icon: BookOpen, label: 'Notes' },
    { id: 'effects', icon: Shield, label: 'Effects' },
  ];

  if (isMobile) {
    return (
      <div className="h-screen flex flex-col">
        <SessionHeader session={MOCK_SESSION} onBack={() => navigate("/")} />

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {activeTab === 'initiative' && (
            <InitiativeTracker players={players} onNextTurn={handleNextTurn} isCompact />
          )}
          {activeTab === 'players' && (
            <PlayerList
              players={players}
              onAssignEffect={(id) => setSelectedPlayerEffects(id)}
              onRemovePlayer={(id) => setPlayers(prev => prev.filter(p => p.id !== id))}
            />
          )}
          {activeTab === 'assets' && <AssetLibrary assets={MOCK_ASSETS} onUpload={() => {}} onSendAsset={() => {}} />}
          {activeTab === 'notes' && <NotesPanel notes={MOCK_NOTES} currentUserId="dm" onAddNote={() => {}} />}
          {activeTab === 'effects' && selectedPlayer && (
            <StatusEffectsPanel
              activeEffects={selectedPlayer.statusEffects}
              onToggleEffect={(effectId) => {
                setPlayers(prev => prev.map(p =>
                  p.id === selectedPlayerEffects
                    ? {
                        ...p,
                        statusEffects: p.statusEffects.includes(effectId)
                          ? p.statusEffects.filter(e => e !== effectId)
                          : [...p.statusEffects, effectId],
                      }
                    : p
                ));
              }}
            />
          )}
          {activeTab === 'effects' && !selectedPlayer && (
            <div className="card-surface p-6 text-center">
              <p className="text-muted-foreground text-sm">Select a player from the Party tab to manage effects.</p>
            </div>
          )}
        </div>

        {/* Mobile tab bar */}
        <div className="flex border-t border-border bg-background">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex flex-col items-center gap-0.5 py-3 text-[10px] font-medium transition-colors btn-press ${
                activeTab === tab.id ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Desktop: 3-column layout
  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <SessionHeader session={MOCK_SESSION} onBack={() => navigate("/")} />

      <div className="flex-1 grid grid-cols-[280px_1fr_320px] gap-0 overflow-hidden">
        {/* Left: Players */}
        <div className="overflow-y-auto p-4 space-y-4">
          <PlayerList
            players={players}
            onAssignEffect={(id) => setSelectedPlayerEffects(id)}
            onRemovePlayer={(id) => setPlayers(prev => prev.filter(p => p.id !== id))}
          />
          {selectedPlayer && (
            <StatusEffectsPanel
              activeEffects={selectedPlayer.statusEffects}
              onToggleEffect={(effectId) => {
                setPlayers(prev => prev.map(p =>
                  p.id === selectedPlayerEffects
                    ? {
                        ...p,
                        statusEffects: p.statusEffects.includes(effectId)
                          ? p.statusEffects.filter(e => e !== effectId)
                          : [...p.statusEffects, effectId],
                      }
                    : p
                ));
              }}
            />
          )}
        </div>

        {/* Center: Initiative + Assets */}
        <div className="overflow-y-auto p-4 space-y-4 border-x border-border/30">
          <InitiativeTracker players={players} onNextTurn={handleNextTurn} onAddCombatant={() => {}} />
          <AssetLibrary assets={MOCK_ASSETS} onUpload={() => {}} onSendAsset={() => {}} />
        </div>

        {/* Right: Notes & Activity */}
        <div className="overflow-y-auto p-4 space-y-4">
          <NotesPanel notes={MOCK_NOTES} currentUserId="dm" onAddNote={() => {}} />
        </div>
      </div>
    </div>
  );
}
