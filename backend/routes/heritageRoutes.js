import { Router } from 'express';
import { db } from '../config/nedb.js';
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
    const { region, era, category, search, page = 1, limit = 20, featured } = req.query;
    const query = {};

    if (region && region !== 'All Regions') query.region = region;
    if (era) query.era = era;
    if (category) query.catKey = category;
    if (featured === 'true') query.featured = true;

    let items = await db.heritage.find(query);

    // Search across multilingual fields
    if (search) {
      const s = search.toLowerCase();
      items = items.filter(item =>
        item.title?.toLowerCase().includes(s) ||
        item.title_rw?.toLowerCase().includes(s) ||
        item.title_fr?.toLowerCase().includes(s) ||
        item.desc?.toLowerCase().includes(s) ||
        item.location?.toLowerCase().includes(s) ||
        item.tags?.some(t => t.toLowerCase().includes(s))
      );
    }

    const total = items.length;
    const start = (Number(page) - 1) * Number(limit);
    const paginated = items.slice(start, start + Number(limit));

    // If user is authenticated, mark which items they've saved
    const userId = getOptionalUserId(req);
    if (userId) {
      const saved = await db.saved.find({ userId, type: 'heritage' });
      const savedIds = new Set(saved.map(s => s.itemId));
      paginated.forEach(item => { item.isSaved = savedIds.has(item.id); });
    }

    res.json({ items: paginated, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch heritage items' });
  }
});

// ─── GET /api/heritage/:id ───────────────────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const item = await db.heritage.findOne({ id: req.params.id });
    if (!item) return res.status(404).json({ error: 'Heritage item not found' });

    // Track view in history if authenticated
    const userId = getOptionalUserId(req);
    if (userId) {
      const existingHistory = await db.history.findOne({ userId, itemId: item.id });
      if (existingHistory) {
        await db.history.update(
          { _id: existingHistory._id },
          { $set: { viewedAt: new Date().toISOString(), count: (existingHistory.count || 1) + 1 } }
        );
      } else {
        await db.history.insert({
          userId,
          itemId: item.id,
          itemTitle: item.title,
          itemType: 'heritage',
          category: item.category,
          viewedAt: new Date().toISOString(),
          count: 1
        });
      }

      // Check saved
      const saved = await db.saved.findOne({ userId, itemId: item.id });
      item.isSaved = !!saved;
    }

    res.json({ item });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch heritage item' });
  }
});

// ─── GET /api/heritage/search/advanced ───────────────────────────────────────
router.get('/search/advanced', async (req, res) => {
  try {
    const { q, region, era, category, language } = req.query;
    let items = await db.heritage.find({});

    if (q) {
      const s = q.toLowerCase();
      const lang = language || 'en';
      items = items.filter(item => {
        const titleField = lang === 'rw' ? 'title_rw' : lang === 'fr' ? 'title_fr' : 'title';
        const descField = lang === 'rw' ? 'desc_rw' : lang === 'fr' ? 'desc_fr' : 'desc';
        return (
          item[titleField]?.toLowerCase().includes(s) ||
          item[descField]?.toLowerCase().includes(s) ||
          item.location?.toLowerCase().includes(s) ||
          item.tags?.some(t => t.toLowerCase().includes(s))
        );
      });
    }

    if (region && region !== 'All Regions') items = items.filter(i => i.region === region);
    if (era) items = items.filter(i => i.era === era);
    if (category) items = items.filter(i => i.catKey === category);

    res.json({ items, total: items.length });
  } catch (err) {
    res.status(500).json({ error: 'Advanced search failed' });
  }
});

export default router;