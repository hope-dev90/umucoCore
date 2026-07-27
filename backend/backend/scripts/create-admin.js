import bcrypt from "bcryptjs";
import pool from "../config/db.js";
import { connectDB } from "../config/db.js";
import { findUserByEmail } from "../models/userModels.js";

const args = process.argv.slice(2);

const getArg = (name, fallback) => {
  const prefix = `--${name}=`;
  const match = args.find((arg) => arg.startsWith(prefix));
  return match ? match.slice(prefix.length) : fallback;
};

const email = getArg("email", process.env.ADMIN_EMAIL || "admin@umucocore.test").trim().toLowerCase();
const password = getArg("password", process.env.ADMIN_PASSWORD || "AdminTest123!");
const name = getArg("name", process.env.ADMIN_NAME || "Umuco Admin").trim();

if (!email || !password || !name) {
  console.error("Usage: node scripts/create-admin.js --email=admin@example.com --password=StrongPass123! --name=\"Admin Name\"");
  process.exit(1);
}

if (password.length < 8) {
  console.error("Admin password must be at least 8 characters.");
  process.exit(1);
}

try {
  await connectDB();
  const hashedPassword = await bcrypt.hash(password, 12);
  const existing = await findUserByEmail(email);

  let result;
  if (existing) {
    result = await pool.query(
      `UPDATE users
       SET name = $1,
           password = $2,
           role = 'admin',
           is_verified = true,
           otp = NULL,
           otp_expires = NULL,
           updated_at = NOW()
       WHERE email = $3
       RETURNING id, name, email, role, is_verified`,
      [name, hashedPassword, email],
    );
    console.log("Updated existing admin account.");
  } else {
    result = await pool.query(
      `INSERT INTO users (name, email, password, role, is_verified)
       VALUES ($1, $2, $3, 'admin', true)
       RETURNING id, name, email, role, is_verified`,
      [name, email, hashedPassword],
    );
    console.log("Created new admin account.");
  }

  const admin = result.rows[0];
  console.log(`ID: ${admin.id}`);
  console.log(`Name: ${admin.name}`);
  console.log(`Email: ${admin.email}`);
  console.log(`Role: ${admin.role}`);
  console.log(`Verified: ${admin.is_verified}`);
  await pool.end();
  process.exit(0);
} catch (err) {
  console.error("Failed to create admin account:", err.message);
  await pool.end().catch(() => {});
  process.exit(1);
}
