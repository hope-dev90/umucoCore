import pool from "../config/db.js";

const awardXPInTransaction = async (client, userId, amount, reason) => {
  const userResult = await client.query(
    `UPDATE users SET xp = xp + $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
    [amount, userId]
  );
  const user = userResult.rows[0];

  await client.query(
    `INSERT INTO xp_logs (user_id, amount, reason) VALUES ($1, $2, $3)`,
    [userId, amount, reason]
  );

  const levelsResult = await client.query(`SELECT * FROM levels ORDER BY level ASC`);
  const levels = levelsResult.rows;

  let newLevel = user.level;
  let levelUp = false;

  for (let i = 0; i < levels.length; i++) {
    if (user.xp >= levels[i].required_xp && levels[i].level > user.level) {
      newLevel = levels[i].level;
      levelUp = true;
    }
  }

  if (levelUp) {
    await client.query(
      `UPDATE users SET level = $1, updated_at = NOW() WHERE id = $2`,
      [newLevel, userId]
    );
  }

  const newBadges = await checkAndAwardBadges(
    client,
    userId,
    user.xp,
    newLevel,
    user.current_streak || 0
  );

  return { user: { ...user, level: newLevel }, levelUp, amount, newBadges };
};

// XP Engine
export const awardXP = async (userId, amount, reason) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const result = await awardXPInTransaction(client, userId, amount, reason);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

/**
 * Checks all auto-trigger badges and awards any the user qualifies for
 * but hasn't received yet. Returns array of newly awarded badge objects.
 */
async function checkAndAwardBadges(client, userId, userXP, userLevel, userStreak) {
  // Get all badges with trigger rules the user doesn't have yet
  const result = await client.query(
    `SELECT b.* FROM badges b
     WHERE b.trigger_type IS NOT NULL
       AND b.trigger_value IS NOT NULL
       AND NOT EXISTS (
         SELECT 1 FROM user_badges ub
         WHERE ub.user_id = $1 AND ub.badge_id = b.id
       )`,
    [userId]
  );

  const earned = [];
  for (const badge of result.rows) {
    let qualifies = false;
    if (badge.trigger_type === 'xp_milestone' && userXP >= badge.trigger_value) qualifies = true;
    if (badge.trigger_type === 'level'        && userLevel >= badge.trigger_value) qualifies = true;
    if (badge.trigger_type === 'streak'       && userStreak >= badge.trigger_value) qualifies = true;

    if (qualifies) {
      await client.query(
        `INSERT INTO user_badges (user_id, badge_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
        [userId, badge.id]
      );
      // Award bonus XP for the badge (without triggering another badge check)
      if (badge.xp_reward > 0) {
        await client.query(
          `UPDATE users SET xp = xp + $1, updated_at = NOW() WHERE id = $2`,
          [badge.xp_reward, userId]
        );
        await client.query(
          `INSERT INTO xp_logs (user_id, amount, reason) VALUES ($1, $2, $3)`,
          [userId, badge.xp_reward, `Badge unlocked: ${badge.name}`]
        );
      }
      earned.push(badge);
    }
  }
  return earned;
}

