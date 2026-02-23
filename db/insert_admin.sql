-- ============================================
-- INSERT ADMIN USER WITH AUTO PASSWORD HASHING
-- ============================================
-- HOW TO USE:
-- 1. Replace 'your-email@example.com' with your admin email
-- 2. Replace 'YourPasswordHere' with your admin password
-- 3. Run this entire script in Supabase SQL Editor
-- ============================================

-- Make sure pgcrypto extension is enabled
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Insert admin email into admin_users_main
INSERT INTO admin_users_main (email, created_by, notes)
VALUES (
  'your-email@example.com',  -- ← CHANGE THIS to your email
  'system',
  'First admin account'
)
ON CONFLICT (email) DO NOTHING;

-- Insert admin password into admin_settings_main (key = email, value = hashed password)
INSERT INTO admin_settings_main (setting_key, setting_value, updated_by)
VALUES (
  'your-email@example.com',                    -- ← CHANGE THIS to your email (must match above)
  crypt('YourPasswordHere', gen_salt('bf')),  -- ← CHANGE 'YourPasswordHere' to your password
  'system'
)
ON CONFLICT (setting_key) DO UPDATE 
SET setting_value = EXCLUDED.setting_value,
    updated_at = NOW();

-- Verify the admin was created
SELECT 
  u.id,
  u.email,
  u.created_at,
  u.notes,
  'Password set in admin_settings_main' as status
FROM admin_users_main u
WHERE u.email LIKE '%@%'
ORDER BY u.created_at DESC 
LIMIT 1;
