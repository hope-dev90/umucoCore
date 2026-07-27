import pool from "../config/db.js";

const ProverbModel = {
  async getAll(filters = {}) {
    const params = [];
    let query = `SELECT * FROM proverbs WHERE 1=1`;

    if (filters.language) {
      params.push(filters.language);
      query += ` AND language = $${params.length}`;
    }

    if (filters.category) {
      params.push(filters.category);
      query += ` AND category = $${params.length}`;
    }

    query += ` ORDER BY created_at DESC`;

    if (filters.limit) {
      params.push(filters.limit);
      query += ` LIMIT $${params.length}`;
    }

    const result = await pool.query(query, params);
    return result.rows;
  },

  async getFeatured(limit = 10) {
    // First try featured proverbs
    const featured = await pool.query(
      `SELECT * FROM proverbs WHERE is_featured = true ORDER BY created_at DESC LIMIT $1`,
      [limit]
    );
    // If not enough featured, return all proverbs up to limit
    if (featured.rows.length < 5) {
      const all = await pool.query(
        `SELECT * FROM proverbs ORDER BY created_at DESC LIMIT $1`,
        [limit]
      );
      return all.rows;
    }
    return featured.rows;
  },

  async getById(id) {
    const result = await pool.query(
      `SELECT * FROM proverbs WHERE id = $1`,
      [id]
    );
    return result.rows[0];
  },

  async create(data) {
    const { text, translation, language, category, source, is_featured } = data;
    const result = await pool.query(
      `INSERT INTO proverbs (text, translation, language, category, source, is_featured)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [text, translation, language, category, source, is_featured || false]
    );
    return result.rows[0];
  },

  async update(id, data) {
    const { text, translation, language, category, source, is_featured } = data;
    const result = await pool.query(
      `UPDATE proverbs
       SET text = COALESCE($1, text),
           translation = COALESCE($2, translation),
           language = COALESCE($3, language),
           category = COALESCE($4, category),
           source = COALESCE($5, source),
           is_featured = COALESCE($6, is_featured),
           updated_at = NOW()
       WHERE id = $7
       RETURNING *`,
      [text, translation, language, category, source, is_featured, id]
    );
    return result.rows[0];
  },

  async delete(id) {
    const result = await pool.query(
      `DELETE FROM proverbs WHERE id = $1 RETURNING *`,
      [id]
    );
    return result.rows[0];
  }
};

export default ProverbModel;
