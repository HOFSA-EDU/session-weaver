import { useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ShareAssetDialog } from "@/components/ShareAssetDialog";
import { SessionHeader } from "@/components/SessionHeader";
import { InitiativeTracker } from "@/components/InitiativeTracker";
import { PlayerList } from "@/components/PlayerList";
import { AssetLibrary } from "@/components/AssetLibrary";
import { NotesPanel } from "@/components/NotesPanel";
import { StatusEffectsPanel } from "@/components/StatusEffectsPanel";
import {
  useSession, useSessionPlayers, useSessionAssets, useSessionNotes,
  useUpdatePlayer, useRemovePlayer, useCreateAsset, useCreateNote,
  useSessionRealtime, uploadAssetFile,
} from "@/hooks/use-session-data";
import { useIsMobile } from "@/hooks/use-mobile";
import { getDeviceId } from "@/lib/session-utils";
import { Users, Swords, BookOpen, Image, Shield } from "lucide-react";
import { toast } from "sonner";

type MobileTab = 'initiative' | 'players' | 'assets' | 'notes' | 'effects';

export default function DMDashboard() {
  const navigate = useNavigate();
  const { sessionId } = useParams<{ sessionId: string }>();
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState<MobileTab>('initiative');
  const [selectedPlayerEffects, setSelectedPlayerEffects] = useState<string | null>(null);
  const [shareAssetId, setShareAssetId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: session, isLoading: sessionLoading } = useSession(sessionId || null);
  const { data: players = [] } = useSessionPlayers(sessionId || null);
  const { data: assets = [] } = useSessionAssets(sessionId || null);
  const { data: notes = [] } = useSessionNotes(sessionId || null, 'dm');
  useSessionRealtime(sessionId || null);

  const updatePlayer = useUpdatePlayer();
  const removePlayer = useRemovePlayer();
  const createAsset = useCreateAsset();
  const createNote = useCreateNote();

  if (sessionLoading) {
    return <div className="min-h-screen flex items-center justify-center"><p className="text-muted-foreground">Loading session...</p></div>;
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col gap-4">
        <p className="text-muted-foreground">Session not found.</p>
        <button onClick={() => navigate("/")} className="px-4 py-2 rounded-lg bg-surface card-hover btn-press text-sm">Back to Home</button>
      </div>
    );
  }

  const handleNextTurn = async () => {
    const sorted = [...players].filter(p => p.initiative !== null).sort((a, b) => (b.initiative ?? 0) - (a.initiative ?? 0));
    if (sorted.length === 0) return;
    const activeIndex = sorted.findIndex(p => p.is_active);
    const nextIndex = (activeIndex + 1) % sorted.length;
    
    // Deactivate all, activate next
    for (const p of sorted) {
      if (p.is_active || p.id === sorted[nextIndex].id) {
        await updatePlayer.mutateAsync({
          id: p.id,
          sessionId: session.id,
          is_active: p.id === sorted[nextIndex].id,
        });
      }
    }
  };

  const handleRemovePlayer = async (id: string) => {
    await removePlayer.mutateAsync({ id, sessionId: session.id });
  };

  const handleToggleEffect = async (effectId: string) => {
    if (!selectedPlayerEffects) return;
    const player = players.find(p => p.id === selectedPlayerEffects);
    if (!player) return;
    const newEffects = player.status_effects.includes(effectId)
      ? player.status_effects.filter(e => e !== effectId)
      : [...player.status_effects, effectId];
    await updatePlayer.mutateAsync({ id: player.id, sessionId: session.id, status_effects: newEffects });
  };

  const handleUpload = () => fileInputRef.current?.click();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !sessionId) return;
    try {
      const url = await uploadAssetFile(sessionId, file);
      await createAsset.mutateAsync({
        session_id: sessionId,
        title: file.name.replace(/\.[^/.]+$/, ''),
        file_url: url,
        asset_type: file.type.startsWith('image/') ? 'map' : 'handout',
        shared_with: [],
      });
      toast.success("Asset uploaded");
    } catch (err) {
      toast.error("Upload failed");
    }
    e.target.value = '';
  };

  const handleSendAsset = async (assetId: string) => {
    // Send to all party
    await createAsset.mutateAsync ? undefined : undefined;
    const asset = assets.find(a => a.id === assetId);
    if (!asset) return;
    // For now, share with all
    const { error } = await (await import("@/integrations/supabase/client")).supabase
      .from("session_assets").update({ shared_with: ['all'] }).eq("id", assetId);
    if (!error) toast.success("Sent to party");
  };

  const handleAddNote = async (content: string, type: 'personal' | 'session') => {
    await createNote.mutateAsync({
      session_id: session.id,
      author_id: 'dm',
      author_name: 'DM',
      content,
      note_type: type,
    });
  };

  const selectedPlayer = selectedPlayerEffects ? players.find(p => p.id === selectedPlayerEffects) : null;

  const initiativeProps = {
    players: players.map(p => ({
      id: p.id,
      name: p.player_name,
      initiative: p.initiative,
      statusEffects: p.status_effects,
      isActive: p.is_active,
    })),
    onNextTurn: handleNextTurn,
    onAddCombatant: () => {},
  };

  const playerListProps = {
    players: players.map(p => ({
      id: p.id,
      name: p.player_name,
      initiative: p.initiative,
      statusEffects: p.status_effects,
      isActive: p.is_active,
    })),
    onAssignEffect: (id: string) => setSelectedPlayerEffects(id),
    onRemovePlayer: handleRemovePlayer,
  };

  const assetProps = {
    assets: assets.map(a => ({
      id: a.id,
      title: a.title,
      description: a.description || '',
      imageUrl: a.file_url || '',
      type: a.asset_type as any,
      sharedWith: a.shared_with,
      createdAt: a.created_at,
    })),
    onUpload: handleUpload,
    onSendAsset: handleSendAsset,
  };

  const noteProps = {
    notes: notes.map(n => ({
      id: n.id,
      content: n.content,
      authorId: n.author_id,
      authorName: n.author_name,
      type: n.note_type as 'personal' | 'session',
      createdAt: n.created_at,
      updatedAt: n.updated_at,
    })),
    currentUserId: 'dm',
    onAddNote: handleAddNote,
  };

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
        <input ref={fileInputRef} type="file" className="hidden" accept="image/*,.pdf" onChange={handleFileChange} />
        <SessionHeader session={{ id: session.id, name: session.name, description: session.description || '', joinCode: session.join_code, createdAt: session.created_at, isActive: session.is_active }} onBack={() => navigate("/")} />

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {activeTab === 'initiative' && <InitiativeTracker {...initiativeProps} isCompact />}
          {activeTab === 'players' && <PlayerList {...playerListProps} />}
          {activeTab === 'assets' && <AssetLibrary {...assetProps} />}
          {activeTab === 'notes' && <NotesPanel {...noteProps} />}
          {activeTab === 'effects' && selectedPlayer && (
            <StatusEffectsPanel activeEffects={selectedPlayer.status_effects} onToggleEffect={handleToggleEffect} />
          )}
          {activeTab === 'effects' && !selectedPlayer && (
            <div className="card-surface p-6 text-center">
              <p className="text-muted-foreground text-sm">Select a player from the Party tab to manage effects.</p>
            </div>
          )}
        </div>

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
      <input ref={fileInputRef} type="file" className="hidden" accept="image/*,.pdf" onChange={handleFileChange} />
      <SessionHeader session={{ id: session.id, name: session.name, description: session.description || '', joinCode: session.join_code, createdAt: session.created_at, isActive: session.is_active }} onBack={() => navigate("/")} />

      <div className="flex-1 grid grid-cols-[280px_1fr_320px] gap-0 overflow-hidden">
        <div className="overflow-y-auto p-4 space-y-4">
          <PlayerList {...playerListProps} />
          {selectedPlayer && (
            <StatusEffectsPanel activeEffects={selectedPlayer.status_effects} onToggleEffect={handleToggleEffect} />
          )}
        </div>

        <div className="overflow-y-auto p-4 space-y-4 border-x border-border/30">
          <InitiativeTracker {...initiativeProps} />
          <AssetLibrary {...assetProps} />
        </div>

        <div className="overflow-y-auto p-4 space-y-4">
          <NotesPanel {...noteProps} />
        </div>
      </div>
    </div>
  );
}
