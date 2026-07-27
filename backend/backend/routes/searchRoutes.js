import { Router } from 'express';
import jwt from 'jsonwebtoken';
import config from '../config/env.js';
import { authMiddleware } from '../middleware/authMiddleWare.js';

const router = Router();

// Helper to extract user from optional auth
function getOptionalUserId(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  try {
    const decoded = jwt.verify(authHeader.slice(7), config.jwt.secret);
    return decoded.id;
  } catch (_) {
    return null;
  }
}

// ─── GET /api/search ─────────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    res.json({
      query: req.query.q,
      total: 0,
      results: { heritage: [], audio: [], calendar: [] }
    });
  } catch (err) {
    res.status(500).json({ error: 'Search failed' });
  }
});

// ─── GET /api/dashboard ──────────────────────────────────────────────────────
router.get('/dashboard', authMiddleware, async (req, res) => {
  try {
    const user = req.user;
    const quoteOfDay = { text: '"Umuco ni u Rwanda, Rwanda ni twe."', sub: 'Culture is Rwanda, and Rwanda is us.' };

    res.json({
      user: { fullName: user.name, language: user.language, avatar: user.avatar },
      highlight: null,
      upcoming: [],
      activity: [],
      recentlyAdded: [],
      stats: { savedCount: 0, contribCount: 0 },
      quoteOfDay,
      today: new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
    });
  } catch (err) {
    console.error('Dashboard error:', err);
    res.status(500).json({ error: 'Failed to load dashboard' });
  }
});

export default router;
