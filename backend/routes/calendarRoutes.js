import { Router } from 'express';

const router = Router();

// ─── GET /api/calendar ───────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    res.json({ events: [], total: 0 });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch calendar events' });
  }
});

// ─── GET /api/calendar/upcoming ──────────────────────────────────────────────
router.get('/upcoming', async (req, res) => {
  try {
    res.json({ events: [] });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch upcoming events' });
  }
});

// ─── GET /api/calendar/today ──────────────────────────────────────────────────
router.get('/today', async (req, res) => {
  try {
    res.json({ events: [], hasEvents: false });
  } catch (err) {
    res.status(500).json({ error: "Failed to check today's events" });
  }
});

export default router;
