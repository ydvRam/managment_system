const path = require('path');
const fs = require('fs');

const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  require('dotenv').config({ path: envPath });
}

const { Pool } = require('pg');

// Support DATABASE_URL (Render) or PG_* vars (local)
const config = process.env.DATABASE_URL
  ? { connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } }
  : {
      user: process.env.PG_USER || 'postgres',
      host: process.env.PG_HOST || 'localhost',
      database: process.env.PG_DATABASE || 'gurugram',
      password: String(process.env.PG_PASSWORD ?? ''),
      port: parseInt(process.env.PG_PORT || '5432', 10),
    };

const pool = new Pool(config);

const schemaPath = path.join(__dirname, '..', '..', 'database', 'schema.sql');
const sql = fs.readFileSync(schemaPath, 'utf8');

pool.query(sql)
  .then(() => {
    console.log('Database schema applied successfully.');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Schema application failed:', err.message);
    if (err.code === '3D000') console.error('→ Create the database first: CREATE DATABASE gurugram;');
    process.exit(1);
  });
