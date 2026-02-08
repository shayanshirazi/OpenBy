-- Add OpenBy Index column to products (0-100, cached score)
ALTER TABLE products
ADD COLUMN IF NOT EXISTS openby_index INTEGER;
