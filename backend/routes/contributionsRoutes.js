import { Router } from 'express';
import { authMiddleware } from '../middleware/authMiddleWare.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = Router();

// File upload config (keep this for future use)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../uploads/contributions');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext).replace(/[^a-z0-9]/gi, '-').toLowerCase();
    cb(null, `${name}-${Date.now()}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['image/', 'audio/', 'video/', 'application/pdf', 'text/'];
    if (allowed.some(t => file.mimetype.startsWith(t))) return cb(null, true);
    cb(new Error('File type not supported'));
  }
});

// ─── GET /api/contributions ──────────────────────────────────────────────────
router.get('/', authMiddleware, async (req, res) => {
  try {
    const stats = {
      total: 0,
      pending: 0,
      verified: 0,
      rejected: 0,
    };

    res.json({ items: [], stats, total: 0 });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch contributions' });
  }
});

// ─── GET /api/contributions/my-stats ─────────────────────────────────────────
router.get('/my-stats', authMiddleware, async (req, res) => {
  try {
    res.json({
      storiesRecorded: 0,
      itemsVerified: 0,
      communityReach: 0,
      championStatus: 'Bronze',
      pipeline: []
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// ─── POST /api/contributions/upload-audio ────────────────────────────────────
router.post('/upload-audio', authMiddleware, upload.single('file'), async (req, res) => {
  try {
    res.status(501).json({ error: 'Not implemented' });
  } catch (err) {
    res.status(500).json({ error: 'Upload failed' });
  }
});

// ─── POST /api/contributions/capture-photo ────────────────────────────────────
router.post('/capture-photo', authMiddleware, upload.single('file'), async (req, res) => {
  try {
    res.status(501).json({ error: 'Not implemented' });
  } catch (err) {
    res.status(500).json({ error: 'Photo upload failed' });
  }
});

// ─── POST /api/contributions/oral-history ────────────────────────────────────
router.post('/oral-history', authMiddleware, async (req, res) => {
  try {
    res.status(501).json({ error: 'Not implemented' });
  } catch (err) {
    res.status(500).json({ error: 'Submission failed' });
  }
});

// ─── DELETE /api/contributions/:id ───────────────────────────────────────────
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    res.status(501).json({ error: 'Not implemented' });
  } catch (err) {
    res.status(500).json({ error: 'Deletion failed' });
  }
});

export default router;
