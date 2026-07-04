import pool from "../config/db.js";

const KwibukaModel = {
  async getAll(filters = {}) {
    const params = [];
    let query = `SELECT * FROM kwibuka_content WHERE 1=1`;

    if (filters.type) {
      params.push(filters.type);
      query += ` AND type = $${params.length}`;
    }

    query += ` ORDER BY created_at DESC`;
    const result = await pool.query(query, params);
    return result.rows;
  },

  async getFeatured() {
    const result = await pool.query(
      `SELECT * FROM kwibuka_content WHERE is_featured = true ORDER BY created_at DESC LIMIT 5`
    );
    return result.rows;
  },

  async getById(id) {
    const result = await pool.query(`SELECT * FROM kwibuka_content WHERE id = $1`, [id]);
    return result.rows[0];
  },

  async create(data) {
    const { title, type, content, media_url, date, is_featured } = data;
    const result = await pool.query(
      `INSERT INTO kwibuka_content (title, type, content, media_url, date, is_featured) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING *`,
      [title, type, content, media_url, date, is_featured]
    );
    return result.rows[0];
  },

  async update(id, data) {
    const { title, type, content, media_url, date, is_featured } = data;
    const result = await pool.query(
      `UPDATE kwibuka_content 
       SET title = COALESCE($1, title), 
           type = COALESCE($2, type), 
           content = COALESCE($3, content), 
           media_url = COALESCE($4, media_url), 
           date = COALESCE($5, date), 
           is_featured = COALESCE($6, is_featured),
           updated_at = NOW()
       WHERE id = $7 
       RETURNING *`,
      [title, type, content, media_url, date, is_featured, id]
    );
    return result.rows[0];
  },

  async delete(id) {
    const result = await pool.query(`DELETE FROM kwibuka_content WHERE id = $1 RETURNING *`, [id]);
    return result.rows[0];
  },
};

export default KwibukaModel;
