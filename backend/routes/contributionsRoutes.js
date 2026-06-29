import { Router } from 'express';
import { db } from '../config/nedb.js';
import { authMiddleware } from '../middleware/authMiddleWare.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = Router();

// File upload config
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
    const { status, page = 1, limit = 20 } = req.query;
    const query = { userId: req.user.id };
    if (status) query.status = status;

    let items = await db.contributions.find(query).sort({ createdAt: -1 });

    const stats = {
      total: items.length,
      pending: items.filter(i => i.status === 'pending').length,
      verified: items.filter(i => i.status === 'verified').length,
      rejected: items.filter(i => i.status === 'rejected').length,
    };

    const total = items.length;
    const start = (Number(page) - 1) * Number(limit);
    const paginated = items.slice(start, start + Number(limit));

    res.json({ items: paginated, stats, total });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch contributions' });
  }
});

// ─── GET /api/contributions/my-stats ─────────────────────────────────────────
router.get('/my-stats', authMiddleware, async (req, res) => {
  try {
    const all = await db.contributions.find({ userId: req.user.id });
    res.json({
      storiesRecorded: all.length,
      itemsVerified: all.filter(i => i.status === 'verified').length,
      communityReach: 0,
      championStatus: all.filter(i => i.status === 'verified').length >= 10 ? 'Gold' :
                      all.filter(i => i.status === 'verified').length >= 5 ? 'Silver' : 'Bronze',
      pipeline: all.filter(i => i.status === 'pending').map(i => ({
        title: i.title,
        status: i.status,
        progress: i.reviewProgress || 20,
        reviewNote: i.reviewNote || 'Awaiting initial review'
      }))
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// ─── POST /api/contributions/upload-audio ────────────────────────────────────
router.post('/upload-audio', authMiddleware, upload.single('file'), async (req, res) => {
  try {
    const { title, description, language = 'Kinyarwanda', tags } = req.body;
    if (!title) return res.status(400).json({ error: 'Title is required' });

    const fileUrl = req.file ? `/uploads/contributions/${req.file.filename}` : null;

    const contribution = await db.contributions.insert({
      userId: req.user.id,
      type: 'audio',
      title,
      description: description || '',
      language,
      tags: tags ? (Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim())) : [],
      fileUrl,
      originalName: req.file?.originalname,
      status: 'pending',
      reviewProgress: 10,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    res.status(201).json({ contribution, message: 'Audio submitted for review!' });
  } catch (err) {
    res.status(500).json({ error: 'Upload failed' });
  }
});

// ─── POST /api/contributions/capture-photo ────────────────────────────────────
router.post('/capture-photo', authMiddleware, upload.single('file'), async (req, res) => {
  try {
    const { title, location, description, tags } = req.body;
    if (!title) return res.status(400).json({ error: 'Title is required' });

    const fileUrl = req.file ? `/uploads/contributions/${req.file.filename}` : null;

    const contribution = await db.contributions.insert({
      userId: req.user.id,
      type: 'photo',
      title,
      location: location || '',
      description: description || '',
      tags: tags ? (Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim())) : [],
      fileUrl,
      originalName: req.file?.originalname,
      status: 'pending',
      reviewProgress: 10,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    res.status(201).json({ contribution, message: 'Photo submitted for review!' });
  } catch (err) {
    res.status(500).json({ error: 'Photo upload failed' });
  }
});

// ─── POST /api/contributions/oral-history ────────────────────────────────────
router.post('/oral-history', authMiddleware, async (req, res) => {
  try {
    const { title, content, narrator, region, era, language = 'Kinyarwanda', tags } = req.body;
    if (!title || !content)
      return res.status(400).json({ error: 'Title and content are required' });

    const contribution = await db.contributions.insert({
      userId: req.user.id,
      type: 'oral-history',
      title,
      content,
      narrator: narrator || '',
      region: region || '',
      era: era || '',
      language,
      tags: tags ? (Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim())) : [],
      status: 'pending',
      reviewProgress: 15,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    res.status(201).json({ contribution, message: 'Oral history submitted for review!' });
  } catch (err) {
    res.status(500).json({ error: 'Submission failed' });
  }
});

// ─── DELETE /api/contributions/:id ───────────────────────────────────────────
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const contribution = await db.contributions.findOne({ _id: req.params.id, userId: req.user.id });
    if (!contribution) return res.status(404).json({ error: 'Contribution not found' });
    if (contribution.status !== 'pending')
      return res.status(400).json({ error: 'Only pending contributions can be deleted' });

    await db.contributions.remove({ _id: req.params.id }, {});
    res.json({ message: 'Contribution removed' });
  } catch (err) {
    res.status(500).json({ error: 'Deletion failed' });
  }
});

export default router;