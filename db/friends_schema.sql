-- Friends System Schema
-- Run this in your Supabase SQL editor

-- Friend requests / friendship table
-- A row represents either a pending request or an accepted friendship
CREATE TABLE IF NOT EXISTS friends (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  to_user_id   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL DEFAULT 'pending', -- 'pending' | 'accepted' | 'declined'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(from_user_id, to_user_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_friends_from   ON friends(from_user_id);
CREATE INDEX IF NOT EXISTS idx_friends_to     ON friends(to_user_id);
CREATE INDEX IF NOT EXISTS idx_friends_status ON friends(status);

-- RLS is disabled to match the rest of the project's tables (anon key + manual
-- user_id filtering is used instead of Supabase Auth JWT policies).
-- Run this if RLS was previously enabled:
--   ALTER TABLE friends DISABLE ROW LEVEL SECURITY;
