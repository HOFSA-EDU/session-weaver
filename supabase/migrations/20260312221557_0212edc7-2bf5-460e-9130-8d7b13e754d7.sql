
ALTER TABLE public.session_assets DROP CONSTRAINT session_assets_session_id_fkey;
ALTER TABLE public.session_assets ADD CONSTRAINT session_assets_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.sessions(id) ON DELETE CASCADE;

ALTER TABLE public.session_players DROP CONSTRAINT session_players_session_id_fkey;
ALTER TABLE public.session_players ADD CONSTRAINT session_players_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.sessions(id) ON DELETE CASCADE;

ALTER TABLE public.session_notes DROP CONSTRAINT session_notes_session_id_fkey;
ALTER TABLE public.session_notes ADD CONSTRAINT session_notes_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.sessions(id) ON DELETE CASCADE;
