-- ============================================================
-- SEED / UPSERT heritage_items with coordinates
-- Covers both the English dashboard items and the Kinyarwanda
-- Explore fallback cards so every card has a map pin.
--
-- Run:
--   psql -U <user> -d <dbname> -f backend/config/seed-heritage-locations.sql
-- ============================================================

-- Ensure upsert by title works
CREATE UNIQUE INDEX IF NOT EXISTS idx_heritage_items_title
  ON heritage_items (title);

-- ============================================================
-- 1. PATCH existing English dashboard items with coordinates
-- ============================================================
UPDATE heritage_items SET lat = -1.970,  lng = 30.104  WHERE title = 'Intore Warriors – The Dance of Courage';
UPDATE heritage_items SET lat = -1.628,  lng = 29.511  WHERE title = 'The Sacred Forests of Rwanda';
UPDATE heritage_items SET lat = -2.358,  lng = 29.546  WHERE title = 'The Royal Palace of Nyanza' AND category = 'royal';
UPDATE heritage_items SET lat = -2.358,  lng = 29.546  WHERE title = 'The Royal Palace of Nyanza' AND category = 'general';
UPDATE heritage_items SET lat = -1.9500, lng = 29.9000 WHERE title = 'Imigani – Stories by the Fire';
UPDATE heritage_items SET lat = -1.9500, lng = 29.9000 WHERE title = 'Inanga – The Soul of Rwandan Music';

-- ============================================================
-- 2. UPSERT Kinyarwanda Explore fallback cards
-- ============================================================
INSERT INTO heritage_items
  (title, category, location, lat, lng, description, image_url, era, region, is_active)
