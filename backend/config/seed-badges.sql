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
