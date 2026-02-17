-- Online Multiplayer Card Game Schema
-- Tables for managing online game sessions with invite codes

-- Create extension for UUID generation if not exists
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Game Sessions table
-- Stores active and completed online multiplayer games
CREATE TABLE IF NOT EXISTS online_game_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_code VARCHAR(6) UNIQUE NOT NULL, -- Short code for joining (e.g., "ABC123")
  host_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  guest_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  status VARCHAR(20) DEFAULT 'waiting', -- 'waiting', 'active', 'finished', 'abandoned'
  current_player_index INTEGER DEFAULT 0, -- 0 for host, 1 for guest
  winner_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_activity_at TIMESTAMPTZ DEFAULT NOW()
);

-- Game State table
-- Stores the full game state as JSONB
CREATE TABLE IF NOT EXISTS online_game_state (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES online_game_sessions(id) ON DELETE CASCADE,
  -- Full game state
  players JSONB NOT NULL, -- [Player, Player] with hands
  pending_players JSONB, -- Players waiting for game to start
  booster_hands JSONB NOT NULL, -- [[booster], [booster]]
  booster_deck JSONB, -- Remaining boosters
  jutsu_cooldowns JSONB, -- Cooldown tracking
  -- Game phase tracking
  game_started BOOLEAN DEFAULT FALSE,
  show_number_guess BOOLEAN DEFAULT FALSE,
  target_number INTEGER,
  player1_guess VARCHAR(10),
  player2_guess VARCHAR(10),
  guessing_player_index INTEGER, -- 0 or 1 or null
  guess_timer INTEGER, -- Timer for number guessing
  -- Turn tracking
  jutsus_used_this_turn INTEGER DEFAULT 0,
  -- UI state for syncing
  selected_character JSONB,
  selected_jutsu JSONB,
  selected_booster JSONB,
  selecting_target BOOLEAN DEFAULT FALSE,
  selecting_jutsu_target BOOLEAN DEFAULT FALSE,
  is_selecting_splash_targets BOOLEAN DEFAULT FALSE,
  splash_targets JSONB,
  -- Status effects
  newly_drawn_card JSONB,
  double_attack_character JSONB,
  healed_card JSONB,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Game Actions Log table
-- Stores all actions for replay/verification
CREATE TABLE IF NOT EXISTS online_game_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES online_game_sessions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action_type VARCHAR(50) NOT NULL, -- 'attack', 'use_jutsu', 'play_booster', 'end_turn', 'draw_card'
  action_data JSONB NOT NULL,
  turn_number INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_game_sessions_code ON online_game_sessions(game_code);
CREATE INDEX IF NOT EXISTS idx_game_sessions_host ON online_game_sessions(host_user_id);
CREATE INDEX IF NOT EXISTS idx_game_sessions_guest ON online_game_sessions(guest_user_id);
CREATE INDEX IF NOT EXISTS idx_game_sessions_status ON online_game_sessions(status);
CREATE INDEX IF NOT EXISTS idx_game_state_session ON online_game_state(session_id);
CREATE INDEX IF NOT EXISTS idx_game_actions_session ON online_game_actions(session_id);

-- Function to generate unique game code
CREATE OR REPLACE FUNCTION generate_game_code()
RETURNS VARCHAR(6) AS $$
DECLARE
  chars VARCHAR(36) := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; -- Excluding similar chars (I,O,0,1)
  result VARCHAR(6) := '';
  i INTEGER;
BEGIN
  FOR i IN 1..6 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Function to clean up abandoned games (older than 24 hours with no activity)
CREATE OR REPLACE FUNCTION cleanup_abandoned_games()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  UPDATE online_game_sessions
  SET status = 'abandoned'
  WHERE status IN ('waiting', 'active')
    AND last_activity_at < NOW() - INTERVAL '24 hours';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_game_sessions_updated_at
  BEFORE UPDATE ON online_game_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_game_state_updated_at
  BEFORE UPDATE ON online_game_state
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (optional - disable for testing)
-- ALTER TABLE online_game_sessions ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE online_game_state ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE online_game_actions ENABLE ROW LEVEL SECURITY;
