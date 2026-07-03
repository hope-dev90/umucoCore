import pool from "../config/db.js";

export const createUser = async ({ name, email, password, role }) => {
  const result = await pool.query(
    `INSERT INTO users (name, email, password, role) 
     VALUES ($1, $2, $3, $4) 
     RETURNING *`,
    [name, email, password, role || "user"],
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
  console.log("findUserByEmail called with email:", email);
  const result = await pool.query("SELECT * FROM users WHERE email = $1", [
    email,
  ]);
  console.log("findUserByEmail result row count:", result.rows.length);
  if (result.rows.length > 0) {
    console.log("findUserByEmail found user:", result.rows[0]);
  }
  return result.rows[0];
};

export const findUserById = async (id) => {
  const result = await pool.query("SELECT * FROM users WHERE id = $1", [id]);
  return result.rows[0];
};

export const findUserByGoogleId = async (googleId) => {
  const result = await pool.query("SELECT * FROM users WHERE google_id = $1", [
    googleId,
  ]);
  return result.rows[0];
};

export const getAllUsers = async () => {
  const result = await pool.query("SELECT * FROM users ORDER BY name ASC");
  return result.rows;
};

export const saveOtp = async (email, otp, expiresAt) => {
  await pool.query(
    `UPDATE users 
     SET otp = $1, otp_expires = $2, updated_at = NOW() 
     WHERE email = $3`,
    [otp, expiresAt, email],
  );
};

export const verifyOtp = async (email, otp) => {
  const result = await pool.query(
    `SELECT * FROM users 
     WHERE email = $1 AND otp = $2 AND otp_expires > NOW()`,
    [email, otp],
  );
  return result.rows[0];
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

export const updateUserProfile = async (id, updates) => {
  const setClauses = [];
  const values = [];
  let paramIndex = 1;

  for (const [key, value] of Object.entries(updates)) {
    setClauses.push(`${key} = $${paramIndex}`);
    values.push(value);
    paramIndex++;
  }

  setClauses.push(`updated_at = NOW()`);
  values.push(id);

  const result = await pool.query(
    `UPDATE users 
     SET ${setClauses.join(", ")} 
     WHERE id = $${paramIndex} 
     RETURNING *`,
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
