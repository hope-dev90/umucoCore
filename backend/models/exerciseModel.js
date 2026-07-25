import pool from "../config/db.js";

const normalizeChoices = (choices) => {
  if (Array.isArray(choices)) return JSON.stringify(choices.filter(Boolean));
  if (typeof choices === "string") {
    return JSON.stringify(choices.split(/\r?\n|,/).map((item) => item.trim()).filter(Boolean));
  }
  return JSON.stringify([]);
};

const ExerciseModel = {
  async getAll(filters = {}) {
    const params = [];
    let query = `SELECT * FROM exercises WHERE 1=1`;

    if (filters.activeOnly !== false) query += ` AND is_active = true`;
    if (filters.item_type) {
      params.push(filters.item_type);
      query += ` AND item_type = $${params.length}`;
    }
    if (filters.item_id) {
      params.push(filters.item_id);
      query += ` AND item_id = $${params.length}`;
    }

    query += ` ORDER BY created_at DESC`;
    const result = await pool.query(query, params);
    return result.rows;
  },

  async getById(id) {
    const result = await pool.query(`SELECT * FROM exercises WHERE id = $1`, [id]);
    return result.rows[0];
  },

  async create(data) {
    const {
      item_type,
      item_id,
      title,
      prompt,
      choices,
      answer,
      explanation,
      difficulty,
      created_by,
      is_active,
    } = data;
    const result = await pool.query(
      `INSERT INTO exercises (item_type, item_id, title, prompt, choices, answer, explanation, difficulty, created_by, is_active)
       VALUES ($1, $2, $3, $4, $5::jsonb, $6, $7, $8, $9, $10)
       RETURNING *`,
      [
        item_type,
        item_id || null,
        title,
        prompt,
        normalizeChoices(choices),
        answer,
        explanation,
        difficulty || "Beginner",
        created_by,
        is_active ?? true,
      ],
    );
    return result.rows[0];
  },

  async update(id, data) {
    const result = await pool.query(
      `UPDATE exercises
       SET item_type = COALESCE($1, item_type),
           item_id = COALESCE($2, item_id),
           title = COALESCE($3, title),
           prompt = COALESCE($4, prompt),
           choices = COALESCE($5::jsonb, choices),
           answer = COALESCE($6, answer),
           explanation = COALESCE($7, explanation),
           difficulty = COALESCE($8, difficulty),
           is_active = COALESCE($9, is_active),
           updated_at = NOW()
       WHERE id = $10
       RETURNING *`,
      [
        data.item_type,
        data.item_id || null,
        data.title,
        data.prompt,
        data.choices === undefined ? null : normalizeChoices(data.choices),
        data.answer,
        data.explanation,
        data.difficulty,
        data.is_active,
        id,
      ],
    );
    return result.rows[0];
  },

  async delete(id) {
    const result = await pool.query(
      `UPDATE exercises SET is_active = false, updated_at = NOW() WHERE id = $1 RETURNING *`,
      [id],
    );
    return result.rows[0];
  },
};

export default ExerciseModel;
