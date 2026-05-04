-- ============================================================
-- Narutodle: ROLLBACK — undo all RLS + Auth migration changes
-- Run this in the Supabase SQL Editor to revert to the state
-- before supabase-rls-migration.sql was applied.
-- ============================================================


-- ── Drop trigger and trigger function ──────────────────────
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_auth_user();

-- ── Drop UUID swap helper ───────────────────────────────────
DROP FUNCTION IF EXISTS public.swap_user_uuid(UUID, UUID);


-- ── Disable RLS and drop all policies: game data tables ────
ALTER TABLE public.characters       DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.jutsus            DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.passive_abilities DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.attack_types      DISABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read characters"        ON public.characters;
DROP POLICY IF EXISTS "Public read jutsus"             ON public.jutsus;
DROP POLICY IF EXISTS "Public read passive_abilities"  ON public.passive_abilities;
DROP POLICY IF EXISTS "Public read attack_types"       ON public.attack_types;


-- ── Disable RLS and drop all policies: users ───────────────
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users: read own"   ON public.users;
DROP POLICY IF EXISTS "Users: update own" ON public.users;


-- ── Disable RLS and drop all policies: profiles ────────────
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Profiles: read any"   ON public.profiles;
DROP POLICY IF EXISTS "Profiles: update own" ON public.profiles;


-- ── Disable RLS and drop all policies: friends ─────────────
ALTER TABLE public.friends DISABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Friends: read own"   ON public.friends;
DROP POLICY IF EXISTS "Friends: insert own" ON public.friends;
DROP POLICY IF EXISTS "Friends: update own" ON public.friends;
DROP POLICY IF EXISTS "Friends: delete own" ON public.friends;


-- ── Disable RLS and drop all policies: online_game_sessions ─
ALTER TABLE public.online_game_sessions DISABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Sessions: read participant"   ON public.online_game_sessions;
DROP POLICY IF EXISTS "Sessions: insert host"        ON public.online_game_sessions;
DROP POLICY IF EXISTS "Sessions: update participant" ON public.online_game_sessions;
DROP POLICY IF EXISTS "Sessions: delete host"        ON public.online_game_sessions;


-- ── Disable RLS and drop all policies: online_game_state ───
ALTER TABLE public.online_game_state DISABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "GameState: read participant"   ON public.online_game_state;
DROP POLICY IF EXISTS "GameState: upsert participant" ON public.online_game_state;


-- ── Disable RLS and drop all policies: online_game_actions ─
ALTER TABLE public.online_game_actions DISABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Actions: read participant" ON public.online_game_actions;
DROP POLICY IF EXISTS "Actions: insert own"       ON public.online_game_actions;


-- ── Disable RLS and drop all policies: admin tables ────────
ALTER TABLE public.admin_users_main    DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_settings_main DISABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin: anon read settings" ON public.admin_settings_main;
DROP POLICY IF EXISTS "Admin: anon read users"    ON public.admin_users_main;


-- ============================================================
-- Done. Database is back to pre-migration state.
-- ============================================================
