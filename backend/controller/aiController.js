import pool from "../config/db.js";

// ── Configuration ────────────────────────────────────────────────────────────
// The Gemini key lives only on the server (GEMINI_API_KEY), never in the browser.
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";
const GEMINI_API_BASE = process.env.GEMINI_API_BASE || "https://generativelanguage.googleapis.com/v1beta";
const GEMINI_URL = (model) => `${GEMINI_API_BASE}/models/${model}:generateContent`;
const REQUEST_TIMEOUT_MS = 25000;
const MAX_MESSAGE_CHARS = 2000;
const MAX_HISTORY = 20;
const LOGGED_PROMPT_CHARS = 1000;

export const DEFAULT_SETTINGS = {
  ai_enabled: true,
  ai_log_prompts: true,
  ai_flag_sensitive: true,
  ai_daily_limit: 50,
};

const SENSITIVE_PATTERN =
  /genoc|jenoside|g[ée]nocide|interahamwe|inyenzi|massacre|ethnic|hutu|tutsi|\btwa\b|kill|ubwicanyi|kwica|machete|militia|conflict/i;

const SYSTEM_PROMPTS = {
  en: "Your name is Umuco. You are an expert on Rwandan culture, history, and heritage. " +
    "Reply in English. Only answer questions related to Rwandan culture, history, heritage, " +
    "traditions, or regions. Politely decline unrelated questions. Treat the 1994 Genocide " +
    "against the Tutsi with accuracy and respect.",
  rw: "Witwa Umuco. Uri inzobere mu muco, amateka n'umurage w'u Rwanda. Subiza mu Kinyarwanda. " +
    "Ntusubize ibibazo bidafitanye isano n'umuco, amateka cyangwa uturere tw'u Rwanda. " +
    "Vuga ku Jenoside yakorewe Abatutsi mu 1994 ukuri kandi wubaha.",
  fr: "Tu t'appelles Umuco. Tu es un expert de la culture, de l'histoire et du patrimoine rwandais. " +
    "Réponds en français. Réponds uniquement aux questions liées à la culture, l'histoire, le patrimoine, " +
    "les traditions ou les régions du Rwanda. Décline poliment les questions sans rapport. Parle du " +
    "génocide perpétré contre les Tutsi en 1994 avec exactitude et respect.",
};

// ── Schema (created lazily, once per process) ────────────────────────────────
let schemaReady = null;
export const ensureAiSchema = () => {
  if (!schemaReady) {
    schemaReady = pool.query(`
      CREATE TABLE IF NOT EXISTS ai_usage (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        language VARCHAR(10),
        prompt TEXT,
        prompt_chars INTEGER DEFAULT 0,
        reply_chars INTEGER DEFAULT 0,
        input_tokens INTEGER DEFAULT 0,
        output_tokens INTEGER DEFAULT 0,
        latency_ms INTEGER DEFAULT 0,
        status VARCHAR(30) NOT NULL,
        error TEXT,
        flagged BOOLEAN DEFAULT false,
        model VARCHAR(80),
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_ai_usage_created ON ai_usage(created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_ai_usage_user ON ai_usage(user_id, created_at DESC);

      CREATE TABLE IF NOT EXISTS app_settings (
        key VARCHAR(80) PRIMARY KEY,
        value JSONB NOT NULL,
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `).catch((err) => {
      schemaReady = null;
      throw err;
    });
  }
  return schemaReady;
};

export const readSettings = async () => {
  await ensureAiSchema();
  const result = await pool.query(`SELECT key, value FROM app_settings`);
  const stored = Object.fromEntries(result.rows.map((row) => [row.key, row.value]));
  return { ...DEFAULT_SETTINGS, ...stored };
};

export const writeSettings = async (updates) => {
  await ensureAiSchema();
  const clean = {};
  if (typeof updates.ai_enabled === "boolean") clean.ai_enabled = updates.ai_enabled;
  if (typeof updates.ai_log_prompts === "boolean") clean.ai_log_prompts = updates.ai_log_prompts;
  if (typeof updates.ai_flag_sensitive === "boolean") clean.ai_flag_sensitive = updates.ai_flag_sensitive;
  if (updates.ai_daily_limit !== undefined) {
    const limit = Number(updates.ai_daily_limit);
    if (!Number.isInteger(limit) || limit < 1 || limit > 1000) {
      const err = new Error("Daily limit must be a whole number between 1 and 1000");
      err.status = 400;
      throw err;
    }
    clean.ai_daily_limit = limit;
  }
  for (const [key, value] of Object.entries(clean)) {
    await pool.query(
      `INSERT INTO app_settings (key, value, updated_at) VALUES ($1, $2::jsonb, NOW())
       ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()`,
      [key, JSON.stringify(value)],
    );
  }
  return readSettings();
};

