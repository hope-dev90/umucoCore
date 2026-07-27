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
      countTable("users"),
      countTable("video_content"),
      countTable("audio_content"),
      countTable("heritage_items", "is_active = true"),
      countTable("collections", "is_active = true"),
      countTable("news_posts"),
      countTable("proverbs"),
      countTable("exercises", "is_active = true"),
      countTable("contributions"),
      countTable("users", "role = 'admin'"),
      countTable("users", "is_verified = true"),
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
      monthlyCounts("users"),
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
    res.json({ users: users.map(safeUser) });
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
