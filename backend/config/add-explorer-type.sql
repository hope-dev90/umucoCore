-- Migration: Add explorer_type column to users table
ALTER TABLE users
ADD COLUMN IF NOT EXISTS explorer_type VARCHAR(50);
