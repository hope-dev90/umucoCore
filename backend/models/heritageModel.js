import pool from "../config/db.js";

const HeritageModel = {
  async getAll(filters = {}) {
    const params = [];
    let query = `SELECT * FROM heritage_items WHERE is_active = true`;

    if (filters.category) {
      params.push(filters.category);
      query += ` AND category = $${params.length}`;
    }
    if (filters.location) {
      params.push(filters.location);
      query += ` AND location = $${params.length}`;
    }
    if (filters.region) {
      params.push(filters.region);
      query += ` AND region = $${params.length}`;
    }

    query += ` ORDER BY created_at DESC`;
    const result = await pool.query(query, params);
    return result.rows;
  },

  async getById(id) {
    const result = await pool.query(
      `SELECT * FROM heritage_items WHERE id = $1 AND is_active = true`,
      [id]
    );
    return result.rows[0];
  },

  async create(data) {
    const { title, category, location, lat, lng, description, image_url, era, region, created_by } = data;
    const result = await pool.query(
      `INSERT INTO heritage_items (title, category, location, lat, lng, description, image_url, era, region, created_by) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
       RETURNING *`,
      [title, category, location, lat, lng, description, image_url, era, region, created_by]
    );
    return result.rows[0];
  },

  async update(id, data) {
    const { title, category, location, lat, lng, description, image_url, era, region, is_active } = data;
    const result = await pool.query(
      `UPDATE heritage_items 
       SET title = COALESCE($1, title), 
           category = COALESCE($2, category), 
           location = COALESCE($3, location), 
           lat = COALESCE($4, lat), 
           lng = COALESCE($5, lng), 
           description = COALESCE($6, description), 
           image_url = COALESCE($7, image_url), 
           era = COALESCE($8, era), 
           region = COALESCE($9, region),
           is_active = COALESCE($10, is_active),
           updated_at = NOW()
       WHERE id = $11 
       RETURNING *`,
      [title, category, location, lat, lng, description, image_url, era, region, is_active, id]
    );
    return result.rows[0];
  },

  async delete(id) {
    const result = await pool.query(
      `UPDATE heritage_items SET is_active = false, updated_at = NOW() WHERE id = $1 RETURNING *`,
      [id]
    );
    return result.rows[0];
  },

  async getNearest(lat, lng, radiusMeters = 500) {
    const query = `
      SELECT *,
        6371000 * 2 * asin(
          sqrt(
            power(sin(radians($1 - lat) / 2.0), 2) +
            cos(radians($1)) * cos(radians(lat)) * power(sin(radians($2 - lng) / 2.0), 2)
          )
        ) AS distance_m
      FROM heritage_items
      WHERE is_active = true
        AND lat IS NOT NULL
        AND lng IS NOT NULL
      ORDER BY distance_m ASC
      LIMIT 1
    `;
    const result = await pool.query(query, [lat, lng]);
    const row = result.rows[0];
    if (!row || Number(row.distance_m) > radiusMeters) return null;
    return row;
  },
};

export default HeritageModel;
