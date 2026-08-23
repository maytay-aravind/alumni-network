-- Run this in Supabase Dashboard → SQL Editor → New Query → Paste → Run
-- Fixes: 1) missing INSERT policy for users, 2) auto-create public.users from auth.users

-- 1. Allow authenticated users to insert their own public.users row
DROP POLICY IF EXISTS "Users can insert own profile" ON users;
CREATE POLICY "Users can insert own profile"
    ON users FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = id);

-- 2. Trigger to auto-create public.users when auth user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, role, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'student'),
    COALESCE(
      TRIM(COALESCE(NEW.raw_user_meta_data->>'first_name','') || ' ' || COALESCE(NEW.raw_user_meta_data->>'last_name','')),
      COALESCE(NEW.raw_user_meta_data->>'full_name','')
    )
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. Backfill any existing auth users that don't have public.users rows
INSERT INTO public.users (id, email, role, full_name)
SELECT id, email,
  COALESCE((raw_user_meta_data->>'role')::user_role, 'student'),
  COALESCE(TRIM(COALESCE(raw_user_meta_data->>'first_name','') || ' ' || COALESCE(raw_user_meta_data->>'last_name','')), '')
FROM auth.users
ON CONFLICT (id) DO NOTHING;
