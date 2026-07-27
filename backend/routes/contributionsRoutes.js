import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import ContributionsModel from '../models/contributionModel.js';
import { sendEmail } from '../utils/email.js';

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

// ─── POST /api/contributions/subscribe ───────────────────────────────────────
router.post('/subscribe', async (req, res) => {
  try {
    const { contributor_email, contributor_name, title, description } = req.body;

    if (!contributor_email || !contributor_email.includes('@')) {
      return res.status(400).json({ error: 'Valid email is required' });
    }

    // Check if email is already subscribed
    const alreadySubscribed = await ContributionsModel.checkSubscription(contributor_email);
    if (alreadySubscribed) {
      return res.status(409).json({ 
        error: 'already_subscribed',
        message: 'You have already subscribed to our newsletter!' 
      });
    }

    const data = {
      contributor_email,
      contributor_name: contributor_name || contributor_email.split('@')[0],
      type: 'subscription',
      title: title || 'Newsletter Subscription',
      description: description || 'User subscribed to newsletter',
      status: 'active',
    };

    const contribution = await ContributionsModel.create(data);

    // Send confirmation email to the subscriber (don't wait for it)
    sendEmail({
      to: contributor_email,
      subject: 'Welcome to Umuco Core Newsletter!',
      text: `Hi ${contributor_name || contributor_email.split('@')[0]},\n\nThank you for subscribing to the Umuco Core newsletter!\n\nWe're excited to keep you updated with the latest news, events, and cultural insights from Rwanda.\n\nStay tuned for our upcoming newsletters.\n\nBest regards,\nThe Umuco Core Team`,
      html: `
<div style="background:#f4f4f4; padding:40px 0; font-family: Arial, sans-serif;">
  <div style="max-width:600px; margin:0 auto; background:#ffffff; border-radius:12px; padding:32px 28px; border:1px solid #eaeaea;">
    <div style="text-align:center; margin-bottom:24px;">
      <h1 style="font-size:26px; color:#8D493A; margin:0; font-family: Georgia, serif;">Umuco Core</h1>
      <p style="font-size:13px; color:#888; margin-top:8px;">Rwanda Cultural Archive</p>
    </div>
    
    <h2 style="font-size:20px; color:#111; margin-bottom:16px; text-align:center;">Welcome to Our Newsletter!</h2>
    
    <p style="font-size:14px; color:#444; margin-bottom:12px; line-height:1.6;">Hi ${contributor_name || contributor_email.split('@')[0]},</p>
    
    <p style="font-size:14px; color:#444; margin-bottom:12px; line-height:1.6;">
      Thank you for subscribing to the <strong>Umuco Core</strong> newsletter!
    </p>
    
    <p style="font-size:14px; color:#444; margin-bottom:20px; line-height:1.6;">
      We're excited to keep you updated with the latest news, events, and cultural insights from Rwanda. 
      You'll receive updates about:
    </p>
    
    <ul style="font-size:14px; color:#444; margin-bottom:20px; padding-left:20px; line-height:1.8;">
      <li>New cultural content and stories</li>
      <li>Upcoming events and celebrations</li>
      <li>Community contributions and features</li>
      <li>Virtual museum exhibitions</li>
    </ul>
    
    <div style="background:#f8f8f8; border:1px solid #e5e5e5; border-radius:10px; padding:20px; text-align:center; margin:24px 0;">
      <p style="font-size:14px; color:#555; margin:0;">
        Stay tuned for our upcoming newsletters!
      </p>
    </div>
    
    <p style="font-size:14px; color:#444; margin-bottom:20px; line-height:1.6;">
      If you have any questions or feedback, feel free to reach out to us.
    </p>
    
    <p style="font-size:14px; color:#444; margin-bottom:24px; line-height:1.6;">
      Best regards,<br/>
      <strong>The Umuco Core Team</strong>
    </p>
    
    <div style="border-top:1px solid #eee; padding-top:16px; text-align:center;">
      <p style="font-size:11px; color:#aaa; margin:0;">
        Umuco Core · Rwanda Cultural Archive<br/>
        Preserving heritage, inspiring future generations.
      </p>
    </div>
  </div>
</div>`,
    }).catch(emailError => {
      console.error('Failed to send subscription confirmation email:', emailError);
      // Don't fail the subscription if email fails
    });

    res.status(201).json({ success: true, contribution });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to save subscription' });
  }
});

// ─── POST /api/contributions/report ──────────────────────────────────────────
router.post('/report', async (req, res) => {
  try {
    const { type, item_type, item_id, title, description, contributor_name, contributor_email } = req.body;

    if (!item_type || !item_id) {
      return res.status(400).json({ error: 'itemType and itemId are required' });
    }

    const data = {
      type: type || 'report',
      item_type,
      item_id,
      title: title || 'User Report',
      description: description || '',
      contributor_name: contributor_name || 'Anonymous',
      contributor_email: contributor_email || 'anonymous@system',
      status: 'active',
    };

    const contribution = await ContributionsModel.create(data);
    res.status(201).json({ success: true, contribution });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to save report' });
  }
});

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
