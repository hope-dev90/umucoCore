import dotenv from 'dotenv';

dotenv.config();

const requiredEnvVars = [
  'PORT',
  'JWT_SECRET',
];
// DB_HOST + DB_PASSWORD are required unless DATABASE_URL is set — checked below after dotenv loads.

const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
  console.error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
  process.exit(1);
}

if (process.env.JWT_SECRET.length < 32) {
  console.error('JWT_SECRET must be at least 32 characters long');
  process.exit(1);
}

if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
  console.warn('Warning: EMAIL_USER / EMAIL_PASS not set. OTP emails will not send until configured.');
}

// Parse DATABASE_URL if provided (e.g., from Neon, Supabase, or other cloud databases)
let dbConfig;
if (process.env.DATABASE_URL) {
  const url = new URL(process.env.DATABASE_URL);
  dbConfig = {
    host: url.hostname,
    port: parseInt(url.port) || 5432,
    database: url.pathname.slice(1), // Remove leading slash
    user: url.username,
    password: url.password,
  };
  } else {
    if (!process.env.DB_HOST || !process.env.DB_PASSWORD) {
      console.error('Missing required DB environment variables: DB_HOST and DB_PASSWORD must be set when DATABASE_URL is not provided.');
      process.exit(1);
    }
    dbConfig = {
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT, 10) || 5432,
      database: process.env.DB_NAME || 'postgres',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD,
    };
  }

const config = {
  port: parseInt(process.env.PORT, 10) || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production',
  db: dbConfig,
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: '7d'
  },
  email: {
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT, 10) || 587,
    user: (process.env.EMAIL_USER || '').trim(),
    pass: (process.env.EMAIL_PASS || '').trim(),
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER || '',
  },
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID || '',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || ''
  }
};

export default config;