const logUsage = async (row) => {
  try {
    await pool.query(
      `INSERT INTO ai_usage (user_id, language, prompt, prompt_chars, reply_chars, input_tokens,
                             output_tokens, latency_ms, status, error, flagged, model)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`,
      [
        row.userId || null, row.language, row.prompt, row.promptChars || 0, row.replyChars || 0,
        row.inputTokens || 0, row.outputTokens || 0, row.latencyMs || 0, row.status,
        row.error || null, !!row.flagged, GEMINI_MODEL,
      ],
    );
  } catch (err) {
    console.error("AI usage log failed:", err.message);
  }
};

// ── POST /api/ai/chat ────────────────────────────────────────────────────────
export const chat = async (req, res) => {
  const started = Date.now();
  const language = ["en", "rw", "fr"].includes(req.body?.language) ? req.body.language : "en";
  const message = typeof req.body?.message === "string" ? req.body.message.trim() : "";
  const rawHistory = Array.isArray(req.body?.history) ? req.body.history : [];

  if (!message) return res.status(400).json({ code: "empty", error: "Message is required" });
  if (message.length > MAX_MESSAGE_CHARS) {
    return res.status(400).json({ code: "too_long", error: `Message must be under ${MAX_MESSAGE_CHARS} characters` });
  }

  let settings;
  try {
    settings = await readSettings();
  } catch (err) {
    console.error("AI settings unavailable:", err.message);
    return res.status(500).json({ code: "server_error", error: "AI service unavailable" });
  }

  const flagged = settings.ai_flag_sensitive && SENSITIVE_PATTERN.test(message);
  const base = {
    userId: req.user.id,
    language,
    prompt: settings.ai_log_prompts ? message.slice(0, LOGGED_PROMPT_CHARS) : null,
    promptChars: message.length,
    flagged,
  };

  if (!settings.ai_enabled) {
    await logUsage({ ...base, status: "disabled" });
    return res.status(503).json({ code: "disabled", error: "The AI assistant is turned off by the administrators" });
  }

  const usedToday = await pool.query(
    `SELECT COUNT(*)::int AS count FROM ai_usage
     WHERE user_id = $1 AND status = 'ok' AND created_at >= date_trunc('day', NOW())`,
    [req.user.id],
  );
  if ((usedToday.rows[0]?.count || 0) >= settings.ai_daily_limit) {
    await logUsage({ ...base, status: "limited" });
    return res.status(429).json({ code: "limit", error: "Daily AI question limit reached. Try again tomorrow." });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    await logUsage({ ...base, status: "not_configured", error: "GEMINI_API_KEY is not set on the server" });
    return res.status(503).json({ code: "not_configured", error: "The AI assistant is not configured yet" });
  }

  const history = rawHistory
    .filter((m) => m && (m.role === "user" || m.role === "model") && typeof m.parts === "string" && m.parts.trim())
    .slice(-MAX_HISTORY)
    .map((m) => ({ role: m.role, parts: [{ text: m.parts.slice(0, MAX_MESSAGE_CHARS) }] }));

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const response = await fetch(GEMINI_URL(GEMINI_MODEL), {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
      signal: controller.signal,
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM_PROMPTS[language] }] },
        contents: [...history, { role: "user", parts: [{ text: message }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1024,
          // 2.5 models spend output tokens on "thinking"; keep them for the answer.
          ...(GEMINI_MODEL.includes("2.5") ? { thinkingConfig: { thinkingBudget: 0 } } : {}),
        },
      }),
    });

    const data = await response.json().catch(() => ({}));
    const usage = data?.usageMetadata || {};
    if (!response.ok) {
      const detail = data?.error?.message || `HTTP ${response.status}`;
      await logUsage({ ...base, status: "error", error: detail.slice(0, 500), latencyMs: Date.now() - started });
      console.error("Gemini error:", response.status, detail);
      return res.status(502).json({ code: "upstream", error: "The AI service could not answer right now" });
    }

    const reply = (data?.candidates?.[0]?.content?.parts || [])
      .map((part) => part.text || "")
      .join("")
      .trim();
    if (!reply) {
      const reason = data?.promptFeedback?.blockReason || data?.candidates?.[0]?.finishReason || "empty";
      await logUsage({ ...base, status: "blocked", error: String(reason), latencyMs: Date.now() - started,
        inputTokens: usage.promptTokenCount, outputTokens: usage.candidatesTokenCount });
      return res.status(502).json({ code: "blocked", error: "The AI could not answer that question" });
    }

    await logUsage({
      ...base,
      status: "ok",
      replyChars: reply.length,
      inputTokens: usage.promptTokenCount,
      outputTokens: usage.candidatesTokenCount,
      latencyMs: Date.now() - started,
    });
    res.json({
      reply,
      remainingToday: Math.max(0, settings.ai_daily_limit - (usedToday.rows[0]?.count || 0) - 1),
    });
  } catch (err) {
    const timedOut = err.name === "AbortError";
    await logUsage({ ...base, status: "error", error: timedOut ? "timeout" : err.message, latencyMs: Date.now() - started });
    console.error("AI chat failed:", err.message);
    res.status(timedOut ? 504 : 502).json({ code: timedOut ? "timeout" : "upstream", error: "The AI service could not answer right now" });
  } finally {
    clearTimeout(timer);
  }
};

