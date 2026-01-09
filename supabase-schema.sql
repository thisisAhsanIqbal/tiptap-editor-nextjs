-- ============================================
-- Supabase Posts Table Schema
-- ============================================
-- Copy and paste this entire script into Supabase SQL Editor
-- ============================================

-- Create the posts table
CREATE TABLE IF NOT EXISTS posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  html TEXT NOT NULL,
  json JSONB NOT NULL,
  cover TEXT,
  author TEXT NOT NULL,
  reading_time INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  published BOOLEAN DEFAULT FALSE,
  slug TEXT UNIQUE,
  excerpt TEXT,
  tags TEXT[]
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_user_id ON posts(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_slug ON posts(slug);
CREATE INDEX IF NOT EXISTS idx_posts_published ON posts(published) WHERE published = true;

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at on row update
DROP TRIGGER IF EXISTS update_posts_updated_at ON posts;
CREATE TRIGGER update_posts_updated_at
  BEFORE UPDATE ON posts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- ============================================
-- Row Level Security Policies
-- ============================================

-- Drop existing policies if they exist (for re-running the script)
DROP POLICY IF EXISTS "Anyone can read published posts" ON posts;
DROP POLICY IF EXISTS "Users can read their own posts" ON posts;
DROP POLICY IF EXISTS "Users can insert their own posts" ON posts;
DROP POLICY IF EXISTS "Users can update their own posts" ON posts;
DROP POLICY IF EXISTS "Users can delete their own posts" ON posts;

-- Policy: Anyone can read published posts
CREATE POLICY "Anyone can read published posts"
  ON posts FOR SELECT
  USING (published = true);

-- Policy: Authenticated users can read their own posts
CREATE POLICY "Users can read their own posts"
  ON posts FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Authenticated users can insert their own posts
CREATE POLICY "Users can insert their own posts"
  ON posts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own posts
CREATE POLICY "Users can update their own posts"
  ON posts FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own posts
CREATE POLICY "Users can delete their own posts"
  ON posts FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- Alternative: Simple Schema (No Authentication)
-- ============================================
-- If you don't need user authentication, uncomment the section below
-- and comment out the user_id related parts above
-- ============================================

/*
-- Simple posts table without user_id
CREATE TABLE IF NOT EXISTS posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  html TEXT NOT NULL,
  json JSONB NOT NULL,
  cover TEXT,
  author TEXT NOT NULL,
  reading_time INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_posts_updated_at
  BEFORE UPDATE ON posts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Disable RLS for public access (NOT recommended for production)
-- ALTER TABLE posts DISABLE ROW LEVEL SECURITY;

-- Or create a simple policy that allows all operations
-- ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Allow all operations" ON posts FOR ALL USING (true) WITH CHECK (true);
*/

-- ============================================
-- Verification Query
-- ============================================
-- Run this after creating the table to verify it was created correctly
-- SELECT column_name, data_type, is_nullable 
-- FROM information_schema.columns 
-- WHERE table_name = 'posts' 
-- ORDER BY ordinal_position;
-- ============================================
