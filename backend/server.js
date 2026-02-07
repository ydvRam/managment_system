require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');
const candidatesRouter = require('./routes/student');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// API routes (must be before static so /api/* is not served as files)
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Candidate Management API is running' });
});
app.use('/api/student', candidatesRouter);

// Serve frontend static files
const frontendPath = path.join(__dirname, '..', 'frontend');
app.use(express.static(frontendPath));
app.get('/', (req, res) => res.sendFile(path.join(frontendPath, 'index.html')));

app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

const { pool } = require('./db/connection');

app.listen(PORT, async () => {
  console.log(`Candidate Management API listening on http://localhost:${PORT}`);
  try {
    await pool.query('SELECT 1 FROM student LIMIT 1');
    console.log('Database connected. Table "student" is ready.');
  } catch (err) {
    console.error('Database error:', err.message);
    console.error('→ Create the database: CREATE DATABASE gurugram;');
    console.error('→ Then run: npm run init-db');
  }
});
