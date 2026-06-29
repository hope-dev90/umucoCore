import { Router } from 'express';
import { db } from '../config/nedb.js';
import { authMiddleware } from '../middleware/authMiddleWare.js';

const router = Router();

// ─── GET /api/history ────────────────────────────────────────────────────────
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { page = 1, limit = 20, type } = req.query;
    const query = { userId: req.user.id };
    if (type) query.itemType = type;

    let items = await db.history.find(query).sort({ viewedAt: -1 });

    const total = items.length;
    const start = (Number(page) - 1) * Number(limit);
    const paginated = items.slice(start, start + Number(limit));

    res.json({ items: paginated, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

// ─── POST /api/history ───────────────────────────────────────────────────────
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { itemId, itemTitle, itemType = 'heritage', category } = req.body;
    if (!itemId || !itemTitle)
      return res.status(400).json({ error: 'Item ID and title required' });

    const existing = await db.history.findOne({ userId: req.user.id, itemId });
    if (existing) {
      await db.history.update(
        { _id: existing._id },
        { $set: { viewedAt: new Date().toISOString(), count: (existing.count || 1) + 1 } }
      );
      return res.json({ message: 'History updated' });
    }

    await db.history.insert({
      userId: req.user.id,
      itemId,
      itemTitle,
      itemType,
      category: category || '',
      viewedAt: new Date().toISOString(),
      count: 1
    });

    res.status(201).json({ message: 'Added to history' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to track history' });
  }
});

// ─── DELETE /api/history ─────────────────────────────────────────────────────
router.delete('/', authMiddleware, async (req, res) => {
  try {
    await db.history.remove({ userId: req.user.id }, { multi: true });
    res.json({ message: 'History cleared' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to clear history' });
  }
});

// ─── DELETE /api/history/:itemId ─────────────────────────────────────────────
router.delete('/:itemId', authMiddleware, async (req, res) => {
  try {
    await db.history.remove({ userId: req.user.id, itemId: req.params.itemId }, {});
    res.json({ message: 'Removed from history' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to remove history item' });
  }
});

export default router;