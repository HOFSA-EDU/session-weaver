
REVOKE EXECUTE ON FUNCTION public.is_session_owner(uuid, uuid) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.is_session_participant(uuid, uuid) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.can_read_note(uuid, text, text, uuid) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.can_write_note(uuid, text, uuid) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.lookup_session_by_code(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.lookup_session_by_code(text) TO anon, authenticated;
