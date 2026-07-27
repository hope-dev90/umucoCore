import { Router } from 'express';
import SavedModel from '../models/savedModel.js';
import { authMiddleware } from '../middleware/authMiddleWare.js';
import pool from '../config/db.js';

const router = Router();

router.get('/', authMiddleware, async (req, res) => {
  try {
    const items = await SavedModel.getByUser(req.user.id);
    const stats = {
      total: items.length,
      offline: items.filter(i => i.item_meta?.offline).length,
      storageUsedMB: items.reduce((acc, i) => acc + (i.item_meta?.sizeMB || 0), 0),
      storageLimitMB: 5120,
    };
    res.json({ items, stats });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch saved items' });
  }
});

router.post('/', authMiddleware, async (req, res) => {
  try {
    const { itemType, itemId, itemTitle, itemSubtitle, itemImage, itemMeta } = req.body;
    if (!itemType || itemId == null) {
      return res.status(400).json({ error: 'itemType and itemId are required' });
    }
    // item_id column is integer — coerce and validate
    const parsedItemId = Number(itemId);
    if (!Number.isFinite(parsedItemId) || parsedItemId <= 0) {
      return res.status(400).json({ error: 'itemId must be a valid positive integer' });
    }
    const saved = await SavedModel.create({
      userId: req.user.id,
      itemType,
      itemId: parsedItemId,
      itemTitle,
      itemSubtitle,
      itemImage,
      itemMeta,
    });
    res.status(201).json(saved);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to save item' });
  }
});

router.delete('/:itemId', authMiddleware, async (req, res) => {
  try {
    const itemId = Number(req.params.itemId);
    if (!Number.isFinite(itemId)) {
      return res.status(400).json({ error: 'Invalid item id' });
    }
    const deleted = await SavedModel.delete(req.user.id, itemId);
    if (!deleted) {
      return res.status(404).json({ error: 'Saved item not found' });
    }
    res.json({ message: 'Item removed', item: deleted });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to remove saved item' });
  }
});

router.patch('/:itemId/offline', authMiddleware, async (req, res) => {
  try {
    const itemId = Number(req.params.itemId);
    if (!Number.isFinite(itemId)) {
      return res.status(400).json({ error: 'Invalid item id' });
    }
    const { offline } = req.body;
    const result = await pool.query(
      `UPDATE saved_items SET item_meta = jsonb_set(item_meta, '{offline}', $1::jsonb), updated_at = NOW()
       WHERE user_id = $2 AND item_id = $3 RETURNING *`,
      [JSON.stringify(offline), req.user.id, itemId]
    );
    if (!result.rows[0]) {
      return res.status(404).json({ error: 'Saved item not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to toggle offline' });
  }
});

router.get('/check/:itemId', authMiddleware, async (req, res) => {
  try {
    const itemId = Number(req.params.itemId);
    if (!Number.isFinite(itemId)) {
      return res.json({ isSaved: false, savedItem: null });
    }
    const saved = await SavedModel.checkSaved(req.user.id, itemId);
    res.json({ isSaved: !!saved, savedItem: saved });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to check saved status' });
  }
});

export default router;
