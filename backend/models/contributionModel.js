import pool from "../config/db.js";

const ContributionsModel = {
  async create(data) {
    const { user_id, contributor_name, contributor_email, type, title, file_url, file_name, file_size, mime_type, description, status } = data;
    const result = await pool.query(
      `INSERT INTO contributions (user_id, contributor_name, contributor_email, type, title, file_url, file_name, file_size, mime_type, description, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [user_id, contributor_name, contributor_email, type, title, file_url, file_name, file_size, mime_type, description, status || 'pending']
    );
    return result.rows[0];
  },

  async getAll(filters = {}) {
    const params = [];
    let query = `SELECT * FROM contributions WHERE 1=1`;

    if (filters.status) {
      params.push(filters.status);
      query += ` AND status = $${params.length}`;
    }
    if (filters.type) {
      params.push(filters.type);
      query += ` AND type = $${params.length}`;
    }
    if (filters.user_id) {
      params.push(filters.user_id);
      query += ` AND user_id = $${params.length}`;
    }

    query += ` ORDER BY created_at DESC`;
    const result = await pool.query(query, params);
    return result.rows;
  },

  async getById(id) {
    const result = await pool.query(
      `SELECT * FROM contributions WHERE id = $1`,
      [id]
    );
    return result.rows[0];
  },

  async updateStatus(id, status) {
    const result = await pool.query(
      `UPDATE contributions SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
      [status, id]
    );
    return result.rows[0];
  },

  async delete(id) {
    const result = await pool.query(
      `DELETE FROM contributions WHERE id = $1 RETURNING *`,
      [id]
    );
    return result.rows[0];
  },

  async getStats() {
    const result = await pool.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending,
        COUNT(CASE WHEN status = 'verified' THEN 1 END) as verified,
        COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected
      FROM contributions
    `);
    return result.rows[0];
  }
};

export default ContributionsModel;
