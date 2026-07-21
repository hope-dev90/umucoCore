-- Activity Tracking Migration
-- Run once to enable real badge earning based on user activity.

CREATE TABLE IF NOT EXISTS user_activity_log (
  id            SERIAL PRIMARY KEY,
  user_id       INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  activity_type VARCHAR(50) NOT NULL,
  item_id       VARCHAR(255) NOT NULL,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, activity_type, item_id)
);

CREATE TABLE IF NOT EXISTS user_activity_counts (
  user_id       INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  activity_type VARCHAR(50) NOT NULL,
  count         INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY(user_id, activity_type)
);
