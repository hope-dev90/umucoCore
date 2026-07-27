import pool from "../config/db.js";

const SavedModel = {
  async getByUser(userId) {
    const result = await pool.query(
      `SELECT id, user_id, item_type, item_id, item_title, item_subtitle, item_image, item_meta, created_at
       FROM saved_items
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [userId]
    );
    return result.rows;
  },

  async create(data) {
    const { userId, itemType, itemId, itemTitle, itemSubtitle, itemImage, itemMeta } = data;

    // Truncate fields that were formerly varchar(255) — now text, but guard anyway
    const safeTitle    = itemTitle    ? String(itemTitle).slice(0, 500)    : null;
    const safeSubtitle = itemSubtitle ? String(itemSubtitle).slice(0, 500) : null;
    const safeImage    = itemImage    ? String(itemImage).slice(0, 2000)   : null;

    const result = await pool.query(
      `INSERT INTO saved_items (user_id, item_type, item_id, item_title, item_subtitle, item_image, item_meta)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (user_id, item_type, item_id) DO UPDATE SET created_at = NOW()
       RETURNING *`,
      [userId, itemType, itemId, safeTitle, safeSubtitle, safeImage, itemMeta]
    );
    return result.rows[0];
  },

  async delete(userId, itemId) {
    const result = await pool.query(
      `DELETE FROM saved_items WHERE user_id = $1 AND item_id = $2 RETURNING *`,
      [userId, itemId]
    );
    return result.rows[0];
  },

  async checkSaved(userId, itemId) {
    const result = await pool.query(
      `SELECT * FROM saved_items WHERE user_id = $1 AND item_id = $2`,
      [userId, itemId]
    );
    return result.rows[0] || null;
  }
};

export default SavedModel;
