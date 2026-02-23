-- ============================================
-- ADMIN AUTHENTICATION SCHEMA
-- ============================================
-- Run this entire file in Supabase SQL Editor
-- This will drop existing admin tables and recreate them
-- ============================================

-- Drop existing tables if they exist (clean slate)
DROP TABLE IF EXISTS admin_settings_main CASCADE;
DROP TABLE IF EXISTS admin_users_main CASCADE;

-- Enable pgcrypto extension for password hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Admin settings table - stores admin emails and password hashes
-- setting_key = admin email
-- setting_value = password hash
CREATE TABLE admin_settings_main (
  id SERIAL PRIMARY KEY,
  setting_key TEXT NOT NULL UNIQUE,
  setting_value TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by TEXT DEFAULT 'system'
);

-- Admin users table - optional metadata table
CREATE TABLE admin_users_main (
  id SERIAL PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT DEFAULT 'system',
  notes TEXT
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_admin_settings_key ON admin_settings_main(setting_key);
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users_main(email);

-- Enable RLS (Row Level Security)
ALTER TABLE admin_settings_main ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users_main ENABLE ROW LEVEL SECURITY;

-- Create policies for admin_settings_main (only allow service role access for maximum security)
CREATE POLICY "Enable read access for service role only" ON admin_settings_main
  FOR SELECT USING (auth.role() = 'service_role');

CREATE POLICY "Enable insert access for service role only" ON admin_settings_main
  FOR INSERT WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Enable update access for service role only" ON admin_settings_main
  FOR UPDATE USING (auth.role() = 'service_role');

CREATE POLICY "Enable delete access for service role only" ON admin_settings_main
  FOR DELETE USING (auth.role() = 'service_role');

-- Create policies for admin_users_main
CREATE POLICY "Enable read access for service role only" ON admin_users_main
  FOR SELECT USING (auth.role() = 'service_role');

CREATE POLICY "Enable insert access for service role only" ON admin_users_main
  FOR INSERT WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Enable update access for service role only" ON admin_users_main
  FOR UPDATE USING (auth.role() = 'service_role');

CREATE POLICY "Enable delete access for service role only" ON admin_users_main
  FOR DELETE USING (auth.role() = 'service_role');
