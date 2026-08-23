-- Fix infinite recursion on users table
-- Run this in Supabase Dashboard → SQL Editor → New Query → Paste → Run

-- Drop the recursive admin policy on users
DROP POLICY IF EXISTS "Admins can manage all users" ON users;

-- Recreate without recursion: use JWT claim instead of querying users table
-- The role is stored in auth.jwt() -> 'user_metadata' -> 'role'
CREATE POLICY "Admins can manage all users"
    ON users FOR ALL
    TO authenticated
    USING (
        (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
        OR
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()
            AND (auth.users.raw_user_meta_data ->> 'role') = 'admin'
        )
    );

-- Also fix student_profiles and alumni_profiles admin policies to avoid querying users with RLS
DROP POLICY IF EXISTS "Admins can manage all student profiles" ON student_profiles;
CREATE POLICY "Admins can manage all student profiles"
    ON student_profiles FOR ALL
    TO authenticated
    USING (
        (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
    );

DROP POLICY IF EXISTS "Admins can manage all alumni profiles" ON alumni_profiles;
CREATE POLICY "Admins can manage all alumni profiles"
    ON alumni_profiles FOR ALL
    TO authenticated
    USING (
        (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
    );