// ── GET /api/ai/status ───────────────────────────────────────────────────────
export const status = async (req, res) => {
  try {
    const settings = await readSettings();
    const used = await pool.query(
      `SELECT COUNT(*)::int AS count FROM ai_usage
       WHERE user_id = $1 AND status = 'ok' AND created_at >= date_trunc('day', NOW())`,
      [req.user.id],
    );
    res.json({
      enabled: settings.ai_enabled,
      configured: !!process.env.GEMINI_API_KEY,
      dailyLimit: settings.ai_daily_limit,
      usedToday: used.rows[0]?.count || 0,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load AI status" });
  }
};

// ── Admin: GET /api/admin/ai-usage ───────────────────────────────────────────
export const getAiUsage = async (req, res) => {
  try {
    await ensureAiSchema();
    const days = Math.min(90, Math.max(7, parseInt(req.query.days, 10) || 30));
    const [summary, daily, byLanguage, byStatus, topUsers, recent, settings] = await Promise.all([
      pool.query(`
        SELECT COUNT(*)::int AS total,
               COUNT(*) FILTER (WHERE created_at >= date_trunc('day', NOW()))::int AS today,
               COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days')::int AS last7,
               COUNT(*) FILTER (WHERE status = 'ok')::int AS answered,
               COUNT(*) FILTER (WHERE status <> 'ok')::int AS failed,
               COUNT(*) FILTER (WHERE flagged)::int AS flagged,
               COUNT(DISTINCT user_id)::int AS users,
               COUNT(DISTINCT user_id) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days')::int AS users7,
               COALESCE(ROUND(AVG(latency_ms) FILTER (WHERE status = 'ok')), 0)::int AS avg_latency,
               COALESCE(SUM(input_tokens), 0)::bigint AS input_tokens,
               COALESCE(SUM(output_tokens), 0)::bigint AS output_tokens,
               MAX(created_at) AS last_at
        FROM ai_usage`),
      pool.query(`
        SELECT to_char(d.day, 'YYYY-MM-DD') AS day,
               COUNT(a.id)::int AS total,
               COUNT(a.id) FILTER (WHERE a.status = 'ok')::int AS answered
        FROM generate_series(date_trunc('day', NOW()) - ($1::int - 1) * INTERVAL '1 day',
                             date_trunc('day', NOW()), INTERVAL '1 day') AS d(day)
        LEFT JOIN ai_usage a ON date_trunc('day', a.created_at) = d.day
        GROUP BY d.day ORDER BY d.day`, [days]),
      pool.query(`SELECT COALESCE(language, 'en') AS label, COUNT(*)::int AS value FROM ai_usage GROUP BY 1 ORDER BY 2 DESC`),
      pool.query(`SELECT status AS label, COUNT(*)::int AS value FROM ai_usage GROUP BY 1 ORDER BY 2 DESC`),
      pool.query(`
        SELECT u.id, u.name, u.email, u.role, COUNT(a.id)::int AS queries, MAX(a.created_at) AS last_at
        FROM ai_usage a JOIN users u ON u.id = a.user_id
        GROUP BY u.id ORDER BY queries DESC, last_at DESC LIMIT 10`),
      pool.query(`
        SELECT a.id, a.language, a.prompt, a.prompt_chars, a.reply_chars, a.status, a.error, a.flagged,
               a.latency_ms, a.input_tokens, a.output_tokens, a.created_at,
               u.name AS user_name, u.email AS user_email, u.role AS user_role
        FROM ai_usage a LEFT JOIN users u ON u.id = a.user_id
        ORDER BY a.created_at DESC LIMIT 50`),
      readSettings(),
    ]);

    const hideAdmin = (row) => (row.role === "admin" || row.user_role === "admin"
      ? { ...row, name: row.name ? "Administrator" : row.name, email: undefined, user_name: row.user_name ? "Administrator" : row.user_name, user_email: undefined }
      : row);

    res.json({
      config: {
        configured: !!process.env.GEMINI_API_KEY,
        model: GEMINI_MODEL,
        enabled: settings.ai_enabled,
        dailyLimit: settings.ai_daily_limit,
        logPrompts: settings.ai_log_prompts,
        flagSensitive: settings.ai_flag_sensitive,
      },
      summary: summary.rows[0],
      daily: daily.rows,
      byLanguage: byLanguage.rows,
      byStatus: byStatus.rows,
      topUsers: topUsers.rows.map(hideAdmin),
      recent: recent.rows.map(hideAdmin),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load AI usage" });
  }
};

export const getSettings = async (_req, res) => {
  try {
    res.json({ settings: await readSettings() });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load settings" });
  }
};

export const updateSettings = async (req, res) => {
  try {
    res.json({ settings: await writeSettings(req.body || {}) });
  } catch (err) {
    if (err.status === 400) return res.status(400).json({ error: err.message });
    console.error(err);
    res.status(500).json({ error: "Failed to save settings" });
  }
};