VALUES
  -- Nyanza Royal Palace area (-2.358, 29.546)
  ('Ingoro y''Ubwami ya Nyanza',
   'Ubwami', 'Nyanza', -2.358, 29.546,
   'Ingoro y''Ubwami yubatswe bundi bushya, yerekana ubwubatsi, imihango n''ubuzima bwa buri munsi bw''Urukiko rw''Ubwami rw''u Rwanda.',
   NULL, 'pre-colonial', 'South', true),

  ('Ubwiru – Imihango y''Urukiko rw''Ubwami',
   'Imigani', 'Nyanza', -2.358, 29.546,
   'Imihango yera n''ubumenyi bwihishe byayoboraga ubuzima bw''urukiko rw''ubwami, bigezwa gusa ku bantu bemerewe kubimenya.',
   NULL, 'pre-colonial', 'South', true),

  ('Ingoma – Ingoma Zera z''Ubwami',
   'Umuziki', 'Nyanza', -2.358, 29.546,
   'Ingoma zari umutima w''urukiko rw''ubwami, zikoreshwa mu mihango, mu gutangazana makuru no mu birori.',
   NULL, 'pre-colonial', 'South', true),

  -- Intore / Kigali area (-1.970, 30.104)
  ('Intore – Umubyino w''Ubutwari',
   'Ubutwari', 'Nyanza', -1.970, 30.104,
   'Umuco ukomeye wa Intore, umubyino w''abasirikare uzwi cyane mu Rwanda, wavutse ku murwa w''intambara z''ubwami maze ugezwa ku bindi bisekuru.',
   NULL, 'pre-colonial', 'South', true),

  ('Ibyivugo – Ibisigo by''Ubutwari',
   'Imigani', 'Igihugu hose', -1.970, 30.104,
   'Ibisigo byanditswe n''ababivuga ubwabo, bikavugwa n''abasirikare n''abahigi basingiza ubutwari n''ibikorwa byabo bwite.',
   NULL, 'pre-colonial', 'National', true),

  -- Kigali city (-1.9346, 30.0621)
  ('Kigeli IV Rwabugiri – Umwami w''Intwari',
   'Ubwami', 'Kigali', -1.9346, 30.0621,
   'Umwe mu bami b''u Rwanda bakomeye cyane, wagushije ubutaka bw''igihugu binyuze mu ntambara no mu ivugurura ry''ubuyobozi.',
   NULL, 'colonial', 'Kigali', true),

  ('Ingabo – Abarinzi b''Ubwami',
   'Ubutwari', 'Kigali', -1.9346, 30.0621,
   'Abarinzi b''intwari b''ubwami barinzaga Umwami kandi bagacunga umutekano mu gihugu.',
   NULL, 'post-1994', 'Kigali', true),

  -- Central Rwanda / Nationwide (-1.9500, 29.9000)
  ('Inanga – Umutima w''Umuziki Nyarwanda',
   'Umuziki', 'Igihugu hose', -1.9500, 29.9000,
   'Umva inanga, ikembe n''ingoma nk''uko byacurangwaga mu binyejana byinshi mu nkambi z''ubwami no mu materaniro y''imidugudu mu Rwanda hose.',
   NULL, 'pre-colonial', 'National', true),

  ('Imigani – Inkuru zivugwa ku Muriro',
   'Imigani', 'Igihugu hose', -1.9500, 29.9000,
   'Injira mu muco nyarwanda w''imvugo dukesha abakurambere: imigani, inkuru n''ibitekerezo byigishwa ku muriro w''ijoro.',
   NULL, 'pre-colonial', 'National', true),

  ('Imigani – Inkuru zo ku Muriro',
   'Imigani', 'Igihugu hose', -1.9500, 29.9000,
   'Umuco nyarwanda w''imvugo, aho abakuru bateranyaga abana ku muriro kugira ngo babibwire imigani n''inyigisho z''imyitwarire.',
   NULL, 'pre-colonial', 'National', true),

  ('Inzira z''Ubwenge – Ibisakuzo n''Ubuhanga',
   'Imigani', 'Igihugu hose', -1.9500, 29.9000,
   'Ibisakuzo n''imigani gakondo byakoreshwaga mu kwigisha ubuhanga no gutekerezwa neza mu bisekuru.',
   NULL, 'pre-colonial', 'National', true),

  ('Umuvugo – Indirimbo z''Ishimwe',
   'Umuziki', 'Igihugu hose', -1.9500, 29.9000,
   'Indirimbo gakondo zasingizaga abami, intwari n''ibintu bikomeye, zicurangwa kugira ngo babishimire.',
   NULL, 'pre-colonial', 'National', true),

  ('Ubudehe – Ubufatanye bw''Abaturage',
   'Rusange', 'Igihugu hose', -1.9500, 29.9000,
   'Umuco wa kera w''akazi gakorwa hamwe no gufashanya, wagaragaje ubuzima bw''abaturage b''u Rwanda mu binyejana byinshi.',
   NULL, 'colonial', 'National', true),

  ('Inanga – Ikinanga cy''u Rwanda',
   'Umuziki', 'Igihugu hose', -1.9500, 29.9000,
   'Ikirangantego mu bikoresho by''umuziki gakondo by''u Rwanda, inanga icurangwa mu nkambi z''ubwami no mu mihango y''imidugudu.',
   NULL, 'pre-colonial', 'National', true),

  -- Western Rwanda – Agaseke / basket weaving (-2.073, 29.752)
  ('Agaseke – Ibiseke by''Amahoro',
   'Rusange', 'Igihugu hose', -2.073, 29.752,
   'Ibiseke bidukanywe mu buryo bw''ubuhanga, bifite icyerekezo cy''umuco mwinshi, bikoreshwa mu mihango, nk''impano no mu bikoresho bya buri munsi.',
   NULL, 'pre-colonial', 'West', true)

ON CONFLICT (title) DO UPDATE SET
  lat         = EXCLUDED.lat,
  lng         = EXCLUDED.lng,
  location    = EXCLUDED.location,
  description = EXCLUDED.description,
  era         = EXCLUDED.era,
  region      = EXCLUDED.region,
  is_active   = true;
