import pool from "../config/db.js";

const CollectionsModel = {
  async getAll(filters = {}) {
    const params = [];
    let query = `SELECT * FROM collections WHERE is_active = true`;

    if (filters.category) {
      params.push(filters.category);
      query += ` AND category = $${params.length}`;
    }

    query += ` ORDER BY created_at DESC`;
    const result = await pool.query(query, params);
    return result.rows;
  },

  async getById(id) {
    const result = await pool.query(
      `SELECT * FROM collections WHERE id = $1 AND is_active = true`,
      [id]
    );
    return result.rows[0];
  },

  async create(data) {
    const { title, description, category, image_url, curated_by } = data;
    const result = await pool.query(
      `INSERT INTO collections (title, description, category, image_url, curated_by) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING *`,
      [title, description, category, image_url, curated_by]
    );
    return result.rows[0];
  },

  async update(id, data) {
    const { title, description, category, image_url, curated_by, is_active } = data;
    const result = await pool.query(
      `UPDATE collections 
       SET title = COALESCE($1, title), 
           description = COALESCE($2, description), 
           category = COALESCE($3, category), 
           image_url = COALESCE($4, image_url), 
           curated_by = COALESCE($5, curated_by),
           is_active = COALESCE($6, is_active),
           updated_at = NOW()
       WHERE id = $7 
       RETURNING *`,
      [title, description, category, image_url, curated_by, is_active, id]
    );
    return result.rows[0];
  },

  async delete(id) {
    const result = await pool.query(
      `UPDATE collections SET is_active = false, updated_at = NOW() WHERE id = $1 RETURNING *`,
      [id]
    );
    return result.rows[0];
  },
};

export default CollectionsModel;
