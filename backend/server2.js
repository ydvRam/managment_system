const express = require('express');
const pool = require("../backend/db1/db");
const app = express();
app.use(express.json);

app.get('/', (req, res) => {
  res.send("API is running");
})

// create user-->
app.post('/users', async (req, res) => {
  try {
    const { name, email } = req.body;
    const result = await pool.query(
      "INSERT INTO usersDB (name, email) VALUES ($1, $2)",
      [name, email]
    );
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: err.message });
  }
});
// Read user -->
app.get('/users', async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM userDB");
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: "Can not read data" })
  }
})
app.listen(3001, () => {
  console.log('server is running on http://localhost:3001/');
})
