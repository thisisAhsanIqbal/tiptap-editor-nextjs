-- ============================================
-- Add Categories System for Posts
-- ============================================
-- Run this in Supabase SQL Editor to add categories functionality
-- ============================================

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create junction table for many-to-many relationship
CREATE TABLE IF NOT EXISTS post_categories (
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, category_id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_post_categories_post_id ON post_categories(post_id);
CREATE INDEX IF NOT EXISTS idx_post_categories_category_id ON post_categories(category_id);

-- Create function to automatically update updated_at timestamp for categories
CREATE OR REPLACE FUNCTION update_categories_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at on category update
DROP TRIGGER IF EXISTS update_categories_updated_at ON categories;
CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON categories
  FOR EACH ROW
  EXECUTE FUNCTION update_categories_updated_at();

-- Enable Row Level Security (RLS) for categories
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_categories ENABLE ROW LEVEL SECURITY;

-- Create permissive policies for development/testing
-- ⚠️ WARNING: This allows anyone to read/write categories
-- Only use this for development/testing, NOT for production!

-- Allow anyone to read all categories
CREATE POLICY "Allow public reads on categories"
  ON categories FOR SELECT
  USING (true);

-- Allow anyone to insert categories
CREATE POLICY "Allow public inserts on categories"
  ON categories FOR INSERT
  WITH CHECK (true);

-- Allow anyone to update categories
CREATE POLICY "Allow public updates on categories"
  ON categories FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Allow anyone to delete categories
CREATE POLICY "Allow public deletes on categories"
  ON categories FOR DELETE
  USING (true);

-- Allow anyone to read post_categories
CREATE POLICY "Allow public reads on post_categories"
  ON post_categories FOR SELECT
  USING (true);

-- Allow anyone to insert post_categories
CREATE POLICY "Allow public inserts on post_categories"
  ON post_categories FOR INSERT
  WITH CHECK (true);

-- Allow anyone to update post_categories
CREATE POLICY "Allow public updates on post_categories"
  ON post_categories FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Allow anyone to delete post_categories
CREATE POLICY "Allow public deletes on post_categories"
  ON post_categories FOR DELETE
  USING (true);

-- Insert some default categories (optional)
INSERT INTO categories (name, slug, description) VALUES
  ('Technology', 'technology', 'Posts about technology and innovation'),
  ('Design', 'design', 'Posts about design and creativity'),
  ('Business', 'business', 'Posts about business and entrepreneurship'),
  ('Lifestyle', 'lifestyle', 'Posts about lifestyle and personal development'),
  ('Tutorials', 'tutorials', 'Tutorial and how-to posts')
ON CONFLICT (slug) DO NOTHING;

-- Verify tables were created
SELECT 
  table_name,
  column_name,
  data_type
FROM information_schema.columns
WHERE table_name IN ('categories', 'post_categories')
ORDER BY table_name, ordinal_position;
