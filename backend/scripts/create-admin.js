/**
 * create-admin.js — Secure admin account provisioning script.
 *
 * USAGE (must be run with the guard flag):
 *   ADMIN_SCRIPT=1 node backend/scripts/create-admin.js --email=you@example.com --password=StrongPass123!
 *
 * Rules:
 *  - Cannot be run with `node backend/scripts/create-admin.js` directly (no guard flag).
 *  - Only accepts --email and --password. Name is auto-generated (anonymous).
 *  - The real email is never stored in the `name` or any display field.
 *  - The stored `name` is a random codename so `SELECT * FROM users` reveals nothing.
 */

// ── Guard: block direct `node` invocation without the secret env flag ──────────
if (!process.env.ADMIN_SCRIPT) {
  console.error(
    "\n  ✗  Forbidden: do not run this script directly.\n" +
    "     Use:  ADMIN_SCRIPT=1 node backend/scripts/create-admin.js --email=... --password=...\n"
  );
  process.exit(1);
}

import bcrypt from "bcryptjs";
import pool from "../config/db.js";
import { connectDB } from "../config/db.js";
import { findUserByEmail } from "../models/userModels.js";

// ── Anonymous codename generator ────────────────────────────────────────────────
const ADJECTIVES = [
  "Silent", "Shadow", "Veiled", "Hidden", "Unseen", "Masked", "Quiet",
  "Shrouded", "Nameless", "Faceless", "Ghostly", "Hollow", "Muted", "Cloaked",
];
const NOUNS = [
  "Sentinel", "Warden", "Guardian", "Keeper", "Overseer", "Steward",
  "Custodian", "Monitor", "Arbiter", "Curator", "Watchman", "Protector",
];
const generateCodename = () => {
  const adj  = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
  const num  = Math.floor(1000 + Math.random() * 9000);
  return `${adj}${noun}${num}`;
};

// ── Arg parser ──────────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const getArg = (name) => {
  const prefix = `--${name}=`;
  const match  = args.find((a) => a.startsWith(prefix));
  return match ? match.slice(prefix.length).trim() : null;
};

const email    = getArg("email");
const password = getArg("password");

if (!email || !password) {
  console.error(
    "\n  ✗  Missing required arguments.\n" +
    "     Usage: ADMIN_SCRIPT=1 node backend/scripts/create-admin.js \\\n" +
    "              --email=admin@example.com --password=StrongPass123!\n"
  );
  process.exit(1);
}

if (password.length < 8) {
  console.error("  ✗  Password must be at least 8 characters.");
  process.exit(1);
}

// Basic email format check
if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
  console.error("  ✗  Invalid email format.");
  process.exit(1);
}

// ── Main ────────────────────────────────────────────────────────────────────────
try {
  await connectDB();

  const hashedPassword = await bcrypt.hash(password, 12);
  const codename       = generateCodename();
  const existing       = await findUserByEmail(email);

  let result;

  if (existing) {
    // Update: re-anonymise everything, assign a fresh codename
    result = await pool.query(
      `UPDATE users
       SET name         = $1,
           password     = $2,
           role         = 'admin',
           is_verified  = true,
           is_anonymous = true,
           bio          = NULL,
           avatar       = NULL,
           google_id    = NULL,
           explorer_type = NULL,
           otp          = NULL,
           otp_expires  = NULL,
           updated_at   = NOW()
       WHERE email = $3
       RETURNING id, role, is_verified, is_anonymous`,
      [codename, hashedPassword, email],
    );
    console.log("  ✓  Updated existing account to admin (re-anonymised).");
  } else {
    // Insert: store only codename + hashed password, null everything identifying
    result = await pool.query(
      `INSERT INTO users
         (name, email, password, role, is_verified, is_anonymous,
          bio, avatar, google_id, explorer_type)
       VALUES ($1, $2, $3, 'admin', true, true,
               NULL, NULL, NULL, NULL)
       RETURNING id, role, is_verified, is_anonymous`,
      [codename, email, hashedPassword],
    );
    console.log("  ✓  Created new admin account.");
  }

  const admin = result.rows[0];
  console.log(`\n  ID      : ${admin.id}`);
  console.log(`  Codename: ${codename}   (stored in DB — not the real email)`);
  console.log(`  Role    : ${admin.role}`);
  console.log(`  Anon    : ${admin.is_anonymous}`);
  console.log("\n  Keep the email & password in a secure vault. Do not commit them.\n");

  await pool.end();
  process.exit(0);
} catch (err) {
  console.error("  ✗  Failed:", err.message);
  await pool.end().catch(() => {});
  process.exit(1);
}
