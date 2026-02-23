-- ============================================
-- MIGRATE ADMIN STRUCTURE
-- ============================================
-- This migrates password storage from admin_users_main to admin_settings_main
-- Run this in Supabase SQL Editor
-- ============================================

-- If you have existing data in admin_users_main, copy it to admin_settings_main
INSERT INTO admin_settings_main (setting_key, setting_value, updated_by)
SELECT email, password_hash, 'migration'
FROM admin_users_main
WHERE email IS NOT NULL AND password_hash IS NOT NULL
ON CONFLICT (setting_key) DO NOTHING;

-- Remove password_hash column from admin_users_main if it exists
ALTER TABLE admin_users_main 
DROP COLUMN IF EXISTS password_hash;

-- Add notes column to admin_users_main if you want metadata
ALTER TABLE admin_users_main 
ADD COLUMN IF NOT EXISTS notes TEXT;

-- Remove updated_at and updated_by columns from admin_users_main if they exist
ALTER TABLE admin_users_main 
DROP COLUMN IF EXISTS updated_at,
DROP COLUMN IF EXISTS updated_by;

-- Verify the structure
SELECT 'admin_settings_main' AS table_name, setting_key AS email, updated_at 
FROM admin_settings_main 
WHERE setting_key LIKE '%@%'
ORDER BY id DESC;

SELECT 'admin_users_main' AS table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'admin_users_main'
ORDER BY ordinal_position;
