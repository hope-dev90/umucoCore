import pg from "pg";
import config from "./env.js";

const { Pool } = pg;

const pool = new Pool({
  host: config.db.host,
  port: config.db.port,
  database: config.db.database,
  user: config.db.user,
  password: config.db.password,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on("error", (err) => {
  console.error("Unexpected error on idle client", err);
  process.exit(-1);
});

const ensureAuthSchema = async (client) => {
  await client.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255),
      role VARCHAR(50) NOT NULL DEFAULT 'user',
      is_verified BOOLEAN DEFAULT false,
      otp VARCHAR(6),
      otp_expires TIMESTAMPTZ,
      google_id VARCHAR(255),
      bio TEXT,
      interests TEXT[] DEFAULT '{}',
      language VARCHAR(100) DEFAULT 'English (UK)',
      avatar VARCHAR(255),
      notifications JSONB DEFAULT '{"archiveUpdates": true, "newsletter": true, "eventReminders": true}'::jsonb,
      accessibility JSONB DEFAULT '{"fontSize": "medium", "highContrast": false, "reduceMotion": false}'::jsonb,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    ALTER TABLE users ADD COLUMN IF NOT EXISTS password VARCHAR(255);
    ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(50) NOT NULL DEFAULT 'user';
    ALTER TABLE users ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS otp VARCHAR(6);
    ALTER TABLE users ADD COLUMN IF NOT EXISTS otp_expires TIMESTAMPTZ;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS google_id VARCHAR(255);
    ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS interests TEXT[] DEFAULT '{}';
    ALTER TABLE users ADD COLUMN IF NOT EXISTS language VARCHAR(100) DEFAULT 'English (UK)';
    ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar VARCHAR(255);
    ALTER TABLE users ADD COLUMN IF NOT EXISTS notifications JSONB DEFAULT '{"archiveUpdates": true, "newsletter": true, "eventReminders": true}'::jsonb;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS accessibility JSONB DEFAULT '{"fontSize": "medium", "highContrast": false, "reduceMotion": false}'::jsonb;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
    ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id);
  `);
};

export const connectDB = async () => {
  try {
    const client = await pool.connect();
    console.log(`Connected to PostgreSQL database: ${config.db.database}`);
    await ensureAuthSchema(client);
    client.release();
  } catch (error) {
    console.error("Failed to connect to database:", error.message);
    process.exit(1);
  }
};

export default pool;
