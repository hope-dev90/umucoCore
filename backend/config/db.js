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

const ensureHeritageSchema = async (client) => {
  await client.query(`
    CREATE TABLE IF NOT EXISTS heritage_items (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      category VARCHAR(100) NOT NULL,
      location VARCHAR(255),
      lat NUMERIC(10,6),
      lng NUMERIC(10,6),
      description TEXT,
      image_url VARCHAR(255),
      era VARCHAR(100),
      region VARCHAR(100),
      created_by INTEGER REFERENCES users(id),
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS calendar_events (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      event_date DATE NOT NULL,
      event_type VARCHAR(100) NOT NULL,
      location VARCHAR(255),
      is_featured BOOLEAN DEFAULT false,
      created_by INTEGER REFERENCES users(id),
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS collections (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      category VARCHAR(100),
      image_url VARCHAR(255),
      curated_by VARCHAR(255),
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS kwibuka_content (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      type VARCHAR(100) NOT NULL,
      content TEXT,
      media_url VARCHAR(255),
      date DATE,
      is_featured BOOLEAN DEFAULT false,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS audio_content (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      audio_url VARCHAR(255) NOT NULL,
      thumbnail_url VARCHAR(255),
      duration INTEGER,
      category VARCHAR(100),
      is_featured BOOLEAN DEFAULT false,
      created_by INTEGER REFERENCES users(id),
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS video_content (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      video_url VARCHAR(255) NOT NULL,
      thumbnail_url VARCHAR(255),
      duration INTEGER,
      category VARCHAR(100),
      is_featured BOOLEAN DEFAULT false,
      created_by INTEGER REFERENCES users(id),
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_heritage_category ON heritage_items(category);
    CREATE INDEX IF NOT EXISTS idx_heritage_location ON heritage_items(location);
    CREATE INDEX IF NOT EXISTS idx_calendar_date ON calendar_events(event_date);
    CREATE INDEX IF NOT EXISTS idx_collections_category ON collections(category);
    CREATE INDEX IF NOT EXISTS idx_audio_category ON audio_content(category);
    CREATE INDEX IF NOT EXISTS idx_video_category ON video_content(category);
  `);
};

export const connectDB = async () => {
  try {
    const client = await pool.connect();
    console.log(`Connected to PostgreSQL database: ${config.db.database}`);
    await ensureAuthSchema(client);
    await ensureHeritageSchema(client);
    client.release();
  } catch (error) {
    console.error("Failed to connect to database:", error.message);
    process.exit(1);
  }
};

export default pool;
