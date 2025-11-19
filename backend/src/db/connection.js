import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Or use individual config:
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  // Don't exit process - just log the error and continue
  // Railway will restart if needed, but we don't want to crash on every DB hiccup
});

// Test connection on startup
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Database connection error:', err.message);
    console.warn('⚠️  Database not connected - some features may be unavailable');
  } else {
    console.log('✅ Database connected successfully');
  }
});

export const query = (text, params) => pool.query(text, params);

export default pool;
