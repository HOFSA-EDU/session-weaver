
-- ============ Helper functions (SECURITY DEFINER) ============
CREATE OR REPLACE FUNCTION public.is_session_owner(_session_id uuid, _user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.sessions WHERE id = _session_id AND user_id = _user_id)
$$;

CREATE OR REPLACE FUNCTION public.is_session_participant(_session_id uuid, _user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.session_players WHERE session_id = _session_id AND user_id = _user_id)
$$;

CREATE OR REPLACE FUNCTION public.can_read_note(_session_id uuid, _author_id text, _note_type text, _user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT
    CASE
      WHEN _note_type = 'session' THEN
        public.is_session_owner(_session_id, _user_id) OR public.is_session_participant(_session_id, _user_id)
      ELSE
        _author_id = _user_id::text
        OR EXISTS (SELECT 1 FROM public.session_players WHERE id::text = _author_id AND user_id = _user_id)
    END
$$;

CREATE OR REPLACE FUNCTION public.can_write_note(_session_id uuid, _author_id text, _user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT
    (public.is_session_owner(_session_id, _user_id) OR public.is_session_participant(_session_id, _user_id))
    AND (
      _author_id = _user_id::text
      OR EXISTS (SELECT 1 FROM public.session_players WHERE id::text = _author_id AND user_id = _user_id)
    )
$$;

-- Public lookup by join code (so join page works pre-auth)
CREATE OR REPLACE FUNCTION public.lookup_session_by_code(_code text)
RETURNS SETOF public.sessions LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT * FROM public.sessions WHERE join_code = upper(_code) LIMIT 1
$$;
GRANT EXECUTE ON FUNCTION public.lookup_session_by_code(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.is_session_owner(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_session_participant(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_read_note(uuid, text, text, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_write_note(uuid, text, uuid) TO authenticated;

-- ============ Revoke broad anon grants ============
REVOKE ALL ON public.sessions FROM anon;
REVOKE ALL ON public.session_players FROM anon;
REVOKE ALL ON public.session_assets FROM anon;
REVOKE ALL ON public.session_notes FROM anon;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.sessions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.session_players TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.session_assets TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.session_notes TO authenticated;

-- ============ sessions RLS ============
DROP POLICY IF EXISTS "Anyone can read sessions" ON public.sessions;
CREATE POLICY "Owner or participants can read sessions" ON public.sessions
FOR SELECT TO authenticated
USING (auth.uid() = user_id OR public.is_session_participant(id, auth.uid()));

-- ============ session_players RLS ============
DROP POLICY IF EXISTS "Anyone can read session players" ON public.session_players;
CREATE POLICY "Owner and participants can read players" ON public.session_players
FOR SELECT TO authenticated
USING (
  auth.uid() = user_id
  OR public.is_session_owner(session_id, auth.uid())
  OR public.is_session_participant(session_id, auth.uid())
);

-- ============ session_assets RLS ============
DROP POLICY IF EXISTS "Authenticated can read assets" ON public.session_assets;
DROP POLICY IF EXISTS "Authenticated can create assets" ON public.session_assets;
DROP POLICY IF EXISTS "Authenticated can update assets" ON public.session_assets;
DROP POLICY IF EXISTS "Authenticated can delete assets" ON public.session_assets;

CREATE POLICY "Owner and participants can read assets" ON public.session_assets
FOR SELECT TO authenticated
USING (public.is_session_owner(session_id, auth.uid()) OR public.is_session_participant(session_id, auth.uid()));

CREATE POLICY "Owner and participants can create assets" ON public.session_assets
FOR INSERT TO authenticated
WITH CHECK (public.is_session_owner(session_id, auth.uid()) OR public.is_session_participant(session_id, auth.uid()));

CREATE POLICY "Owner can update assets" ON public.session_assets
FOR UPDATE TO authenticated
USING (public.is_session_owner(session_id, auth.uid()))
WITH CHECK (public.is_session_owner(session_id, auth.uid()));

CREATE POLICY "Owner can delete assets" ON public.session_assets
FOR DELETE TO authenticated
USING (public.is_session_owner(session_id, auth.uid()));

-- ============ session_notes RLS ============
DROP POLICY IF EXISTS "Authenticated can read notes" ON public.session_notes;
DROP POLICY IF EXISTS "Authenticated can create notes" ON public.session_notes;
DROP POLICY IF EXISTS "Authenticated can update notes" ON public.session_notes;
DROP POLICY IF EXISTS "Authenticated can delete notes" ON public.session_notes;

CREATE POLICY "Readers of notes based on type" ON public.session_notes
FOR SELECT TO authenticated
USING (public.can_read_note(session_id, author_id, note_type, auth.uid()));

CREATE POLICY "Participants can create notes" ON public.session_notes
FOR INSERT TO authenticated
WITH CHECK (public.can_write_note(session_id, author_id, auth.uid()));

CREATE POLICY "Author can update own notes" ON public.session_notes
FOR UPDATE TO authenticated
USING (
  author_id = auth.uid()::text
  OR EXISTS (SELECT 1 FROM public.session_players WHERE id::text = author_id AND user_id = auth.uid())
)
WITH CHECK (
  author_id = auth.uid()::text
  OR EXISTS (SELECT 1 FROM public.session_players WHERE id::text = author_id AND user_id = auth.uid())
);

CREATE POLICY "Author or owner can delete notes" ON public.session_notes
FOR DELETE TO authenticated
USING (
  author_id = auth.uid()::text
  OR EXISTS (SELECT 1 FROM public.session_players WHERE id::text = author_id AND user_id = auth.uid())
  OR public.is_session_owner(session_id, auth.uid())
);

-- ============ storage.objects (session-assets bucket) ============
DROP POLICY IF EXISTS "Anyone can view session assets" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload session assets" ON storage.objects;

CREATE POLICY "Participants can view session asset files" ON storage.objects
FOR SELECT TO authenticated
USING (
  bucket_id = 'session-assets'
  AND (
    public.is_session_owner((split_part(name, '/', 1))::uuid, auth.uid())
    OR public.is_session_participant((split_part(name, '/', 1))::uuid, auth.uid())
  )
);

CREATE POLICY "Participants can upload session asset files" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'session-assets'
  AND (
    public.is_session_owner((split_part(name, '/', 1))::uuid, auth.uid())
    OR public.is_session_participant((split_part(name, '/', 1))::uuid, auth.uid())
  )
);

CREATE POLICY "Owner can delete session asset files" ON storage.objects
FOR DELETE TO authenticated
USING (
  bucket_id = 'session-assets'
  AND public.is_session_owner((split_part(name, '/', 1))::uuid, auth.uid())
);
