-- ============================================================
-- Narutodle Custom User ID Migration
-- Run this entire script in Supabase → SQL Editor
--
-- ID format: YYMM-NNNN
--   YY   = 2-digit year  (e.g. 26)
--   MM   = 2-digit month (e.g. 03)
--   NNNN = 4-digit sequential number of users registered that month
--
-- Examples:
--   1st  user in March 2026 → 2603-0001
--   2nd  user in March 2026 → 2603-0002
--   999th user              → 2603-0999
--   9999th user             → 2603-9999
-- ============================================================


-- 1. Add the column (nullable so we can backfill without constraint errors)
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS custom_id TEXT;


-- 2. Pure helper: converts a month-date + sequence number into the ID string
CREATE OR REPLACE FUNCTION generate_narutodle_id(dt DATE, seq INTEGER)
RETURNS TEXT
LANGUAGE plpgsql IMMUTABLE AS $$
BEGIN
  RETURN TO_CHAR(dt, 'YYMM') || '-' || LPAD(seq::TEXT, 4, '0');
END;
$$;


-- 3. Trigger function: auto-assigns custom_id on every new profile row
CREATE OR REPLACE FUNCTION assign_custom_user_id()
RETURNS TRIGGER
LANGUAGE plpgsql AS $$
DECLARE
  user_created DATE;
  month_prefix TEXT;
  seq          INTEGER;
BEGIN
  -- Grab the creation date from the users table
  SELECT DATE(created_at)
    INTO user_created
    FROM users
   WHERE id = NEW.user_id;

  -- Fallback to today if the users row is missing for some reason
  IF user_created IS NULL THEN
    user_created := CURRENT_DATE;
  END IF;

  month_prefix := TO_CHAR(user_created, 'YYMM');

  -- Count profiles already assigned an ID for this month
  SELECT COUNT(*) + 1
    INTO seq
    FROM profiles
   WHERE custom_id LIKE month_prefix || '-%'
     AND custom_id IS NOT NULL;

  NEW.custom_id := generate_narutodle_id(user_created, seq);

  RETURN NEW;
END;
$$;


-- 4. Attach the trigger (fires before INSERT, only when custom_id is not set)
DROP TRIGGER IF EXISTS trigger_assign_custom_user_id ON profiles;

CREATE TRIGGER trigger_assign_custom_user_id
  BEFORE INSERT ON profiles
  FOR EACH ROW
  WHEN (NEW.custom_id IS NULL)
  EXECUTE FUNCTION assign_custom_user_id();


-- 5. Backfill existing profiles (ordered by user creation date so older
--    accounts get lower sequence numbers within the same month)
DO $$
DECLARE
  r            RECORD;
  user_created DATE;
  month_prefix TEXT;
  seq          INTEGER;
BEGIN
  FOR r IN
    SELECT p.id, p.user_id, DATE(u.created_at) AS created_date
      FROM profiles p
      LEFT JOIN users u ON u.id = p.user_id
     WHERE p.custom_id IS NULL
     ORDER BY u.created_at ASC NULLS LAST
  LOOP
    user_created := COALESCE(r.created_date, CURRENT_DATE);
    month_prefix := TO_CHAR(user_created, 'YYMM');

    SELECT COUNT(*) + 1
      INTO seq
      FROM profiles
     WHERE custom_id LIKE month_prefix || '-%'
       AND custom_id IS NOT NULL;

    UPDATE profiles
       SET custom_id = generate_narutodle_id(user_created, seq)
     WHERE id = r.id;
  END LOOP;
END $$;


-- 6. Now that every row has a value, add the UNIQUE constraint
ALTER TABLE profiles
  ADD CONSTRAINT profiles_custom_id_unique UNIQUE (custom_id);

-- Done! Verify with:
-- SELECT user_id, custom_id FROM profiles ORDER BY custom_id;
