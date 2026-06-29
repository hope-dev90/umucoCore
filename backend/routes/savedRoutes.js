import { Router } from 'express';
import { db } from '../config/nedb.js';
import { authMiddleware } from '../middleware/authMiddleWare.js';

const router = Router();

// ─── GET /api/saved ──────────────────────────────────────────────────────────
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { type, search } = req.query;
    const query = { userId: req.user.id };
    if (type) query.type = type;

    let items = await db.saved.find(query).sort({ savedAt: -1 });

    if (search) {
      const s = search.toLowerCase();
      items = items.filter(i =>
        i.itemTitle?.toLowerCase().includes(s) ||
        i.category?.toLowerCase().includes(s)
      );
    }

    const stats = {
      total: items.length,
      offline: items.filter(i => i.offlineAvailable).length,
      storageUsedMB: items.length * 12,
      storageLimitMB: 5120
    };

    res.json({ items, stats });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch saved items' });
  }
});

// ─── POST /api/saved ─────────────────────────────────────────────────────────
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { itemId, itemTitle, type, category, image, description } = req.body;
    if (!itemId || !itemTitle)
      return res.status(400).json({ error: 'Item ID and title are required' });

    const existing = await db.saved.findOne({ userId: req.user.id, itemId });
    if (existing) return res.status(409).json({ error: 'Item already saved', saved: existing });

    const saved = await db.saved.insert({
      userId: req.user.id,
      itemId,
      itemTitle,
      type: type || 'heritage',
      category: category || 'Uncategorized',
      image: image || null,
      description: description || '',
      offlineAvailable: false,
      savedAt: new Date().toISOString()
    });

    res.status(201).json({ saved, message: 'Saved to your collection' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save item' });
  }
});

// ─── DELETE /api/saved/:itemId ───────────────────────────────────────────────
router.delete('/:itemId', authMiddleware, async (req, res) => {
  try {
    const removed = await db.saved.remove({ userId: req.user.id, itemId: req.params.itemId }, {});
    if (!removed) return res.status(404).json({ error: 'Saved item not found' });
    res.json({ message: 'Removed from saved' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to remove saved item' });
  }
});

// ─── PATCH /api/saved/:itemId/offline ────────────────────────────────────────
router.patch('/:itemId/offline', authMiddleware, async (req, res) => {
  try {
    const { available } = req.body;
    const result = await db.saved.update(
      { userId: req.user.id, itemId: req.params.itemId },
      { $set: { offlineAvailable: !!available } }
    );
    if (!result) return res.status(404).json({ error: 'Saved item not found' });
    res.json({ message: available ? 'Available offline' : 'Online only' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to toggle offline' });
  }
});

// ─── GET /api/saved/check/:itemId ────────────────────────────────────────────
router.get('/check/:itemId', authMiddleware, async (req, res) => {
  try {
    const saved = await db.saved.findOne({ userId: req.user.id, itemId: req.params.itemId });
    res.json({ isSaved: !!saved, savedItem: saved || null });
  } catch (err) {
    res.status(500).json({ error: 'Failed to check saved status' });
  }
});

export default router;