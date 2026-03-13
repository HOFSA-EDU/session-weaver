import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tables, TablesInsert } from "@/integrations/supabase/types";
import { generateJoinCode } from "@/lib/session-utils";
import { useEffect } from "react";

type Session = Tables<"sessions">;
type SessionPlayer = Tables<"session_players">;
type SessionAsset = Tables<"session_assets">;
type SessionNote = Tables<"session_notes">;

function createSafeUuid() {
  const browserCrypto = globalThis.crypto as Crypto | undefined;

  if (typeof browserCrypto?.randomUUID === "function") {
    return browserCrypto.randomUUID();
  }

  if (typeof browserCrypto?.getRandomValues === "function") {
    return Array.from(browserCrypto.getRandomValues(new Uint8Array(16)))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

// ===== SESSION HOOKS =====

export function useCreateSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ name, description }: { name: string; description: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const joinCode = generateJoinCode();
      const { data, error } = await supabase
        .from("sessions")
        .insert({ name, description, join_code: joinCode, creator_id: user.id, user_id: user.id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["my-sessions"] }),
  });
}

export function useSession(sessionId: string | null) {
  return useQuery({
    queryKey: ["session", sessionId],
    queryFn: async () => {
      if (!sessionId) return null;
      const { data, error } = await supabase.from("sessions").select("*").eq("id", sessionId).single();
      if (error) throw error;
      return data as Session;
    },
    enabled: !!sessionId,
  });
}

export function useSessionByCode(code: string | null) {
  return useQuery({
    queryKey: ["session-code", code],
    queryFn: async () => {
      if (!code) return null;
      const { data, error } = await supabase.from("sessions").select("*").eq("join_code", code.toUpperCase()).single();
      if (error) throw error;
      return data as Session;
    },
    enabled: !!code,
  });
}

export function useMySessions() {
  return useQuery({
    queryKey: ["my-sessions"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      const { data, error } = await supabase.from("sessions").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
      if (error) throw error;
      return data as Session[];
    },
  });
}

export function useMyPlayerSessions() {
  return useQuery({
    queryKey: ["my-player-sessions"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      const { data: playerEntries, error: pErr } = await supabase
        .from("session_players")
        .select("*, sessions(*)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (pErr) throw pErr;
      return (playerEntries || []).map((p: any) => ({
        session: p.sessions as Session,
        player: p as SessionPlayer,
      }));
    },
  });
}

export function useUpdateSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Partial<Session>) => {
      const { data, error } = await supabase.from("sessions").update(updates).eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["session", data.id] });
      queryClient.invalidateQueries({ queryKey: ["my-sessions"] });
    },
  });
}

export function useDeleteSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("sessions").delete().eq("id", id);
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-sessions"] });
    },
  });
}

// ===== PLAYER HOOKS =====

export function useSessionPlayers(sessionId: string | null) {
  return useQuery({
    queryKey: ["session-players", sessionId],
    queryFn: async () => {
      if (!sessionId) return [];
      const { data, error } = await supabase.from("session_players").select("*").eq("session_id", sessionId).order("turn_order", { ascending: true });
      if (error) throw error;
      return data as SessionPlayer[];
    },
    enabled: !!sessionId,
  });
}

export function useJoinSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ sessionId, playerName }: { sessionId: string; playerName: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      
      // Check if already joined
      const { data: existing } = await supabase
        .from("session_players")
        .select("*")
        .eq("session_id", sessionId)
        .eq("user_id", user.id)
        .maybeSingle();
      if (existing) return existing as SessionPlayer;

      // Get max turn_order
      const { data: lastPlayer } = await supabase.from("session_players").select("turn_order").eq("session_id", sessionId).order("turn_order", { ascending: false }).limit(1);
      const nextOrder = (lastPlayer && lastPlayer.length > 0 ? lastPlayer[0].turn_order : -1) + 1;
      
      const token = self.crypto?.randomUUID?.() ?? Array.from(self.crypto.getRandomValues(new Uint8Array(16))).map(b => b.toString(16).padStart(2, '0')).join('');
      const { data, error } = await supabase
        .from("session_players")
        .insert({ session_id: sessionId, player_name: playerName, player_token: token, turn_order: nextOrder, user_id: user.id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["session-players", data.session_id] });
      queryClient.invalidateQueries({ queryKey: ["my-player-sessions"] });
    },
  });
}

export function useUpdatePlayer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, sessionId, ...updates }: { id: string; sessionId: string } & Partial<SessionPlayer>) => {
      const { data, error } = await supabase.from("session_players").update(updates).eq("id", id).select().single();
      if (error) throw error;
      return { ...data, sessionId };
    },
    onSuccess: (data) => queryClient.invalidateQueries({ queryKey: ["session-players", data.sessionId] }),
  });
}

