-- Migration: Add missing columns to online_game_state table
-- Run this in your Supabase SQL Editor

-- Add pending_players column
ALTER TABLE online_game_state 
ADD COLUMN IF NOT EXISTS pending_players JSONB;

-- Add guessing_player_index column
ALTER TABLE online_game_state 
ADD COLUMN IF NOT EXISTS guessing_player_index INTEGER;

-- Add guess_timer column
ALTER TABLE online_game_state 
ADD COLUMN IF NOT EXISTS guess_timer INTEGER;

-- Verify the columns were added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'online_game_state' 
ORDER BY ordinal_position;
