const { Pool } = require("pg");
require("dotenv").config();

const isProduction = process.env.NODE_ENV === "production";

const pool = new Pool({
  host: process.env.PG_HOST || "localhost",
  user: process.env.PG_USER || "postgres",
  password: process.env.PG_PASSWORD,
  database: process.env.PG_DATABASE || "candidate_db",
  port: Number(process.env.PG_PORT) || 5432,
  ssl: isProduction
    ? { rejectUnauthorized: false } // cloud DBs
    : false                          // local DB
});

pool.on("connect", () => {
  console.log("PostgreSQL connected");
});

pool.on("error", (err) => {
  console.error("Unexpected database pool error:", err);
  process.exit(1);
});

module.exports = { pool };
