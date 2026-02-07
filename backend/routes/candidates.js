const express = require('express');
const router = express.Router();
const { pool } = require('../db/connection');
const { validateCandidate } = require('../middleware/validation');

const COLS = 'id, sroll AS s_roll, name, age, email, phone, scode AS s_code, address, coursename AS course_name';
const COLS_INSERT = 'sroll, name, age, email, phone, scode, address, coursename';

// GET /api/candidates - Retrieve all (optional search & filter by course)
router.get('/', async (req, res) => {
  try {
    const { search, course } = req.query;
    let query = `SELECT ${COLS} FROM candidates WHERE 1=1`;
    const params = [];
    let paramIndex = 1;

    if (search && search.trim()) {
      const term = `%${search.trim()}%`;
      query += ` AND (name ILIKE $${paramIndex} OR email ILIKE $${paramIndex} OR scode ILIKE $${paramIndex} OR coursename ILIKE $${paramIndex} OR address ILIKE $${paramIndex})`;
      params.push(term);
      paramIndex++;
    }
    if (course && course.trim()) {
      query += ` AND coursename = $${paramIndex}`;
      params.push(course.trim());
      paramIndex++;
    }
    query += ' ORDER BY id DESC';

    const result = await pool.query(query, params);
    res.json({ candidates: result.rows });
  } catch (err) {
    console.error('GET /api/candidates error:', err);
    const message = err.code === '42P01' ? 'Database table "candidates" does not exist. Run: npm run init-db' : (err.message || 'Failed to retrieve candidates');
    res.status(500).json({ error: message });
  }
});

// GET /api/candidates/:id
router.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid ID' });

    const result = await pool.query(`SELECT ${COLS} FROM candidates WHERE id = $1`, [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Candidate not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('GET /api/candidates/:id error:', err);
    const message = err.code === '42P01' ? 'Database table "candidates" does not exist. Run: npm run init-db' : (err.message || 'Failed to retrieve candidate');
    res.status(500).json({ error: message });
  }
});

// POST /api/candidates
router.post('/', async (req, res) => {
  try {
    const errors = validateCandidate(req.body, false);
    if (errors.length > 0) return res.status(400).json({ errors });

    const { s_roll, name, age, email, phone, s_code, address, course_name } = req.body;
    const result = await pool.query(
      `INSERT INTO candidates (${COLS_INSERT})
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING ${COLS}`,
      [
        s_roll != null && s_roll !== '' ? parseInt(s_roll, 10) : null,
        (name || '').toString().trim(),
        age != null && age !== '' ? parseInt(age, 10) : null,
        (email || '').toString().trim().toLowerCase(),
        phone != null && phone !== '' ? parseInt(phone, 10) : null,
        (s_code || '').toString().trim() || null,
        (address || '').toString().trim() || null,
        (course_name || '').toString().trim() || null,
      ]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'A record with this email already exists' });
    if (err.code === '42P01') return res.status(500).json({ error: 'Database table "candidates" does not exist. Run: npm run init-db' });
    if (err.code === 'ECONNREFUSED' || err.code === 'ENOTFOUND') return res.status(500).json({ error: 'Cannot connect to database.' });
    console.error('POST /api/candidates error:', err);
    res.status(500).json({ error: err.message || 'Failed to create candidate' });
  }
});

// PUT /api/candidates/:id
router.put('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid ID' });

    const errors = validateCandidate(req.body, false);
    if (errors.length > 0) return res.status(400).json({ errors });

    const { s_roll, name, age, email, phone, s_code, address, course_name } = req.body;
    const result = await pool.query(
      `UPDATE candidates SET
        sroll = $2, name = $3, age = $4, email = $5, phone = $6, scode = $7, address = $8, coursename = $9
       WHERE id = $1
       RETURNING ${COLS}`,
      [
        id,
        s_roll != null && s_roll !== '' ? parseInt(s_roll, 10) : null,
        (name || '').toString().trim(),
        age != null && age !== '' ? parseInt(age, 10) : null,
        (email || '').toString().trim().toLowerCase(),
        phone != null && phone !== '' ? parseInt(phone, 10) : null,
        (s_code || '').toString().trim() || null,
        (address || '').toString().trim() || null,
        (course_name || '').toString().trim() || null,
      ]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Candidate not found' });
    res.json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'A record with this email already exists' });
    console.error('PUT /api/candidates/:id error:', err);
    res.status(500).json({ error: err.message || 'Failed to update candidate' });
  }
});

// DELETE /api/candidates/:id
router.delete('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid ID' });

    const result = await pool.query('DELETE FROM candidates WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Candidate not found' });
    res.status(204).send();
  } catch (err) {
    console.error('DELETE /api/candidates/:id error:', err);
    res.status(500).json({ error: err.message || 'Failed to delete candidate' });
  }
});

module.exports = router;
