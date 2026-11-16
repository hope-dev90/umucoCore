import pool from "../config/db.js";
import NewsModel from "../models/newsModel.js";
import { deleteUserById, getAllUsers, updateUserProfile } from "../models/userModels.js";
import AudioModel from "../models/audioModel.js";
import VideoModel from "../models/videoModel.js";
import HeritageModel from "../models/heritageModel.js";
import CollectionsModel from "../models/collectionsModel.js";
import ProverbModel from "../models/proverbModel.js";
import ExerciseModel from "../models/exerciseModel.js";
import { sendAdminAlertEmail } from "../utils/email.js";
import { ensureAiSchema } from "./aiController.js";

const safeUser = (user) => {
  // Always strip auth/internal fields.
  // For admin accounts, also strip name and email so they are never exposed via API.
  const { password, otp, otp_expires, google_id, ...rest } = user;
  if (rest.role === 'admin') {
    const { name, email, ...adminSafe } = rest;
    return adminSafe;
  }
  return rest;
};

const countTable = async (table, where = "true") => {
  const result = await pool.query(`SELECT COUNT(*)::int AS count FROM ${table} WHERE ${where}`);
  return result.rows[0]?.count || 0;
};

const breakdown = async (table, column, where = "true") => {
  const result = await pool.query(
    `SELECT COALESCE(${column}::text, 'Unspecified') AS label, COUNT(*)::int AS value
     FROM ${table}
     WHERE ${where}
     GROUP BY ${column}
     ORDER BY value DESC, label ASC`,
  );
  return result.rows;
};

const monthlyCounts = async (table, where = "true") => {
  const result = await pool.query(
    `SELECT to_char(date_trunc('month', created_at), 'Mon YYYY') AS label,
            COUNT(*)::int AS value
     FROM ${table}
     WHERE created_at >= date_trunc('month', NOW()) - INTERVAL '5 months'
       AND ${where}
     GROUP BY date_trunc('month', created_at)
     ORDER BY date_trunc('month', created_at) ASC`,
  );
  return result.rows;
};

