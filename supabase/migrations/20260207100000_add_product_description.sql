-- Add AI-generated description column to products
ALTER TABLE products
ADD COLUMN IF NOT EXISTS description TEXT;
