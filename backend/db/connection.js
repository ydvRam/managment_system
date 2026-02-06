const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.PG_USER || 'postgres',
  host: process.env.PG_HOST || 'localhost',
  database: process.env.PG_DATABASE || 'candidate_db',
  password: String(process.env.PG_PASSWORD ?? ''),
  port: parseInt(process.env.PG_PORT || '5432', 10),
});

pool.on('error', (err) => {
  console.error('Unexpected database pool error:', err);
});

module.exports = { pool };
