import pool from "../config/db.js";

const AudioModel = {
  async getAll(filters = {}) {
    const params = [];
    let query = `SELECT * FROM audio_content WHERE 1=1`;

    if (filters.category) {
      params.push(filters.category);
      query += ` AND category = $${params.length}`;
    }

    query += ` ORDER BY created_at DESC`;
    const result = await pool.query(query, params);
    return result.rows;
  },

  async getFeatured() {
    const result = await pool.query(
      `SELECT * FROM audio_content WHERE is_featured = true ORDER BY created_at DESC LIMIT 10`
    );
    return result.rows;
  },

  async getById(id) {
    const result = await pool.query(
      `SELECT * FROM audio_content WHERE id = $1`,
      [id]
    );
    return result.rows[0];
  },

  async create(data) {
    const { title, description, audio_url, thumbnail_url, duration, category, is_featured, created_by } = data;
    const result = await pool.query(
      `INSERT INTO audio_content (title, description, audio_url, thumbnail_url, duration, category, is_featured, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [title, description, audio_url, thumbnail_url, duration, category, is_featured, created_by]
    );
    return result.rows[0];
  },

  async update(id, data) {
    const { title, description, audio_url, thumbnail_url, duration, category, is_featured } = data;
    const result = await pool.query(
      `UPDATE audio_content
       SET title = COALESCE($1, title),
           description = COALESCE($2, description),
           audio_url = COALESCE($3, audio_url),
           thumbnail_url = COALESCE($4, thumbnail_url),
           duration = COALESCE($5, duration),
           category = COALESCE($6, category),
           is_featured = COALESCE($7, is_featured),
           updated_at = NOW()
       WHERE id = $8
       RETURNING *`,
      [title, description, audio_url, thumbnail_url, duration, category, is_featured, id]
    );
    return result.rows[0];
  },

  async delete(id) {
    const result = await pool.query(
      `DELETE FROM audio_content WHERE id = $1 RETURNING *`,
      [id]
    );
    return result.rows[0];
  },
};

export default AudioModel;
