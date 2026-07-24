import { Router } from 'express';
import { authMiddleware } from '../middleware/authMiddleWare.js';
import pool from '../config/db.js';

const router = Router();

// Ensure view_history table exists on startup
const ensureTable = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS view_history (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      item_type VARCHAR(50) NOT NULL,
      item_id VARCHAR(255),
      title VARCHAR(500) NOT NULL,
      image VARCHAR(1000),
      category VARCHAR(255),
      location VARCHAR(255),
      viewed_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);
  await pool.query(
    `CREATE INDEX IF NOT EXISTS idx_view_history_user ON view_history(user_id, viewed_at DESC)`
  );
};

ensureTable().catch(console.error);

// ─── GET /api/history ────────────────────────────────────────────────────────
router.get('/', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 100 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const result = await pool.query(
      `SELECT id, item_type, item_id, title, image, category, location, viewed_at
       FROM view_history
       WHERE user_id = $1
       ORDER BY viewed_at DESC
       LIMIT $2 OFFSET $3`,
      [userId, parseInt(limit), offset]
    );

    const countResult = await pool.query(
      `SELECT COUNT(*) FROM view_history WHERE user_id = $1`,
      [userId]
    );
    const total = parseInt(countResult.rows[0].count);

    res.json({
      items: result.rows.map(r => ({
        id: r.id,
        type: r.item_type,
        itemId: r.item_id,
        title: r.title,
        image: r.image || '',
        category: r.category || '',
        location: r.location || '',
        viewedAt: r.viewed_at,
      })),
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
    });
  } catch (err) {
    console.error('History fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

// ─── GET /api/history/stats ──────────────────────────────────────────────────
router.get('/stats', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await pool.query(
      `SELECT
        COUNT(*) as items_viewed,
        COUNT(*) FILTER (WHERE item_type = 'Audio') as audio_sessions,
        COUNT(*) FILTER (WHERE item_type IN ('Article', 'Place')) as articles_read
       FROM view_history WHERE user_id = $1`,
      [userId]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// ─── POST /api/history ───────────────────────────────────────────────────────
router.post('/', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { itemType, itemId, title, image, category, location } = req.body;

    if (!title || !itemType) {
      return res.status(400).json({ error: 'title and itemType are required' });
    }

    const result = await pool.query(
      `INSERT INTO view_history (user_id, item_type, item_id, title, image, category, location)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, viewed_at`,
      [userId, itemType, itemId || null, title, image || null, category || null, location || null]
    );

    res.json({ success: true, id: result.rows[0].id, viewedAt: result.rows[0].viewed_at });
  } catch (err) {
    console.error('Track view error:', err);
    res.status(500).json({ error: 'Failed to track view' });
  }
});

// ─── DELETE /api/history ─────────────────────────────────────────────────────
router.delete('/', authMiddleware, async (req, res) => {
  try {
    await pool.query(`DELETE FROM view_history WHERE user_id = $1`, [req.user.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to clear history' });
  }
});

// ─── DELETE /api/history/:entryId ────────────────────────────────────────────
router.delete('/:entryId', authMiddleware, async (req, res) => {
  try {
    await pool.query(
      `DELETE FROM view_history WHERE id = $1 AND user_id = $2`,
      [req.params.entryId, req.user.id]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to remove history item' });
  }
});

export default router;
