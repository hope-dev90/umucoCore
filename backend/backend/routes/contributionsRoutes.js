import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import ContributionsModel from '../models/contributionModel.js';

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

// Helper to save contribution to DB
const saveContribution = async (req, res, type) => {
  try {
    const file = req.file;
    const { contributor_name, contributor_email, description, title } = req.body;

    if (!contributor_name || !contributor_email || !description) {
      return res.status(400).json({ error: 'Name, email, and description are required' });
    }

    const data = {
      contributor_name,
      contributor_email,
      type,
      description,
      title: title || `${type} contribution`,
    };

    if (file) {
      data.file_url = `/uploads/contributions/${file.filename}`;
      data.file_name = file.originalname;
      data.file_size = file.size;
      data.mime_type = file.mimetype;
    }

    const contribution = await ContributionsModel.create(data);
    res.status(201).json({ success: true, contribution });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to save contribution' });
  }
};

// ─── GET /api/contributions ──────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const items = await ContributionsModel.getAll();
    const stats = await ContributionsModel.getStats();
    res.json({ items, stats, total: stats.total });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch contributions' });
  }
});

// ─── GET /api/contributions/my-stats ─────────────────────────────────────────
router.get('/my-stats', async (req, res) => {
  try {
    const stats = await ContributionsModel.getStats();
    res.json({
      storiesRecorded: stats.total,
      itemsVerified: stats.verified,
      communityReach: stats.total * 12,
      championStatus: 'Gold',
      pipeline: []
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// ─── POST /api/contributions/upload-audio ────────────────────────────────────
router.post('/upload-audio', upload.single('file'), (req, res) => saveContribution(req, res, 'audio'));

// ─── POST /api/contributions/upload-video ────────────────────────────────────
router.post('/upload-video', upload.single('file'), (req, res) => saveContribution(req, res, 'video'));

// ─── POST /api/contributions/capture-photo ────────────────────────────────────
router.post('/capture-photo', upload.single('file'), (req, res) => saveContribution(req, res, 'photo'));

// ─── POST /api/contributions/oral-history ────────────────────────────────────
router.post('/oral-history', upload.single('file'), (req, res) => saveContribution(req, res, 'oral_history'));

// ─── DELETE /api/contributions/:id ───────────────────────────────────────────
router.delete('/:id', async (req, res) => {
  try {
    const contribution = await ContributionsModel.getById(req.params.id);
    if (!contribution) {
      return res.status(404).json({ error: 'Contribution not found' });
    }

    if (contribution.file_url) {
      const filePath = path.join(__dirname, '..', contribution.file_url);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await ContributionsModel.delete(req.params.id);
    res.json({ message: 'Contribution deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Deletion failed' });
  }
});

export default router;
