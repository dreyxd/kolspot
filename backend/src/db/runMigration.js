import pool from './connection.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigration() {
  try {
    console.log('Starting competition tables migration...');
    
    // Read the SQL file
    const sqlPath = path.join(__dirname, 'schema-competition.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    // Execute the SQL
    await pool.query(sql);
    
    console.log('✓ Competition tables created successfully!');
    console.log('  - competitions');
    console.log('  - competition_entries');
    console.log('  - Indexes and triggers created');
    
    process.exit(0);
  } catch (error) {
    console.error('✗ Migration failed:', error.message);
    process.exit(1);
  }
}

runMigration();
