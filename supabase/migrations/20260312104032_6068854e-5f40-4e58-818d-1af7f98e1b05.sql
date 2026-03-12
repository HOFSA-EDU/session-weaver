-- Add user_id to sessions (nullable initially for migration)
ALTER TABLE public.sessions ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add user_id to session_players (nullable initially for migration)  
ALTER TABLE public.session_players ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

-- Drop old RLS policies on sessions
DROP POLICY IF EXISTS "Anyone can create sessions" ON public.sessions;
DROP POLICY IF EXISTS "Anyone can read sessions" ON public.sessions;
DROP POLICY IF EXISTS "Creator can delete sessions" ON public.sessions;
DROP POLICY IF EXISTS "Creator can update sessions" ON public.sessions;

-- New RLS policies for sessions
CREATE POLICY "Authenticated users can create sessions"
  ON public.sessions FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Anyone can read sessions"
  ON public.sessions FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Owner can update sessions"
  ON public.sessions FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Owner can delete sessions"
  ON public.sessions FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- Drop old RLS policies on session_players
DROP POLICY IF EXISTS "Anyone can join sessions" ON public.session_players;
DROP POLICY IF EXISTS "Anyone can read session players" ON public.session_players;
DROP POLICY IF EXISTS "Anyone can update session players" ON public.session_players;
DROP POLICY IF EXISTS "Anyone can delete session players" ON public.session_players;

-- New RLS policies for session_players
CREATE POLICY "Authenticated users can join sessions"
  ON public.session_players FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Anyone can read session players"
  ON public.session_players FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Owner or DM can update session players"
  ON public.session_players FOR UPDATE TO authenticated
  USING (
    auth.uid() = user_id OR
    EXISTS (SELECT 1 FROM public.sessions WHERE id = session_players.session_id AND user_id = auth.uid())
  );

CREATE POLICY "Owner or DM can delete session players"
  ON public.session_players FOR DELETE TO authenticated
  USING (
    auth.uid() = user_id OR
    EXISTS (SELECT 1 FROM public.sessions WHERE id = session_players.session_id AND user_id = auth.uid())
  );

-- Update session_assets policies to require auth
DROP POLICY IF EXISTS "Anyone can create assets" ON public.session_assets;
DROP POLICY IF EXISTS "Anyone can read assets" ON public.session_assets;
DROP POLICY IF EXISTS "Anyone can update assets" ON public.session_assets;
DROP POLICY IF EXISTS "Anyone can delete assets" ON public.session_assets;

CREATE POLICY "Authenticated can create assets"
  ON public.session_assets FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated can read assets"
  ON public.session_assets FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Authenticated can update assets"
  ON public.session_assets FOR UPDATE TO authenticated
  USING (true);

CREATE POLICY "Authenticated can delete assets"
  ON public.session_assets FOR DELETE TO authenticated
  USING (true);

-- Update session_notes policies to require auth
DROP POLICY IF EXISTS "Anyone can create notes" ON public.session_notes;
DROP POLICY IF EXISTS "Anyone can read notes" ON public.session_notes;
DROP POLICY IF EXISTS "Anyone can update notes" ON public.session_notes;
DROP POLICY IF EXISTS "Anyone can delete notes" ON public.session_notes;

CREATE POLICY "Authenticated can create notes"
  ON public.session_notes FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated can read notes"
  ON public.session_notes FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Authenticated can update notes"
  ON public.session_notes FOR UPDATE TO authenticated
  USING (true);

CREATE POLICY "Authenticated can delete notes"
  ON public.session_notes FOR DELETE TO authenticated
  USING (true);