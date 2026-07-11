-- ============================================================
-- DASHBOARD SEED DATA
-- Only the highlight card changes per explorer type.
-- All other dashboard content (explore cards, recent items,
-- topics) stays as the original hardcoded data in Home.jsx.
--
-- Explorer type → category mapping:
--   warrior         → 'warrior'
--   nature-lover    → 'nature'
--   royal-historian → 'royal'
--   folktale-hunter → 'folklore'
--   music-explorer  → 'music'
--   (no type)       → 'general'
-- ============================================================

-- ============================================================
-- HERITAGE ITEMS (used for the highlight card)
-- One featured item per adventure type + general fallback.
-- Images use files already in frontend/public/images/heritage/
-- ============================================================
INSERT INTO heritage_items (title, category, location, description, image_url, era, region, is_active) VALUES

  -- WARRIOR: Intore dance → intore.jpg
  ('Intore Warriors – The Dance of Courage',
   'warrior', 'Nyanza',
   'Discover the fierce tradition of Intore, Rwanda''s celebrated warrior dance born on royal battlefields and passed down through generations of brave men.',
   '/images/heritage/intore.jpg', 'Pre-colonial', 'Southern', true),

  -- NATURE: Sacred forests → buhanga.jpg
  ('The Sacred Forests of Rwanda',
   'nature', 'Gishwati',
   'Explore Rwanda''s ancient hills, sacred groves and the deep spiritual connection between the Rwandan people and their land.',
   '/images/heritage/buhanga.jpg', 'Ancient', 'Western', true),

  -- ROYAL: Royal Palace → nyanza.jpg
  ('The Royal Palace of Nyanza',
   'royal', 'Nyanza',
   'Step inside the reconstructed royal court and uncover the dynasties, ceremonies and daily life that shaped Rwanda for centuries.',
   '/images/heritage/nyanza.jpg', 'Pre-colonial', 'Southern', true),

  -- FOLKLORE: Storytelling tradition → tradi.jpg
  ('Imigani – Stories by the Fire',
   'folklore', 'Nationwide',
   'Dive into Rwanda''s rich oral tradition: proverbs, fables and fireside tales passed down for generations around the evening fire.',
   '/images/heritage/tradi.jpg', 'Ancient', 'Nationwide', true),

  -- MUSIC: Inanga instrument → inanga.jpg
  ('Inanga – The Soul of Rwandan Music',
   'music', 'Nationwide',
   'Hear the inanga, ikembe and ingoma as they have been played for centuries in royal courts and village gatherings across Rwanda.',
   '/images/heritage/inanga.jpg', 'Pre-colonial', 'Nationwide', true),

  -- GENERAL: Royal Palace fallback → nyanza.jpg
  ('The Royal Palace of Nyanza',
   'general', 'Nyanza',
   'Explore centuries of Rwandan royal history at the reconstructed palace of the Mwami in Nyanza.',
   '/images/heritage/nyanza.jpg', 'Pre-colonial', 'Southern', true)

ON CONFLICT DO NOTHING;
