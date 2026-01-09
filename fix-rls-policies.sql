-- ============================================
-- Quick Fix: Allow Public Access to Posts Table
-- ============================================
-- Run this in Supabase SQL Editor to fix RLS policy errors
-- ============================================

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Anyone can read published posts" ON posts;
DROP POLICY IF EXISTS "Users can read their own posts" ON posts;
DROP POLICY IF EXISTS "Users can insert their own posts" ON posts;
DROP POLICY IF EXISTS "Users can update their own posts" ON posts;
DROP POLICY IF EXISTS "Users can delete their own posts" ON posts;

-- Create permissive policies for development/testing
-- ⚠️ WARNING: This allows anyone to read/write/delete posts
-- Only use this for development/testing, NOT for production!

-- Allow anyone to read all posts
CREATE POLICY "Allow public reads"
  ON posts FOR SELECT
  USING (true);

-- Allow anyone to insert posts
CREATE POLICY "Allow public inserts"
  ON posts FOR INSERT
  WITH CHECK (true);

-- Allow anyone to update posts
CREATE POLICY "Allow public updates"
  ON posts FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Allow anyone to delete posts
CREATE POLICY "Allow public deletes"
  ON posts FOR DELETE
  USING (true);

-- ============================================
-- Alternative: Single Policy (Simpler)
-- ============================================
-- If you prefer, you can use this single policy instead:
-- CREATE POLICY "Allow all operations" ON posts FOR ALL USING (true) WITH CHECK (true);
-- ============================================

-- Verify policies were created
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'posts';
