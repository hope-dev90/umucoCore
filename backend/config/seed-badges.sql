-- ============================================================
-- BADGES SEED + TRIGGER COLUMNS MIGRATION
-- Run this once to set up auto-awarded badges.
-- ============================================================

-- Add trigger columns if they don't exist
ALTER TABLE badges ADD COLUMN IF NOT EXISTS trigger_type  VARCHAR(50);
ALTER TABLE badges ADD COLUMN IF NOT EXISTS trigger_value INTEGER;

-- Seed badges
INSERT INTO badges (name, description, icon, rarity, xp_reward, trigger_type, trigger_value) VALUES

  -- XP milestones
  ('First Steps',        'Earn your first 50 XP',               '🌱', 'common',    10,  'xp_milestone', 50),
  ('Explorer',           'Reach 200 XP',                        '🧭', 'common',    15,  'xp_milestone', 200),
  ('Heritage Seeker',    'Reach 500 XP',                        '📜', 'uncommon',  25,  'xp_milestone', 500),
  ('Story Keeper',       'Reach 1000 XP',                       '📚', 'uncommon',  50,  'xp_milestone', 1000),
  ('Lore Master',        'Reach 2500 XP',                       '🏺', 'rare',      75,  'xp_milestone', 2500),
  ('Legend of Rwanda',   'Reach 5000 XP',                       '👑', 'epic',     100,  'xp_milestone', 5000),
  ('Immortal Flame',     'Reach 10000 XP',                      '🔥', 'legendary', 200, 'xp_milestone', 10000),

  -- Streak milestones
  ('Consistent Learner', 'Log in 3 days in a row',              '📅', 'common',    20,  'streak',       3),
  ('Weekly Warrior',     'Maintain a 7-day streak',             '⚔️', 'uncommon',  40,  'streak',       7),
  ('Fortnight Explorer', 'Maintain a 14-day streak',            '🌟', 'rare',      60,  'streak',       14),
  ('Monthly Champion',   'Maintain a 30-day streak',            '🏆', 'epic',     150,  'streak',       30),

  -- Level milestones
  ('Rising Star',        'Reach Level 3',                       '⭐', 'common',    20,  'level',        3),
  ('Seasoned Explorer',  'Reach Level 5',                       '🗺️', 'uncommon',  50,  'level',        5),
  ('Elite Scholar',      'Reach Level 10',                      '🎓', 'rare',     100,  'level',        10)

ON CONFLICT (name) DO NOTHING;

-- ============================================================
-- ACTIVITY-BASED BADGES (riddles, stories, proverbs, map, video)
-- ============================================================
INSERT INTO badges (name, description, icon, rarity, xp_reward, trigger_type, trigger_value) VALUES
  ('Riddle Novice',    'Solve 5 riddles',             '🧩', 'common',    20,  'riddles_solved',        5),
  ('Riddle Master',    'Solve 25 riddles',            '🎯', 'uncommon',  50,  'riddles_solved',        25),
  ('Story Enthusiast', 'Read 10 heritage stories',    '📖', 'common',    30,  'stories_read',          10),
  ('Heritage Scholar', 'Read 30 heritage stories',    '🏛', 'rare',      75,  'stories_read',          30),
  ('Proverb Reader',   'Reveal 20 proverbs',          '💬', 'common',    30,  'proverbs_read',         20),
  ('Wisdom Keeper',    'Reveal 50 proverbs',          '🦉', 'rare',      80,  'proverbs_read',         50),
  ('Map Explorer',     'Discover 5 map locations',    '🗺', 'common',    25,  'map_locations_visited', 5),
  ('Navigator',        'Discover 15 map locations',   '🧭', 'uncommon',  60,  'map_locations_visited', 15),
  ('Cinema Goer',      'Watch 3 videos',              '🎬', 'common',    20,  'videos_watched',        3),
  ('Film Buff',        'Watch 10 videos',             '🎥', 'uncommon',  50,  'videos_watched',        10)
ON CONFLICT (name) DO NOTHING;
