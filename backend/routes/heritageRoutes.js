import { Router } from 'express';
import jwt from 'jsonwebtoken';
import config from '../config/env.js';

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

// ─── GET /api/heritage ───────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    res.json({ items: [], total: 0, page: 1, pages: 0 });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch heritage items' });
  }
});

// ─── GET /api/heritage/:id ───────────────────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    res.status(404).json({ error: 'Heritage item not found' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch heritage item' });
  }
});

// ─── GET /api/heritage/search/advanced ───────────────────────────────────────
router.get('/search/advanced', async (req, res) => {
  try {
    res.json({ items: [], total: 0 });
  } catch (err) {
    res.status(500).json({ error: 'Advanced search failed' });
  }
});

export default router;
