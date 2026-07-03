import { Router } from 'express';
import { authMiddleware } from '../middleware/authMiddleWare.js';

const router = Router();

// ─── GET /api/saved ──────────────────────────────────────────────────────────
router.get('/', authMiddleware, async (req, res) => {
  try {
    const stats = {
      total: 0,
      offline: 0,
      storageUsedMB: 0,
      storageLimitMB: 5120
    };

    res.json({ items: [], stats });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch saved items' });
  }
});

// ─── POST /api/saved ─────────────────────────────────────────────────────────
router.post('/', authMiddleware, async (req, res) => {
  try {
    res.status(501).json({ error: 'Not implemented' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save item' });
  }
});

// ─── DELETE /api/saved/:itemId ───────────────────────────────────────────────
router.delete('/:itemId', authMiddleware, async (req, res) => {
  try {
    res.status(501).json({ error: 'Not implemented' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to remove saved item' });
  }
});

// ─── PATCH /api/saved/:itemId/offline ────────────────────────────────────────
router.patch('/:itemId/offline', authMiddleware, async (req, res) => {
  try {
    res.status(501).json({ error: 'Not implemented' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to toggle offline' });
  }
});

// ─── GET /api/saved/check/:itemId ────────────────────────────────────────────
router.get('/check/:itemId', authMiddleware, async (req, res) => {
  try {
    res.json({ isSaved: false, savedItem: null });
  } catch (err) {
    res.status(500).json({ error: 'Failed to check saved status' });
  }
});

export default router;
