-- Seed valid Rwanda audio content
-- Run this script to populate the audio_content table with real, valid entries

-- First, clear existing invalid audio data (optional - comment out if you want to keep existing data)
-- DELETE FROM audio_content;

-- Insert 4 featured story entries
INSERT INTO audio_content (title, description, audio_url, thumbnail_url, duration, category, is_featured, created_at)
VALUES
(
  'Gihanga Ngomijana',
  'The founder-king said to have descended from the sky, and the fire he lit that was meant to never go out. The story of how Rwanda became a kingdom.',
  '',
  '/images/collections/royal-court.jpg',
  480,
  'Founding History',
  true,
  NOW()
),
(
  'Nyirarucyaba',
  'Gihanga''s daughter, and the woman said to have brought the first cattle to the Kingdom of Rwanda. A story of curiosity, generosity, and the origins of Rwanda''s most treasured tradition.',
  '',
  '/images/collections/royal-court.jpg',
  360,
  'Founding History',
  true,
  NOW()
),
(
  'King Ruganzu II Ndoli',
  'The exiled prince who crossed the Nyabarongo and returned to reclaim a kingdom that had almost forgotten him. A tale of courage, patience, and the power of returning home.',
  '',
  '/images/listen/ruganzu.png',
  420,
  'Royal History',
  true,
  NOW()
),
(
  'Kigeli IV Rwabugiri',
  'The last great warrior king of Rwanda, whose conquests carried the kingdom to the largest borders it would ever hold. A story of expansion, reform, and the complex legacy of a nation-builder.',
  '',
  '/images/home/kigeli.jpg',
  540,
  'Royal History',
  true,
  NOW()
);

-- Verify the insert
SELECT id, title, category, duration, is_featured FROM audio_content ORDER BY id;
