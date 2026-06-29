import { Router } from 'express';
import { db } from '../config/nedb.js';
import jwt from 'jsonwebtoken';
import config from '../config/env.js';
import { authMiddleware } from '../middleware/authMiddleWare.js';

const router = Router();

// Helper to extract user from optional auth
function getOptionalUserId(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  try {
    const decoded = jwt.verify(authHeader.slice(7), config.jwt.secret);
    return decoded.id;
  } catch (_) {
    return null;
  }
}

// ─── GET /api/search ─────────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const { q, language = 'en', limit = 10 } = req.query;
    if (!q || q.trim().length < 2)
      return res.status(400).json({ error: 'Query must be at least 2 characters' });

    const s = q.toLowerCase().trim();
    const lang = language;

    // Search heritage
    const heritage = await db.heritage.find({});
    const heritageResults = heritage.filter(item => {
      const titleField = lang === 'rw' ? 'title_rw' : lang === 'fr' ? 'title_fr' : 'title';
      const descField = lang === 'rw' ? 'desc_rw' : lang === 'fr' ? 'desc_fr' : 'desc';
      return (
        item[titleField]?.toLowerCase().includes(s) ||
        item[descField]?.toLowerCase().includes(s) ||
        item.location?.toLowerCase().includes(s) ||
        item.tags?.some(t => t.toLowerCase().includes(s)) ||
        item.title?.toLowerCase().includes(s)
      );
    }).slice(0, Number(limit));

    // Search audio
    const audio = await db.collections.find({ type: 'audio' });
    const audioResults = audio.filter(item => {
      const titleField = lang === 'rw' ? 'title_rw' : lang === 'fr' ? 'title_fr' : 'title';
      return (
        item[titleField]?.toLowerCase().includes(s) ||
        item.title?.toLowerCase().includes(s) ||
        item.narrator?.toLowerCase().includes(s) ||
        item.tags?.some(t => t.toLowerCase().includes(s))
      );
    }).slice(0, Number(limit));

    // Search calendar
    const calendar = await db.calendar.find({});
    const calendarResults = calendar.filter(ev => {
      return (
        ev.title?.toLowerCase().includes(s) ||
        ev.title_rw?.toLowerCase().includes(s) ||
        ev.title_fr?.toLowerCase().includes(s)
      );
    }).slice(0, 5);

    const total = heritageResults.length + audioResults.length + calendarResults.length;

    res.json({
      query: q,
      total,
      results: {
        heritage: heritageResults.map(i => ({ ...i, resultType: 'heritage' })),
        audio: audioResults.map(i => ({ ...i, resultType: 'audio' })),
        calendar: calendarResults.map(i => ({ ...i, resultType: 'calendar' }))
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Search failed' });
  }
});

// ─── GET /api/dashboard ──────────────────────────────────────────────────────
router.get('/dashboard', authMiddleware, async (req, res) => {
  try {
    const user = req.user;

    // Today's highlight (first featured heritage item)
    const highlight = await db.heritage.findOne({ featured: true });

    // Continue exploring: user's recent history
    const recentHistory = await db.history.find({ userId: user.id }).sort({ viewedAt: -1 });
    const recentIds = recentHistory.slice(0, 4).map(h => h.itemId);

    // Recently added heritage (last 3)
    const recentlyAdded = await db.heritage.find({});
    const sortedHeritage = recentlyAdded.sort((a, b) =>
      new Date(b.createdAt) - new Date(a.createdAt)
    ).slice(0, 3);

    // Upcoming calendar events
    const now = new Date();
    const allEvents = await db.calendar.find({});
    const upcoming = allEvents
      .filter(ev => {
        const evMonth = ev.monthNum;
        const evDay = Number(ev.day);
        const currentMonth = now.getMonth() + 1;
        const currentDay = now.getDate();
        if (evMonth > currentMonth) return true;
        if (evMonth === currentMonth && evDay >= currentDay) return true;
        return false;
      })
      .sort((a, b) => (a.monthNum * 100 + Number(a.day)) - (b.monthNum * 100 + Number(b.day)))
      .slice(0, 3);

    // User activity
    const activity = recentHistory.slice(0, 5).map(h => ({
      label: h.itemType === 'audio' ? `Listened: ${h.itemTitle}` :
             h.itemType === 'photo' ? `Viewed: ${h.itemTitle}` :
             `Viewed: ${h.itemTitle}`,
      time: new Date(h.viewedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
    }));

    // Stats
    const savedCount = await db.saved.count({ userId: user.id });
    const contribCount = await db.contributions.count({ userId: user.id });

    // Quotes
    const quotes = [
      { text: '"Umuco ni u Rwanda, Rwanda ni twe."', sub: 'Culture is Rwanda, and Rwanda is us.' },
      { text: '"Inzira y\'umunyarwanda ni ubwenge."', sub: 'The path of the Rwandan is wisdom.' },
      { text: '"Urubanza rurebe urwe gukurikiranwa."', sub: 'True heritage is preserved by its people.' }
    ];
    const quoteOfDay = quotes[new Date().getDate() % quotes.length];

    res.json({
      user: { fullName: user.name, language: user.language, avatar: user.avatar },
      highlight,
      upcoming,
      activity,
      recentlyAdded: sortedHeritage,
      stats: { savedCount, contribCount },
      quoteOfDay,
      today: new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
    });
  } catch (err) {
    console.error('Dashboard error:', err);
    res.status(500).json({ error: 'Failed to load dashboard' });
  }
});

export default router;