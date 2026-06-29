import { Router } from 'express';
import { db } from '../config/nedb.js';
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
    const { type, genre, featured, search, page = 1, limit = 20 } = req.query;
    const query = {};
    if (type) query.type = type;
    if (genre) query.genre = genre;
    if (featured === 'true') query.featured = true;

    let items = await db.collections.find(query).sort({ createdAt: -1 });

    if (search) {
      const s = search.toLowerCase();
      items = items.filter(i =>
        i.title?.toLowerCase().includes(s) ||
        i.title_rw?.toLowerCase().includes(s) ||
        i.title_fr?.toLowerCase().includes(s) ||
        i.narrator?.toLowerCase().includes(s) ||
        i.desc?.toLowerCase().includes(s) ||
        i.tags?.some(t => t.toLowerCase().includes(s))
      );
    }

    const total = items.length;
    const start = (Number(page) - 1) * Number(limit);
    const paginated = items.slice(start, start + Number(limit));

    res.json({ items: paginated, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch collections' });
  }
});

// ─── GET /api/collections/featured ───────────────────────────────────────────
router.get('/featured', async (req, res) => {
  try {
    const featured = await db.collections.find({ featured: true });
    res.json({ items: featured });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch featured' });
  }
});

// ─── GET /api/collections/audio ──────────────────────────────────────────────
router.get('/audio', async (req, res) => {
  try {
    const { genre, featured } = req.query;
    const query = { type: 'audio' };
    if (genre) query.genre = genre;
    if (featured === 'true') query.featured = true;

    const items = await db.collections.find(query).sort({ createdAt: -1 });

    const userId = getOptionalUserId(req);
    if (userId) {
      const saved = await db.saved.find({ userId, type: 'audio' });
      const savedIds = new Set(saved.map(s => s.itemId));
      items.forEach(item => { item.isSaved = savedIds.has(item._id); });
    }

    const featured_item = items.find(i => i.featured);
    const others = items.filter(i => !i.featured);
    const fables = others.filter(i => i.genre === 'Migani');
    const proverbs = others.filter(i => i.genre === 'Proverb');

    res.json({ featured: featured_item, fables, proverbs, all: items });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch audio' });
  }
});

// ─── POST /api/collections/:id/play ──────────────────────────────────────────
router.post('/:id/play', authMiddleware, async (req, res) => {
  try {
    const item = await db.collections.findOne({ _id: req.params.id });
    if (!item) return res.status(404).json({ error: 'Item not found' });

    const existing = await db.history.findOne({ userId: req.user.id, itemId: item._id });
    if (existing) {
      await db.history.update(
        { _id: existing._id },
        { $set: { viewedAt: new Date().toISOString(), count: (existing.count || 1) + 1 } }
      );
    } else {
      await db.history.insert({
        userId: req.user.id,
        itemId: item._id,
        itemTitle: item.title,
        itemType: item.type,
        category: item.genre,
        viewedAt: new Date().toISOString(),
        count: 1
      });
    }

    res.json({ message: 'Playing', item });
  } catch (err) {
    res.status(500).json({ error: 'Failed' });
  }
});

// ─── POST /api/collections/:id/library ───────────────────────────────────────
router.post('/:id/library', authMiddleware, async (req, res) => {
  try {
    const item = await db.collections.findOne({ _id: req.params.id });
    if (!item) return res.status(404).json({ error: 'Item not found' });

    const existing = await db.saved.findOne({ userId: req.user.id, itemId: item._id });
    if (existing) return res.status(409).json({ error: 'Already in library' });

    await db.saved.insert({
      userId: req.user.id,
      itemId: item._id,
      itemTitle: item.title,
      type: item.type || 'audio',
      category: item.genre || 'Audio',
      image: item.image || null,
      description: item.desc || '',
      offlineAvailable: false,
      savedAt: new Date().toISOString()
    });

    res.status(201).json({ message: 'Added to library' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to add to library' });
  }
});

export default router;