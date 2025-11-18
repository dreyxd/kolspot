import pool from './connection.js';

const createTables = async () => {
  try {
    console.log('Running database migrations...');

    // Create kol_transactions table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS kol_transactions (
        id SERIAL PRIMARY KEY,
        wallet_address VARCHAR(44) NOT NULL,
        token_mint VARCHAR(44) NOT NULL,
        token_symbol VARCHAR(20),
        amount DECIMAL(24, 8) NOT NULL,
        timestamp TIMESTAMPTZ NOT NULL,
        signature VARCHAR(88) UNIQUE NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        INDEX idx_wallet_address (wallet_address),
        INDEX idx_token_mint (token_mint),
        INDEX idx_timestamp (timestamp),
        INDEX idx_signature (signature)
      );
    `);

    console.log('✓ kol_transactions table created');

    // Create index for performance
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_token_timestamp 
      ON kol_transactions(token_mint, timestamp DESC);
    `);

    console.log('✓ Indexes created');

    console.log('✅ Database migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
};

createTables();
