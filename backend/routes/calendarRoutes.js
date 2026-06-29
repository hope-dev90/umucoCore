import { Router } from 'express';
import { db } from '../config/nedb.js';

const router = Router();

// ─── GET /api/calendar ───────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const { type, month, important, language } = req.query;
    const query = {};
    if (type) query.type = type;
    if (month) query.monthNum = Number(month);
    if (important === 'true') query.important = true;

    const events = await db.calendar.find(query).sort({ monthNum: 1 });

    const lang = language || 'en';
    const localized = events.map(ev => ({
      ...ev,
      displayTitle: lang === 'rw' ? ev.title_rw || ev.title :
                    lang === 'fr' ? ev.title_fr || ev.title : ev.title
    }));

    res.json({ events: localized, total: localized.length });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch calendar events' });
  }
});

// ─── GET /api/calendar/upcoming ──────────────────────────────────────────────
router.get('/upcoming', async (req, res) => {
  try {
    const { limit = 3 } = req.query;
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentDay = now.getDate();

    const events = await db.calendar.find({});
    const upcoming = events
      .filter(ev => {
        const evMonth = ev.monthNum;
        const evDay = Number(ev.day);
        if (evMonth > currentMonth) return true;
        if (evMonth === currentMonth && evDay >= currentDay) return true;
        return false;
      })
      .sort((a, b) => {
        const aDate = a.monthNum * 100 + Number(a.day);
        const bDate = b.monthNum * 100 + Number(b.day);
        return aDate - bDate;
      })
      .slice(0, Number(limit));

    res.json({ events: upcoming });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch upcoming events' });
  }
});

// ─── GET /api/calendar/today ──────────────────────────────────────────────────
router.get('/today', async (req, res) => {
  try {
    const now = new Date();
    const month = now.getMonth() + 1;
    const day = now.getDate().toString().padStart(2, '0');

    const events = await db.calendar.find({ monthNum: month, day });
    res.json({ events, hasEvents: events.length > 0 });
  } catch (err) {
    res.status(500).json({ error: "Failed to check today's events" });
  }
});

export default router;