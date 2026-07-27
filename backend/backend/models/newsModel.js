import pool from "../config/db.js";

const ensureNewsTable = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS news_posts (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      summary TEXT,
      body TEXT,
      image_url VARCHAR(255),
      category VARCHAR(100),
      status VARCHAR(30) DEFAULT 'draft',
      is_featured BOOLEAN DEFAULT false,
      created_by INTEGER REFERENCES users(id),
      published_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS idx_news_status ON news_posts(status);
    CREATE INDEX IF NOT EXISTS idx_news_category ON news_posts(category);
  `);
};

const NewsModel = {
  async getAll(filters = {}) {
    await ensureNewsTable();
    const params = [];
    let query = "SELECT * FROM news_posts WHERE 1=1";

    if (filters.status) {
      params.push(filters.status);
      query += ` AND status = $${params.length}`;
    }

    query += " ORDER BY COALESCE(published_at, created_at) DESC";
    const result = await pool.query(query, params);
    return result.rows;
  },

  async getPublished() {
    await ensureNewsTable();
    const result = await pool.query(
      "SELECT * FROM news_posts WHERE status = 'published' ORDER BY COALESCE(published_at, created_at) DESC",
    );
    return result.rows;
  },

  async create(data) {
    await ensureNewsTable();
    const { title, summary, body, image_url, category, status, is_featured, created_by } = data;
    const result = await pool.query(
      `INSERT INTO news_posts (title, summary, body, image_url, category, status, is_featured, created_by, published_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CASE WHEN $6 = 'published' THEN NOW() ELSE NULL END)
       RETURNING *`,
      [title, summary, body, image_url, category, status || "draft", Boolean(is_featured), created_by],
    );
    return result.rows[0];
  },

  async update(id, data) {
    await ensureNewsTable();
    const { title, summary, body, image_url, category, status, is_featured } = data;
    const result = await pool.query(
      `UPDATE news_posts
       SET title = COALESCE($1, title),
           summary = COALESCE($2, summary),
           body = COALESCE($3, body),
           image_url = COALESCE($4, image_url),
           category = COALESCE($5, category),
           status = COALESCE($6, status),
           is_featured = COALESCE($7, is_featured),
           published_at = CASE
             WHEN COALESCE($6, status) = 'published' AND published_at IS NULL THEN NOW()
             WHEN COALESCE($6, status) != 'published' THEN NULL
             ELSE published_at
           END,
           updated_at = NOW()
       WHERE id = $8
       RETURNING *`,
      [title, summary, body, image_url, category, status, is_featured, id],
    );
    return result.rows[0];
  },

  async delete(id) {
    await ensureNewsTable();
    const result = await pool.query("DELETE FROM news_posts WHERE id = $1 RETURNING *", [id]);
    return result.rows[0];
  },
};

export default NewsModel;
