-- ============================================
-- Add Meta Title and Meta Description Fields
-- ============================================
-- Run this in Supabase SQL Editor to add meta fields to posts table
-- ============================================

-- Add meta_title column
ALTER TABLE posts 
ADD COLUMN IF NOT EXISTS meta_title TEXT;

-- Add meta_description column
ALTER TABLE posts 
ADD COLUMN IF NOT EXISTS meta_description TEXT;

-- Add comments for documentation
COMMENT ON COLUMN posts.meta_title IS 'SEO meta title for the post';
COMMENT ON COLUMN posts.meta_description IS 'SEO meta description for the post';

-- Verify columns were added
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'posts' 
  AND column_name IN ('meta_title', 'meta_description');