export function useRemovePlayer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, sessionId }: { id: string; sessionId: string }) => {
      const { error } = await supabase.from("session_players").delete().eq("id", id);
      if (error) throw error;
      return { sessionId };
    },
    onSuccess: (data) => queryClient.invalidateQueries({ queryKey: ["session-players", data.sessionId] }),
  });
}

// ===== ASSET HOOKS =====

export function useSessionAssets(sessionId: string | null) {
  return useQuery({
    queryKey: ["session-assets", sessionId],
    queryFn: async () => {
      if (!sessionId) return [];
      const { data, error } = await supabase.from("session_assets").select("*").eq("session_id", sessionId).order("created_at", { ascending: false });
      if (error) throw error;
      return data as SessionAsset[];
    },
    enabled: !!sessionId,
  });
}

export function useCreateAsset() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (asset: TablesInsert<"session_assets">) => {
      const { data, error } = await supabase.from("session_assets").insert(asset).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => queryClient.invalidateQueries({ queryKey: ["session-assets", data.session_id] }),
  });
}

export function useUpdateAsset() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, sessionId, ...updates }: { id: string; sessionId: string } & Partial<SessionAsset>) => {
      const { data, error } = await supabase.from("session_assets").update(updates).eq("id", id).select().single();
      if (error) throw error;
      return { ...data, sessionId };
    },
    onSuccess: (data) => queryClient.invalidateQueries({ queryKey: ["session-assets", data.sessionId] }),
  });
}

export function useDeleteAsset() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, sessionId }: { id: string; sessionId: string }) => {
      const { error } = await supabase.from("session_assets").delete().eq("id", id);
      if (error) throw error;
      return { sessionId };
    },
    onSuccess: (data) => queryClient.invalidateQueries({ queryKey: ["session-assets", data.sessionId] }),
  });
}

// ===== NOTES HOOKS =====

export function useSessionNotes(sessionId: string | null, authorId?: string) {
  return useQuery({
    queryKey: ["session-notes", sessionId, authorId],
    queryFn: async () => {
      if (!sessionId) return [];
      const { data, error } = await supabase.from("session_notes").select("*").eq("session_id", sessionId).order("created_at", { ascending: false });
      if (error) throw error;
      return (data as SessionNote[]).filter(
        n => n.note_type === 'session' || n.author_id === authorId
      );
    },
    enabled: !!sessionId,
  });
}

export function useCreateNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (note: TablesInsert<"session_notes">) => {
      const { data, error } = await supabase.from("session_notes").insert(note).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => queryClient.invalidateQueries({ queryKey: ["session-notes", data.session_id] }),
  });
}

export function useUpdateNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, sessionId, content }: { id: string; sessionId: string; content: string }) => {
      const { data, error } = await supabase.from("session_notes").update({ content }).eq("id", id).select().single();
      if (error) throw error;
      return { ...data, sessionId };
    },
    onSuccess: (data) => queryClient.invalidateQueries({ queryKey: ["session-notes", data.sessionId] }),
  });
}

export function useDeleteNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, sessionId }: { id: string; sessionId: string }) => {
      const { error } = await supabase.from("session_notes").delete().eq("id", id);
      if (error) throw error;
      return { sessionId };
    },
    onSuccess: (data) => queryClient.invalidateQueries({ queryKey: ["session-notes", data.sessionId] }),
  });
}

// ===== REALTIME SUBSCRIPTIONS =====

export function useSessionRealtime(sessionId: string | null) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!sessionId) return;

    const channel = supabase
      .channel(`session-${sessionId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'session_players', filter: `session_id=eq.${sessionId}` },
        () => queryClient.invalidateQueries({ queryKey: ["session-players", sessionId] })
      )
      .on('postgres_changes', { event: '*', schema: 'public', table: 'session_assets', filter: `session_id=eq.${sessionId}` },
        () => queryClient.invalidateQueries({ queryKey: ["session-assets", sessionId] })
      )
      .on('postgres_changes', { event: '*', schema: 'public', table: 'session_notes', filter: `session_id=eq.${sessionId}` },
        () => queryClient.invalidateQueries({ queryKey: ["session-notes", sessionId] })
      )
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'sessions', filter: `id=eq.${sessionId}` },
        () => queryClient.invalidateQueries({ queryKey: ["session", sessionId] })
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [sessionId, queryClient]);
}

// ===== UPLOAD =====

export async function uploadAssetFile(sessionId: string, file: File): Promise<string> {
  const ext = file.name.split('.').pop();
  const uuid = (crypto.randomUUID?.() ?? Array.from(crypto.getRandomValues(new Uint8Array(16))).map(b => b.toString(16).padStart(2, '0')).join(''));
  const path = `${sessionId}/${uuid}.${ext}`;
  const { error } = await supabase.storage.from('session-assets').upload(path, file);
  if (error) throw error;
  const { data } = supabase.storage.from('session-assets').getPublicUrl(path);
  return data.publicUrl;
}
