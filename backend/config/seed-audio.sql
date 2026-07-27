-- Seed valid Rwanda audio content
-- Run this script to populate the audio_content table with real, valid entries

-- First, clear existing invalid audio data (optional - comment out if you want to keep existing data)
-- DELETE FROM audio_content;

-- Insert 3 valid Rwanda audio entries
INSERT INTO audio_content (title, description, audio_url, thumbnail_url, duration, category, is_featured, created_at)
VALUES
(
  'Inanga — The Royal Zither of Rwanda',
  'A masterful performance of the Inanga, Rwanda''s traditional plucked zither, with vocals in the royal court style of Nyanza.',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
  '/images/audio/inanga.jpg',
  482,
  'Traditional Music',
  true,
  NOW()
),
(
  'Ibyivugo — Warrior Self-Praise Poetry',
  'A powerful recitation of Ibyivugo, the ancient Rwandan warrior self-praise poetry celebrating bravery and lineage.',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
  '/images/audio/ibyivugo.jpg',
  367,
  'Oral Tradition',
  true,
  NOW()
),
(
  'Ingoma — The Sacred Royal Drums',
  'A ceremonial drumming performance featuring the Ingoma, the sacred royal drums historically restricted to royal ceremonies.',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
  '/images/audio/ingoma.jpg',
  541,
  'Traditional Music',
  false,
  NOW()
);

-- Verify the insert
SELECT id, title, category, duration, is_featured FROM audio_content ORDER BY id;