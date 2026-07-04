import pool from "../config/db.js";

const CalendarModel = {
  async getAll(filters = {}) {
    const params = [];
    let query = `SELECT * FROM calendar_events WHERE 1=1`;

    if (filters.event_type) {
      params.push(filters.event_type);
      query += ` AND event_type = $${params.length}`;
    }
    if (filters.month && filters.year) {
      query += ` AND EXTRACT(MONTH FROM event_date) = $${params.length + 1} AND EXTRACT(YEAR FROM event_date) = $${params.length + 2}`;
      params.push(filters.month, filters.year);
    }

    query += ` ORDER BY event_date ASC`;
    const result = await pool.query(query, params);
    return result.rows;
  },

  async getUpcoming() {
    const result = await pool.query(
      `SELECT * FROM calendar_events WHERE event_date >= CURRENT_DATE ORDER BY event_date ASC LIMIT 10`
    );
    return result.rows;
  },

  async getToday() {
    const result = await pool.query(
      `SELECT * FROM calendar_events WHERE event_date = CURRENT_DATE`
    );
    return result.rows;
  },

  async getById(id) {
    const result = await pool.query(`SELECT * FROM calendar_events WHERE id = $1`, [id]);
    return result.rows[0];
  },

  async create(data) {
    const { title, description, event_date, event_type, location, is_featured, created_by } = data;
    const result = await pool.query(
      `INSERT INTO calendar_events (title, description, event_date, event_type, location, is_featured, created_by) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) 
       RETURNING *`,
      [title, description, event_date, event_type, location, is_featured, created_by]
    );
    return result.rows[0];
  },

  async update(id, data) {
    const { title, description, event_date, event_type, location, is_featured } = data;
    const result = await pool.query(
      `UPDATE calendar_events 
       SET title = COALESCE($1, title), 
           description = COALESCE($2, description), 
           event_date = COALESCE($3, event_date), 
           event_type = COALESCE($4, event_type), 
           location = COALESCE($5, location), 
           is_featured = COALESCE($6, is_featured),
           updated_at = NOW()
       WHERE id = $7 
       RETURNING *`,
      [title, description, event_date, event_type, location, is_featured, id]
    );
    return result.rows[0];
  },

  async delete(id) {
    const result = await pool.query(`DELETE FROM calendar_events WHERE id = $1 RETURNING *`, [id]);
    return result.rows[0];
  },
};

export default CalendarModel;
