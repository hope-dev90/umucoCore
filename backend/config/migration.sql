-- Migration: Add profile fields to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS interests JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS language VARCHAR(50) DEFAULT 'English (UK)',
ADD COLUMN IF NOT EXISTS avatar VARCHAR(255),
ADD COLUMN IF NOT EXISTS notifications JSONB DEFAULT '{"archiveUpdates": true, "newsletter": true, "eventReminders": true}',
ADD COLUMN IF NOT EXISTS accessibility JSONB DEFAULT '{"fontSize": "medium", "highContrast": false, "reduceMotion": false}',
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS is_anonymous BOOLEAN DEFAULT false;

-- Fix existing role values if any
UPDATE users SET role = 'user' WHERE role = 'client';

-- Make existing admin users anonymous by default
UPDATE users SET is_anonymous = true WHERE role = 'admin';
