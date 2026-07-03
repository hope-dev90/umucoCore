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

// ─── GET /api/collections ────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    res.json({ items: [], total: 0, page: 1, pages: 0 });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch collections' });
  }
});

// ─── GET /api/collections/featured ───────────────────────────────────────────
router.get('/featured', async (req, res) => {
  try {
    res.json({ items: [] });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch featured' });
  }
});

// ─── GET /api/collections/audio ──────────────────────────────────────────────
router.get('/audio', async (req, res) => {
  try {
    res.json({ featured: null, fables: [], proverbs: [], all: [] });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch audio' });
  }
});

// ─── POST /api/collections/:id/play ──────────────────────────────────────────
router.post('/:id/play', authMiddleware, async (req, res) => {
  try {
    res.status(501).json({ error: 'Not implemented' });
  } catch (err) {
    res.status(500).json({ error: 'Failed' });
  }
});

// ─── POST /api/collections/:id/library ───────────────────────────────────────
router.post('/:id/library', authMiddleware, async (req, res) => {
  try {
    res.status(501).json({ error: 'Not implemented' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to add to library' });
  }
});

export default router;
