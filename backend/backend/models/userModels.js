import pool from "../config/db.js";

export const createUser = async ({ name, email, password, role, explorerType }) => {
  const result = await pool.query(
    `INSERT INTO users (name, email, password, role, explorer_type) 
     VALUES ($1, $2, $3, $4, $5) 
     RETURNING *`,
    [name, email, password, role || "user", explorerType || null],
  );
  return result.rows[0];
};

export const createGoogleUser = async ({ googleId, name, email, role }) => {
  const result = await pool.query(
    `INSERT INTO users (name, email, role, is_verified, google_id) 
     VALUES ($1, $2, $3, true, $4) 
     RETURNING *`,
    [name, email, role || "user", googleId],
  );
  return result.rows[0];
};

export const findUserByEmail = async (email) => {
  const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
  return result.rows[0];
};

export const findUserById = async (id) => {
  const result = await pool.query("SELECT * FROM users WHERE id = $1", [id]);
  return result.rows[0];
};

export const findUserByGoogleId = async (googleId) => {
  const result = await pool.query("SELECT * FROM users WHERE google_id = $1", [googleId]);
  return result.rows[0];
};

export const getAllUsers = async () => {
  const result = await pool.query("SELECT * FROM users ORDER BY name ASC");
  return result.rows;
};

export const saveOtp = async (email, otp) => {
  await pool.query(
    `UPDATE users 
     SET otp = $1, otp_expires = NOW() + interval '10 minutes', updated_at = NOW() 
     WHERE email = $2`,
    [otp, email],
  );
};

export const verifyOtp = async (email, otp) => {
  const anyMatch = await pool.query(
    `SELECT *, otp_expires > NOW() as is_valid FROM users 
     WHERE email = $1 AND otp = $2`,
    [email, otp],
  );
  if (anyMatch.rows.length === 0) return { error: "invalid" };
  if (!anyMatch.rows[0].is_valid) return { error: "expired" };
  return anyMatch.rows[0];
};

export const clearOtp = async (email) => {
  await pool.query(
    `UPDATE users 
     SET otp = NULL, otp_expires = NULL, updated_at = NOW() 
     WHERE email = $1`,
    [email],
  );
};

export const markEmailVerified = async (email) => {
  await pool.query(
    `UPDATE users 
     SET is_verified = true, updated_at = NOW() 
     WHERE email = $1`,
    [email],
  );
};

export const updatePassword = async (email, hashedPassword) => {
  await pool.query(
    `UPDATE users 
     SET password = $1, updated_at = NOW() 
     WHERE email = $2`,
    [hashedPassword, email],
  );
};

/**
 * Dynamically builds a parameterised UPDATE query.
 * Fix: each SET clause must use $N placeholders, not raw interpolation.
 */
export const updateUserProfile = async (id, updates) => {
  const entries = Object.entries(updates);
  if (entries.length === 0) return null;

  const setClauses = entries.map(([key], i) => key + " = $" + (i + 1));
  const values = entries.map(([, v]) => v);
  const idParam = "$" + (entries.length + 1);
  values.push(id);

  const result = await pool.query(
    "UPDATE users SET " + setClauses.join(", ") + ", updated_at = NOW() WHERE id = " + idParam + " RETURNING *",
    values,
  );
  return result.rows[0];
};

export const updateUserNotifications = async (id, notifications) => {
  const result = await pool.query(
    `UPDATE users 
     SET notifications = $1, updated_at = NOW() 
     WHERE id = $2 
     RETURNING *`,
    [notifications, id],
  );
  return result.rows[0];
};

export const updateUserAccessibility = async (id, accessibility) => {
  const result = await pool.query(
    `UPDATE users 
     SET accessibility = $1, updated_at = NOW() 
     WHERE id = $2 
     RETURNING *`,
    [accessibility, id],
  );
  return result.rows[0];
};

export const deleteUserById = async (id) => {
  await pool.query("DELETE FROM users WHERE id = $1", [id]);
  return true;
};
