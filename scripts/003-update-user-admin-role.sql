-- This script ensures the is_admin field is properly handled in the user_profiles view
-- and adds it to the users table if it doesn't exist

-- First, check if the is_admin column exists in the users table
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'users'
        AND column_name = 'is_admin'
    ) THEN
        -- Add the is_admin column if it doesn't exist
        ALTER TABLE public.users ADD COLUMN is_admin BOOLEAN DEFAULT FALSE;
    END IF;
END $$;

-- Update the user_profiles view to include the is_admin field
DROP VIEW IF EXISTS public.user_profiles;

CREATE VIEW public.user_profiles AS
SELECT
  u.id AS user_id,
  u.email,
  u.raw_user_meta_data->>'first_name' AS first_name,
  u.raw_user_meta_data->>'last_name' AS last_name,
  u.raw_user_meta_data->>'avatar' AS avatar,
  (u.raw_user_meta_data->>'is_admin')::boolean AS is_admin,
  u.created_at,
  COALESCE(u.phone, u.raw_user_meta_data->>'phone') AS phone
FROM
  auth.users u;

-- Create a function to sync the is_admin field between auth.users and public.users
CREATE OR REPLACE FUNCTION public.sync_user_admin_role()
RETURNS TRIGGER AS $$
BEGIN
  -- When updating the is_admin field in public.users
  IF TG_OP = 'UPDATE' AND OLD.is_admin IS DISTINCT FROM NEW.is_admin AND NEW.user_id IS NOT NULL THEN
    -- Update the auth.users metadata
    UPDATE auth.users
    SET raw_user_meta_data = 
      jsonb_set(
        COALESCE(raw_user_meta_data, '{}'::jsonb),
        '{is_admin}',
        CASE WHEN NEW.is_admin THEN 'true'::jsonb ELSE 'false'::jsonb END
      )
    WHERE id = NEW.user_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a trigger to sync the is_admin field
DROP TRIGGER IF EXISTS sync_user_admin_role_trigger ON public.users;
CREATE TRIGGER sync_user_admin_role_trigger
  AFTER UPDATE OF is_admin ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_user_admin_role();

-- Create a function to ensure role can only be set for users with auth accounts
CREATE OR REPLACE FUNCTION public.validate_user_role_assignment()
RETURNS TRIGGER AS $$
BEGIN
  -- If trying to set is_admin to true but user_id is null, prevent it
  IF NEW.is_admin = TRUE AND NEW.user_id IS NULL THEN
    RAISE EXCEPTION 'Cannot assign admin role to a user without authentication account';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to validate role assignment
DROP TRIGGER IF EXISTS validate_user_role_trigger ON public.users;
CREATE TRIGGER validate_user_role_trigger
  BEFORE UPDATE OF is_admin ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_user_role_assignment();

SELECT 'User admin role handling updated successfully.' AS status;
