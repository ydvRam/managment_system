const { Pool } = require('pg');
require('dotenv').config();

// Render and other hosts provide DATABASE_URL; locally use PG_* vars
const config = process.env.DATABASE_URL
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    }
  : {
      user: process.env.PG_USER || 'postgres',
      host: process.env.PG_HOST || 'localhost',
      database: process.env.PG_DATABASE || 'candidate_db',
      password: String(process.env.PG_PASSWORD ?? ''),
      port: parseInt(process.env.PG_PORT || '5432', 10),
    };

const pool = new Pool(config);

pool.on('error', (err) => {
  console.error('Unexpected database pool error:', err);
});

module.exports = { pool };
