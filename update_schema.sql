-- Run this in your Supabase SQL Editor to fix the missing column error

ALTER TABLE templates ADD COLUMN IF NOT EXISTS is_default boolean DEFAULT false;