export const getAdminOverview = async (req, res) => {
  try {
    // Security: notify owner on every dashboard visit (fire-and-forget)
    sendAdminAlertEmail({
      type: 'dashboard_visit',
      meta: {
        userId:    req.user?.id,
        ip:        req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket?.remoteAddress,
        userAgent: req.headers['user-agent'],
      },
    }).catch((e) => console.error('Dashboard visit alert email failed:', e.message));

    await NewsModel.getAll();
    const [users, videos, audio, heritage, collections, news, proverbs, exercises, contributions, admins, verifiedUsers] = await Promise.all([
      countTable("users", "role != 'admin'"),
      countTable("video_content"),
      countTable("audio_content"),
      countTable("heritage_items", "is_active = true"),
      countTable("collections", "is_active = true"),
      countTable("news_posts"),
      countTable("proverbs"),
      countTable("exercises", "is_active = true"),
      countTable("contributions"),
      countTable("users", "role = 'admin'"),
      countTable("users", "is_verified = true AND role != 'admin'"),
    ]);
    await ensureAiSchema().catch(() => {});
    const [aiQueries, pendingReview] = await Promise.all([
      safeCount(`SELECT COUNT(*)::int AS count FROM ai_usage`),
      safeCount(`SELECT COUNT(*)::int AS count FROM contributions WHERE status = 'pending' OR (type = 'report' AND status = 'active')`),
    ]);

    const [
      roleBreakdown,
      heritageByCategory,
      videoByCategory,
      audioByCategory,
      newsByStatus,
      contributionsByStatus,
      monthlyUsers,
      monthlyHeritage,
      monthlyVideo,
      monthlyAudio,
      monthlyNews,
      monthlyProverbs,
      monthlyExercises,
    ] = await Promise.all([
      breakdown("users", "role"),
      breakdown("heritage_items", "category", "is_active = true"),
      breakdown("video_content", "category"),
      breakdown("audio_content", "category"),
      breakdown("news_posts", "status"),
      breakdown("contributions", "status"),
      monthlyCounts("users", "role != 'admin'"),
      monthlyCounts("heritage_items", "is_active = true"),
      monthlyCounts("video_content"),
      monthlyCounts("audio_content"),
      monthlyCounts("news_posts"),
      monthlyCounts("proverbs"),
      monthlyCounts("exercises", "is_active = true"),
    ]);

    const contentMix = [
      { label: "Heritage", value: heritage },
      { label: "Videos", value: videos },
      { label: "Audio", value: audio },
      { label: "Collections", value: collections },
      { label: "News", value: news },
      { label: "Imigani", value: proverbs },
      { label: "Exercises", value: exercises },
    ];

    const monthlyContentMap = new Map();
    [monthlyHeritage, monthlyVideo, monthlyAudio, monthlyNews, monthlyProverbs, monthlyExercises].flat().forEach((point) => {
      monthlyContentMap.set(point.label, (monthlyContentMap.get(point.label) || 0) + point.value);
    });

    res.json({
      stats: {
        users,
        admins,
        verifiedUsers,
        verificationRate: users > 0 ? Math.round((verifiedUsers / users) * 100) : 0,
        videos,
        audio,
        heritage,
        collections,
        news,
        proverbs,
        exercises,
        contributions,
        aiQueries,
        pendingReview,
        contentTotal: videos + audio + heritage + collections + news + proverbs + exercises,
      },
      analytics: {
        roleBreakdown,
        contentMix,
        heritageByCategory,
        videoByCategory,
        audioByCategory,
        newsByStatus,
        contributionsByStatus,
        monthlyUsers,
        monthlyContent: [...monthlyContentMap.entries()].map(([label, value]) => ({ label, value })),
      },
      refreshedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load admin overview" });
  }
};

export const getAdminUsers = async (_req, res) => {
  try {
    const users = await getAllUsers();
    const [views, saves, ai] = await Promise.all([
      safeRows(`SELECT user_id, COUNT(*)::int AS count, MAX(viewed_at) AS last_at FROM view_history GROUP BY user_id`),
      safeRows(`SELECT user_id, COUNT(*)::int AS count FROM saved_items GROUP BY user_id`),
      safeRows(`SELECT user_id, COUNT(*)::int AS count FROM ai_usage GROUP BY user_id`),
    ]);
    const byUser = (rows) => new Map(rows.map((row) => [String(row.user_id), row]));
    const [viewMap, saveMap, aiMap] = [byUser(views), byUser(saves), byUser(ai)];
    res.json({
      users: users.map((item) => ({
        ...safeUser(item),
        views: viewMap.get(String(item.id))?.count || 0,
        last_viewed_at: viewMap.get(String(item.id))?.last_at || null,
        saves: saveMap.get(String(item.id))?.count || 0,
        ai_queries: aiMap.get(String(item.id))?.count || 0,
      })),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load users" });
  }
};

export const updateAdminUser = async (req, res) => {
  try {
    const { id } = req.params;
    const allowedRoles = new Set(["user", "government", "admin"]);
    const updates = {};

    if (req.body.role) {
      if (!allowedRoles.has(req.body.role)) {
        return res.status(400).json({ error: "Invalid role" });
      }
      updates.role = req.body.role;
    }
    if (typeof req.body.is_verified === "boolean") updates.is_verified = req.body.is_verified;
    if (req.body.name) updates.name = req.body.name;

    const updated = await updateUserProfile(id, updates);
    if (!updated) return res.status(404).json({ error: "User not found" });
    res.json({ user: safeUser(updated) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update user" });
  }
};

export const deleteAdminUser = async (req, res) => {
  try {
    if (String(req.params.id) === String(req.user.id)) {
      return res.status(400).json({ error: "Admins cannot delete their own account here" });
    }
    await deleteUserById(req.params.id);
    res.json({ message: "User deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete user" });
  }
};

export const getAdminContent = async (_req, res) => {
  try {
    const [videos, audio, heritage, collections, news, proverbs, exercises] = await Promise.all([
      VideoModel.getAll(),
      AudioModel.getAll(),
      HeritageModel.getAll(),
      CollectionsModel.getAll(),
      NewsModel.getAll(),
      ProverbModel.getAll(),
      ExerciseModel.getAll({ activeOnly: false }),
    ]);
    res.json({ videos, audio, heritage, collections, news, proverbs, exercises });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load admin content" });
  }
};

const searchTable = async (table, fields, q, extraWhere = "true") => {
  const like = `%${q}%`;
  const where = fields.map((field) => `${field} ILIKE $1`).join(" OR ");
  const result = await pool.query(
    `SELECT * FROM ${table}
     WHERE ${extraWhere} AND (${where})
     ORDER BY updated_at DESC NULLS LAST, created_at DESC
     LIMIT 25`,
    [like],
  );
  return result.rows;
};

export const searchAdminContent = async (req, res) => {
  try {
    const q = String(req.query.q || "").trim();
    if (q.length < 2) {
      return res.json({ q, results: { videos: [], audio: [], heritage: [], collections: [], news: [], proverbs: [], exercises: [], users: [] } });
    }

    const [videos, audio, heritage, collections, news, proverbs, exercises, users] = await Promise.all([
      searchTable("video_content", ["title", "description", "category"], q),
      searchTable("audio_content", ["title", "description", "category"], q),
      searchTable("heritage_items", ["title", "description", "category", "location", "region"], q, "is_active = true"),
      searchTable("collections", ["title", "description", "category", "curated_by"], q, "is_active = true"),
      searchTable("news_posts", ["title", "summary", "body", "category", "status"], q),
      searchTable("proverbs", ["text", "translation", "language", "category", "source"], q),
      searchTable("exercises", ["title", "prompt", "answer", "difficulty", "item_type"], q, "is_active = true"),
      searchTable("users", ["name", "email", "role"], q, "role != 'admin'"),
    ]);

    res.json({ q, results: { videos, audio, heritage, collections, news, proverbs, exercises, users: users.map(safeUser) } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to search admin content" });
  }
};

export const createProverb = async (req, res) => {
  try {
    const proverb = await ProverbModel.create(req.body);
    res.status(201).json(proverb);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create proverb" });
  }
};

export const updateProverb = async (req, res) => {
  try {
    const proverb = await ProverbModel.update(req.params.id, req.body);
    if (!proverb) return res.status(404).json({ error: "Proverb not found" });
    res.json(proverb);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update proverb" });
  }
};

export const deleteProverb = async (req, res) => {
  try {
    const proverb = await ProverbModel.delete(req.params.id);
    if (!proverb) return res.status(404).json({ error: "Proverb not found" });
    res.json({ message: "Proverb deleted", proverb });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete proverb" });
  }
};

export const createExercise = async (req, res) => {
  try {
    const exercise = await ExerciseModel.create({ ...req.body, created_by: req.user.id });
    res.status(201).json(exercise);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create exercise" });
  }
};

export const updateExercise = async (req, res) => {
  try {
    const exercise = await ExerciseModel.update(req.params.id, req.body);
    if (!exercise) return res.status(404).json({ error: "Exercise not found" });
    res.json(exercise);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update exercise" });
  }
};

export const deleteExercise = async (req, res) => {
  try {
    const exercise = await ExerciseModel.delete(req.params.id);
    if (!exercise) return res.status(404).json({ error: "Exercise not found" });
    res.json({ message: "Exercise archived", exercise });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete exercise" });
  }
};

// ── Review Queue ─────────────────────────────────────────────────────────────

export const getReviewQueue = async (_req, res) => {
  try {
    const [pending, flagged] = await Promise.all([
      pool.query(
        `SELECT c.*, u.name AS submitter_name, u.email AS submitter_email
         FROM contributions c
         LEFT JOIN users u ON u.id = c.user_id
         WHERE c.type IN ('audio','video','photo','oral_history','heritage','collection','proverb','exercise','news')
           AND c.status = 'pending'
         ORDER BY c.created_at ASC`
      ),
      pool.query(
        `SELECT c.*, u.name AS submitter_name, u.email AS submitter_email
         FROM contributions c
         LEFT JOIN users u ON u.id = c.user_id
         WHERE c.type = 'report'
           AND c.status IN ('pending','active')
         ORDER BY c.created_at ASC`
      ),
    ]);
    res.json({ pending: pending.rows, flagged: flagged.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load review queue' });
  }
};

export const approveReviewItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { edits } = req.body || {};

    const item = await pool.query(`SELECT * FROM contributions WHERE id = $1`, [id]);
    if (!item.rows[0]) return res.status(404).json({ error: 'Item not found' });

    await pool.query(
      `UPDATE contributions SET status = 'verified', updated_at = NOW() WHERE id = $1`,
      [id]
    );

    res.json({ success: true, message: 'Item approved' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to approve item' });
  }
};

export const rejectReviewItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body || {};

    const item = await pool.query(`SELECT * FROM contributions WHERE id = $1`, [id]);
    if (!item.rows[0]) return res.status(404).json({ error: 'Item not found' });

    await pool.query(
      `UPDATE contributions
       SET status = 'rejected', description = COALESCE(description,'') || $1, updated_at = NOW()
       WHERE id = $2`,
      [reason ? `\n\n[Rejected: ${reason}]` : '', id]
    );

    res.json({ success: true, message: 'Item rejected' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to reject item' });
  }
};

export const getNews = async (_req, res) => {
  try {
    const news = await NewsModel.getPublished();
    res.json({ news });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load news" });
  }
};

export const createNews = async (req, res) => {
  try {
    const news = await NewsModel.create({ ...req.body, created_by: req.user.id });
    res.status(201).json(news);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create news" });
  }
};

export const updateNews = async (req, res) => {
  try {
    const news = await NewsModel.update(req.params.id, req.body);
    if (!news) return res.status(404).json({ error: "News post not found" });
    res.json(news);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update news" });
  }
};

export const deleteNews = async (req, res) => {
  try {
    const news = await NewsModel.delete(req.params.id);
    if (!news) return res.status(404).json({ error: "News post not found" });
    res.json({ message: "News deleted", news });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete news" });
  }
};

// ── Engagement (what users actually do on their dashboard) ───────────────────
// Each query is isolated so a missing optional table (e.g. view_history before
// its first use) never breaks the whole admin dashboard.
const safeRows = async (sql, params = [], fallback = []) => {
  try {
    const result = await pool.query(sql, params);
    return result.rows;
  } catch (err) {
    console.error("Admin engagement query failed:", err.message);
    return fallback;
  }
};
const safeCount = async (sql, params = []) => {
  const rows = await safeRows(sql, params, [{ count: 0 }]);
  return Number(rows[0]?.count || 0);
};

const titleText = (value) => {
  if (!value) return "";
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      if (parsed && typeof parsed === "object") return parsed.en || parsed.rw || parsed.fr || value;
    } catch { /* plain text */ }
    return value;
  }
  return value.en || value.rw || value.fr || "";
};

export const getAdminEngagement = async (_req, res) => {
  try {
    await ensureAiSchema().catch(() => {});
    const [
      totals,
      views,
      views7,
      saves,
      badges,
      aiTotal,
      aiToday,
      dailyLogins,
      monthlyViews,
      topViewed,
      topLearners,
      levels,
      explorerTypes,
      contributors,
      recentUsers,
      recentContributions,
      recentNews,
      recentAi,
    ] = await Promise.all([
      safeRows(`
        SELECT COALESCE(SUM(xp), 0)::bigint AS total_xp,
               COALESCE(ROUND(AVG(level)::numeric, 1), 0) AS avg_level,
               COALESCE(MAX(best_streak), 0)::int AS best_streak,
               COUNT(*) FILTER (WHERE current_streak > 0)::int AS on_streak,
               COUNT(*) FILTER (WHERE last_login_date >= CURRENT_DATE - 6)::int AS active7,
               COUNT(*) FILTER (WHERE last_login_date >= CURRENT_DATE - 29)::int AS active30,
               COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days')::int AS new7
        FROM users WHERE role != 'admin'`, [], [{}]),
      safeCount(`SELECT COUNT(*)::int AS count FROM view_history`),
      safeCount(`SELECT COUNT(*)::int AS count FROM view_history WHERE viewed_at >= NOW() - INTERVAL '7 days'`),
      safeCount(`SELECT COUNT(*)::int AS count FROM saved_items`),
      safeCount(`SELECT COUNT(*)::int AS count FROM user_badges`),
      safeCount(`SELECT COUNT(*)::int AS count FROM ai_usage`),
      safeCount(`SELECT COUNT(*)::int AS count FROM ai_usage WHERE created_at >= date_trunc('day', NOW())`),
      safeRows(`
        SELECT to_char(d.day, 'YYYY-MM-DD') AS label, COUNT(s.id)::int AS value
        FROM generate_series(CURRENT_DATE - 13, CURRENT_DATE, INTERVAL '1 day') AS d(day)
        LEFT JOIN daily_streaks s ON s.login_date = d.day::date
        GROUP BY d.day ORDER BY d.day`),
      safeRows(`
        SELECT to_char(date_trunc('month', viewed_at), 'Mon YYYY') AS label, COUNT(*)::int AS value
        FROM view_history
        WHERE viewed_at >= date_trunc('month', NOW()) - INTERVAL '5 months'
        GROUP BY date_trunc('month', viewed_at) ORDER BY date_trunc('month', viewed_at)`),
      safeRows(`
        SELECT title, item_type AS type, COUNT(*)::int AS views, COUNT(DISTINCT user_id)::int AS viewers
        FROM view_history GROUP BY title, item_type ORDER BY views DESC LIMIT 8`),
      safeRows(`
        SELECT id, name, xp, level, current_streak, best_streak, last_login_date, explorer_type
        FROM users WHERE role != 'admin' ORDER BY xp DESC NULLS LAST, best_streak DESC LIMIT 10`),
      safeRows(`
        SELECT l.level, l.name, COUNT(u.id)::int AS users
        FROM levels l LEFT JOIN users u ON u.level = l.level AND u.role != 'admin'
        GROUP BY l.level, l.name ORDER BY l.level`),
      safeRows(`
        SELECT COALESCE(explorer_type, 'Not chosen') AS label, COUNT(*)::int AS value
        FROM users WHERE role != 'admin' GROUP BY 1 ORDER BY 2 DESC`),
      safeRows(`
        SELECT COALESCE(u.name, c.contributor_name) AS name,
               COALESCE(u.email, c.contributor_email) AS email,
               COUNT(*) FILTER (WHERE c.type <> 'report')::int AS submissions,
               COUNT(*) FILTER (WHERE c.type = 'report')::int AS reports,
               COUNT(*) FILTER (WHERE c.status = 'verified')::int AS approved,
               COUNT(*) FILTER (WHERE c.status = 'pending')::int AS pending,
               COUNT(*) FILTER (WHERE c.status = 'rejected')::int AS rejected,
               MAX(c.created_at) AS last_at
        FROM contributions c LEFT JOIN users u ON u.id = c.user_id
        WHERE COALESCE(u.role, 'user') != 'admin'
        GROUP BY 1, 2 ORDER BY submissions DESC, last_at DESC LIMIT 50`),
      safeRows(`SELECT name, role, created_at FROM users WHERE role != 'admin' ORDER BY created_at DESC LIMIT 8`),
      safeRows(`
        SELECT c.type, c.title, c.status, c.created_at, COALESCE(u.name, c.contributor_name) AS name
        FROM contributions c LEFT JOIN users u ON u.id = c.user_id
        ORDER BY c.created_at DESC LIMIT 8`),
      safeRows(`SELECT title, status, created_at FROM news_posts ORDER BY created_at DESC LIMIT 5`),
      safeRows(`
        SELECT a.status, a.flagged, a.created_at,
               CASE WHEN u.role = 'admin' THEN 'Administrator' ELSE u.name END AS name
        FROM ai_usage a LEFT JOIN users u ON u.id = a.user_id
        WHERE a.flagged OR a.status <> 'ok'
        ORDER BY a.created_at DESC LIMIT 5`),
    ]);

    const recentActivity = [
      ...recentUsers.map((row) => ({ kind: "user", title: `${row.name || "A new user"} joined`, detail: row.role || "user", at: row.created_at })),
      ...recentContributions.map((row) => ({
        kind: row.type === "report" ? "report" : "contribution",
        title: row.type === "report"
          ? `Report: ${titleText(row.title) || "content"}`
          : `${String(row.type || "item").replace("_", " ")} submitted: ${titleText(row.title) || "Untitled"}`,
        detail: `${row.name || "Anonymous"} - ${row.status}`,
        at: row.created_at,
      })),
      ...recentNews.map((row) => ({ kind: "news", title: `News ${row.status}: ${titleText(row.title) || "Untitled"}`, detail: "News desk", at: row.created_at })),
      ...recentAi.map((row) => ({
        kind: "ai",
        title: row.flagged ? "Sensitive AI question flagged" : `AI request ${String(row.status).replace("_", " ")}`,
        detail: row.name || "Unknown user",
        at: row.created_at,
      })),
    ]
      .filter((row) => row.at)
      .sort((a, b) => new Date(b.at) - new Date(a.at))
      .slice(0, 12);

    const t = totals[0] || {};
    res.json({
      totals: {
        ...t,
        total_xp: Number(t.total_xp || 0),
        avg_level: Number(t.avg_level || 0),
        views,
        views7,
        saves,
        badges,
        aiTotal,
        aiToday,
      },
      dailyLogins,
      monthlyViews,
      topViewed,
      topLearners,
      levels,
      explorerTypes,
      contributors,
      recentActivity,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load engagement" });
  }
};

// All community submissions and reports, newest first (not only pending ones).
export const getAdminContributions = async (_req, res) => {
  const rows = await safeRows(`
    SELECT c.id, c.type, c.title, c.item_type, c.item_id, c.description, c.status, c.file_url,
           c.created_at, COALESCE(u.name, c.contributor_name) AS name,
           CASE WHEN u.role = 'admin' THEN NULL ELSE COALESCE(u.email, c.contributor_email) END AS email
    FROM contributions c LEFT JOIN users u ON u.id = c.user_id
    ORDER BY c.created_at DESC LIMIT 300`);
  res.json({ contributions: rows });
};
