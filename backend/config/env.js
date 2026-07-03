import dotenv from 'dotenv';

dotenv.config();

const requiredEnvVars = [
  'PORT',
  'JWT_SECRET',
];

const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
  console.error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
  process.exit(1);
}

if (process.env.JWT_SECRET.length < 32) {
  console.error('JWT_SECRET must be at least 32 characters long');
  process.exit(1);
}

const config = {
  port: parseInt(process.env.PORT, 10) || 5000,
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 5432,
    database: process.env.DB_NAME || 'umuco_core',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: '7d'
  },
  email: {
    host: process.env.EMAIL_HOST || 'smtp.example.com',
    port: parseInt(process.env.EMAIL_PORT, 10) || 587,
    user: process.env.EMAIL_USER || 'test@example.com',
    pass: process.env.EMAIL_PASS || 'password',
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER
  },
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID || '',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || ''
  }
};

export default config;
