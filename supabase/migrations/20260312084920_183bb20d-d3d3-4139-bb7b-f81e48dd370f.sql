-- Create sessions table
CREATE TABLE public.sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  join_code TEXT NOT NULL UNIQUE,
  creator_id TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  combat_started BOOLEAN NOT NULL DEFAULT false,
  current_turn_player_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create session_players table
CREATE TABLE public.session_players (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
  player_name TEXT NOT NULL,
  player_token TEXT NOT NULL,
  initiative INTEGER,
  is_active BOOLEAN NOT NULL DEFAULT false,
  status_effects TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create session_assets table
CREATE TABLE public.session_assets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  file_url TEXT,
  asset_type TEXT NOT NULL DEFAULT 'handout',
  shared_with TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create session_notes table
CREATE TABLE public.session_notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
  author_id TEXT NOT NULL,
  author_name TEXT NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  note_type TEXT NOT NULL DEFAULT 'session',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create storage bucket for assets
INSERT INTO storage.buckets (id, name, public) VALUES ('session-assets', 'session-assets', true);

-- Create indexes
CREATE INDEX idx_sessions_join_code ON public.sessions(join_code);
CREATE INDEX idx_session_players_session ON public.session_players(session_id);
CREATE INDEX idx_session_assets_session ON public.session_assets(session_id);
CREATE INDEX idx_session_notes_session ON public.session_notes(session_id);

-- Enable RLS on all tables
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_notes ENABLE ROW LEVEL SECURITY;

-- Sessions RLS: no-auth game companion, security via join code knowledge
CREATE POLICY "Anyone can create sessions" ON public.sessions FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Anyone can read sessions" ON public.sessions FOR SELECT TO anon USING (true);
CREATE POLICY "Creator can update sessions" ON public.sessions FOR UPDATE TO anon USING (true);
CREATE POLICY "Creator can delete sessions" ON public.sessions FOR DELETE TO anon USING (true);

-- Session players RLS
CREATE POLICY "Anyone can join sessions" ON public.session_players FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Anyone can read session players" ON public.session_players FOR SELECT TO anon USING (true);
CREATE POLICY "Anyone can update session players" ON public.session_players FOR UPDATE TO anon USING (true);
CREATE POLICY "Anyone can delete session players" ON public.session_players FOR DELETE TO anon USING (true);

-- Session assets RLS
CREATE POLICY "Anyone can create assets" ON public.session_assets FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Anyone can read assets" ON public.session_assets FOR SELECT TO anon USING (true);
CREATE POLICY "Anyone can update assets" ON public.session_assets FOR UPDATE TO anon USING (true);
CREATE POLICY "Anyone can delete assets" ON public.session_assets FOR DELETE TO anon USING (true);

-- Session notes RLS
CREATE POLICY "Anyone can create notes" ON public.session_notes FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Anyone can read notes" ON public.session_notes FOR SELECT TO anon USING (true);
CREATE POLICY "Anyone can update notes" ON public.session_notes FOR UPDATE TO anon USING (true);
CREATE POLICY "Anyone can delete notes" ON public.session_notes FOR DELETE TO anon USING (true);

-- Storage policies
CREATE POLICY "Anyone can view session assets" ON storage.objects FOR SELECT USING (bucket_id = 'session-assets');
CREATE POLICY "Anyone can upload session assets" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'session-assets');

-- Timestamp trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_session_notes_updated_at
  BEFORE UPDATE ON public.session_notes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.session_players;
ALTER PUBLICATION supabase_realtime ADD TABLE public.session_assets;
ALTER PUBLICATION supabase_realtime ADD TABLE public.session_notes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.sessions;