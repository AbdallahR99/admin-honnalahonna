-- This script updates the user_profiles view to include an is_admin field.
-- Run this in your Supabase SQL Editor if you haven't already.

-- Drop the existing view if it exists
DROP VIEW IF EXISTS public.user_profiles;

-- Recreate the view with the is_admin field
CREATE VIEW public.user_profiles AS
SELECT
  u.id AS user_id,
  u.email,
  u.raw_user_meta_data->>'first_name' AS first_name,
  u.raw_user_meta_data->>'last_name' AS last_name,
  u.raw_user_meta_data->>'avatar' AS avatar,
  (u.raw_user_meta_data->>'is_admin')::boolean AS is_admin, -- Added is_admin field
  u.created_at,
  COALESCE(u.phone, u.raw_user_meta_data->>'phone') AS phone
FROM
  auth.users u;

SELECT 'View user_profiles updated successfully with is_admin field.' AS status;
