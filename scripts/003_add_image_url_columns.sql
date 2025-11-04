-- Add image_url column to users table if it doesn't exist
ALTER TABLE users ADD COLUMN IF NOT EXISTS image_url TEXT;

-- The pets table already has image_url from the initial schema
-- This migration is for reference and ensures the column exists