/** Streak-only badge check used after daily login */
async function checkAndAwardBadgesForStreak(client, userId, currentStreak) {
  const result = await client.query(
    `SELECT b.* FROM badges b
     WHERE b.trigger_type = 'streak'
       AND b.trigger_value <= $1
       AND NOT EXISTS (
         SELECT 1 FROM user_badges ub
         WHERE ub.user_id = $2 AND ub.badge_id = b.id
       )`,
    [currentStreak, userId]
  );
  for (const badge of result.rows) {
    await client.query(
      `INSERT INTO user_badges (user_id, badge_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
      [userId, badge.id]
    );
    if (badge.xp_reward > 0) {
      await client.query(
        `UPDATE users SET xp = xp + $1, updated_at = NOW() WHERE id = $2`,
        [badge.xp_reward, userId]
      );
      await client.query(
        `INSERT INTO xp_logs (user_id, amount, reason) VALUES ($1, $2, $3)`,
        [userId, badge.xp_reward, `Streak badge: ${badge.name}`]
      );
    }
  }
}

export const getUserXP = async (userId) => {
  const result = await pool.query(
    `SELECT u.xp, u.level, l.name as level_name, l.required_xp, 
     (SELECT required_xp FROM levels WHERE level = u.level + 1) as next_level_xp
     FROM users u JOIN levels l ON u.level = l.level
     WHERE u.id = $1`,
    [userId]
  );
  return result.rows[0];
};

export const getXPLogs = async (userId) => {
  const result = await pool.query(
    `SELECT * FROM xp_logs WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50`,
    [userId]
  );
  return result.rows;
};

// Daily Login & Streaks
export const recordDailyLogin = async (userId) => {
  const today = new Date().toISOString().split("T")[0];
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Check if already logged in today
    const existingResult = await client.query(
      `SELECT * FROM daily_streaks WHERE user_id = $1 AND login_date = $2`,
      [userId, today]
    );

    if (existingResult.rows.length > 0) {
      await client.query("COMMIT");
      return { streakAwarded: false };
    }

    // Insert today's login
    await client.query(
      `INSERT INTO daily_streaks (user_id, login_date) VALUES ($1, $2)`,
      [userId, today]
    );

    // Calculate streak
    const streakResult = await client.query(
      `WITH consecutive_dates AS (
        SELECT login_date, 
               login_date - ROW_NUMBER() OVER (ORDER BY login_date)::integer AS group_id
        FROM daily_streaks
        WHERE user_id = $1
      )
      SELECT COUNT(*) AS current_streak
      FROM consecutive_dates
      WHERE group_id = (
        SELECT group_id 
        FROM consecutive_dates 
        ORDER BY login_date DESC 
        LIMIT 1
      )`,
      [userId]
    );

    const currentStreak = parseInt(streakResult.rows[0].current_streak);

    // Update user
    await client.query(
      `UPDATE users 
       SET current_streak = $1, 
           best_streak = GREATEST(best_streak, $1), 
           total_days = total_days + 1,
           last_login_date = $2,
           updated_at = NOW()
       WHERE id = $3`,
      [currentStreak, today, userId]
    );

    // Award daily login XP (25 XP) — this also runs badge checks via awardXP
    await awardXPInTransaction(client, userId, 25, "Daily login");

    // Extra streak-specific badge check (streak value may not be reflected yet in awardXP)
    await checkAndAwardBadgesForStreak(client, userId, currentStreak);

    await client.query("COMMIT");
    return { streakAwarded: true, currentStreak };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

// Badges
export const getAllBadges = async () => {
  const result = await pool.query(`SELECT * FROM badges ORDER BY rarity ASC`);
  return result.rows;
};

export const getUserBadges = async (userId) => {
  const result = await pool.query(
    `SELECT b.*, ub.unlocked_at, ub.unlocked_at AS "unlockedAt"
     FROM badges b LEFT JOIN user_badges ub ON b.id = ub.badge_id AND ub.user_id = $1
     ORDER BY b.rarity ASC`,
    [userId]
  );
  return result.rows;
};

export const awardBadge = async (userId, badgeId) => {
  const result = await pool.query(
    `INSERT INTO user_badges (user_id, badge_id) 
     VALUES ($1, $2) 
     ON CONFLICT DO NOTHING 
     RETURNING *`,
    [userId, badgeId]
  );
  if (result.rows.length > 0) {
    const badgeResult = await pool.query(`SELECT * FROM badges WHERE id = $1`, [badgeId]);
    if (badgeResult.rows[0].xp_reward > 0) {
      await awardXP(userId, badgeResult.rows[0].xp_reward, `Badge: ${badgeResult.rows[0].name}`);
    }
  }
  return result.rows[0];
};

// Collectibles
export const getAllCollectibles = async () => {
  const result = await pool.query(`SELECT * FROM collectibles ORDER BY rarity ASC`);
  return result.rows;
};

export const getUserCollectibles = async (userId) => {
  const result = await pool.query(
    `SELECT c.*, uc.obtained_at, uc.obtained_at AS "obtainedAt"
     FROM collectibles c LEFT JOIN user_collectibles uc ON c.id = uc.collectible_id AND uc.user_id = $1
     ORDER BY c.rarity ASC`,
    [userId]
  );
  return result.rows;
};

export const awardCollectible = async (userId, collectibleId) => {
  const result = await pool.query(
    `INSERT INTO user_collectibles (user_id, collectible_id) 
     VALUES ($1, $2) 
     ON CONFLICT DO NOTHING 
     RETURNING *`,
    [userId, collectibleId]
  );
  return result.rows[0];
};

// Notifications
export const createNotification = async (userId, type, title, message) => {
  const result = await pool.query(
    `INSERT INTO notifications (user_id, type, title, message) 
     VALUES ($1, $2, $3, $4) 
     RETURNING *`,
    [userId, type, title, message]
  );
  return result.rows[0];
};

export const getUserNotifications = async (userId) => {
  const result = await pool.query(
    `SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT 20`,
    [userId]
  );
  return result.rows;
};

// Leaderboards
export const getLeaderboard = async (limit = 10) => {
  const result = await pool.query(
    `SELECT u.id, u.name, u.avatar, u.xp, u.level, u.current_streak 
     FROM users u 
     ORDER BY u.xp DESC 
     LIMIT $1`,
    [limit]
  );
  return result.rows;
};

// Levels
export const getAllLevels = async () => {
  const result = await pool.query(`SELECT * FROM levels ORDER BY level ASC`);
  return result.rows;
};

// ── Activity Tracking ──────────────────────────────────────────────────────

/** Maps frontend activityType → badge trigger_type column value */
const ACTIVITY_TRIGGER_MAP = {
  riddle:  'riddles_solved',
  story:   'stories_read',
  proverb: 'proverbs_read',
  video:   'videos_watched',
  map:     'map_locations_visited',
};

/** XP to award per activity type + metadata */
function resolveXP(activityType, metadata = {}) {
  switch (activityType) {
    case 'riddle':
      if (metadata.correct)  return { xp: 10, reason: 'Riddle: correct answer' };
      if (metadata.revealed) return { xp: metadata.correct === false ? 5 : 3, reason: 'Riddle: revealed answer' };
      return { xp: 3, reason: 'Riddle: viewed' };
    case 'story':
      return metadata.complete
        ? { xp: 20, reason: 'Story completed' }
        : { xp: 15, reason: 'Story opened' };
    case 'proverb':
      return { xp: 5, reason: 'Proverb revealed' };
    case 'video':
      return metadata.complete
        ? { xp: 20, reason: 'Video completed' }
        : { xp: 10, reason: 'Video watched (partial)' };
    case 'map':
      return { xp: 8, reason: 'Map location discovered' };
    default:
      return { xp: 5, reason: `Activity: ${activityType}` };
  }
}

/**
 * Checks activity-based badges for the given trigger type and count.
 * Awards any unearned badges where trigger_value <= count.
 */
async function checkActivityBadges(client, userId, activityType, count) {
  const triggerType = ACTIVITY_TRIGGER_MAP[activityType];
  if (!triggerType) return [];

  const result = await client.query(
    `SELECT b.* FROM badges b
     WHERE b.trigger_type = $1
       AND b.trigger_value <= $2
       AND NOT EXISTS (
         SELECT 1 FROM user_badges ub
         WHERE ub.user_id = $3 AND ub.badge_id = b.id
       )`,
    [triggerType, count, userId]
  );

  const earned = [];
  for (const badge of result.rows) {
    await client.query(
      `INSERT INTO user_badges (user_id, badge_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
      [userId, badge.id]
    );
    if (badge.xp_reward > 0) {
      await client.query(
        `UPDATE users SET xp = xp + $1, updated_at = NOW() WHERE id = $2`,
        [badge.xp_reward, userId]
      );
      await client.query(
        `INSERT INTO xp_logs (user_id, amount, reason) VALUES ($1, $2, $3)`,
        [userId, badge.xp_reward, `Badge unlocked: ${badge.name}`]
      );
    }
    earned.push(badge);
  }
  return earned;
}

/**
 * Records a user activity, awards XP (deduplicated), and checks badge triggers.
 */
export const trackActivity = async (userId, activityType, itemId, metadata = {}) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Try to insert the activity log (UNIQUE constraint deduplicates)
    const logResult = await client.query(
      `INSERT INTO user_activity_log (user_id, activity_type, item_id)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id, activity_type, item_id) DO NOTHING
       RETURNING id`,
      [userId, activityType, String(itemId)]
    );

    if (logResult.rows.length === 0) {
      await client.query('COMMIT');
      return { alreadyTracked: true, xpAwarded: 0, newBadges: [] };
    }

    // 2. Increment the activity count
    const countResult = await client.query(
      `INSERT INTO user_activity_counts (user_id, activity_type, count)
       VALUES ($1, $2, 1)
       ON CONFLICT (user_id, activity_type)
       DO UPDATE SET count = user_activity_counts.count + 1
       RETURNING count`,
      [userId, activityType]
    );
    const newCount = parseInt(countResult.rows[0].count);

    // 3. Award XP
    const { xp, reason } = resolveXP(activityType, metadata);
    await awardXPInTransaction(client, userId, xp, reason);

    // 4. Check activity-based badge triggers
    const newBadges = await checkActivityBadges(client, userId, activityType, newCount);

    await client.query('COMMIT');
    return {
      alreadyTracked: false,
      xpAwarded: xp,
      newBadges,
      activityCounts: { [ACTIVITY_TRIGGER_MAP[activityType] || activityType]: newCount },
    };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};
