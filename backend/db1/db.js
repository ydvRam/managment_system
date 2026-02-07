const { Pool } = require('pg');
const pool = new Pool({
  host: "localhost",
  user: "postgres",
  password: "Yadav@7457",
  database: "mydb",
  port: 5432
})
pool.on("connect", () => {
  console.log("postgreSQL connected");
})
pool.on('error', () => {
  console.log("PostgreSQL isnt connected");
})
module.exports = {pool}