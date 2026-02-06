const express = require('express');
const router = express.Router();
const { pool } = require('../db/connection');
const { validateCandidate } = require('../middleware/validation');

// GET /api/candidates - Retrieve all candidates (with optional search & filter)
router.get('/', async (req, res) => {
  try {
    const { search, status } = req.query;
    let query = 'SELECT id, name, age, email, phone, skills, experience, applied_position, status, created_at, updated_at FROM candidates WHERE 1=1';
    const params = [];
    let paramIndex = 1;

    if (search && search.trim()) {
      const term = `%${search.trim()}%`;
      query += ` AND (name ILIKE $${paramIndex} OR email ILIKE $${paramIndex} OR skills ILIKE $${paramIndex} OR applied_position ILIKE $${paramIndex})`;
      params.push(term);
      paramIndex++;
    }
    if (status && status.trim()) {
      query += ` AND status = $${paramIndex}`;
      params.push(status.trim());
      paramIndex++;
    }
    query += ' ORDER BY created_at DESC';

    const result = await pool.query(query, params);
    res.json({ candidates: result.rows });
  } catch (err) {
    console.error('GET /api/candidates error:', err);
    const message = err.code === '42P01' ? 'Database table "candidates" does not exist. Run: npm run init-db' : (err.message || 'Failed to retrieve candidates');
    res.status(500).json({ error: message });
  }
});

// GET /api/candidates/:id - Retrieve specific candidate
router.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid candidate ID' });

    const result = await pool.query(
      'SELECT id, name, age, email, phone, skills, experience, applied_position, status, created_at, updated_at FROM candidates WHERE id = $1',
      [id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Candidate not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('GET /api/candidates/:id error:', err);
    const message = err.code === '42P01' ? 'Database table "candidates" does not exist. Run: npm run init-db' : (err.message || 'Failed to retrieve candidate');
    res.status(500).json({ error: message });
  }
});

// POST /api/candidates - Create new candidate
router.post('/', async (req, res) => {
  try {
    const errors = validateCandidate(req.body, false);
    if (errors.length > 0) return res.status(400).json({ errors });

    const { name, age, email, phone, skills, experience, applied_position, status } = req.body;
    const result = await pool.query(
      `INSERT INTO candidates (name, age, email, phone, skills, experience, applied_position, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id, name, age, email, phone, skills, experience, applied_position, status, created_at, updated_at`,
      [
        (name || '').toString().trim(),
        parseInt(age, 10),
        (email || '').toString().trim().toLowerCase(),
        (phone || '').toString().trim() || null,
        (skills || '').toString().trim() || null,
        experience != null ? (experience + '').trim() : null,
        (applied_position || '').toString().trim() || null,
        (status || 'Applied').toString().trim()
      ]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'A candidate with this email already exists' });
    if (err.code === '23514') return res.status(400).json({ error: 'Validation failed: check age and status values' });
    if (err.code === '42P01') return res.status(500).json({ error: 'Database table "candidates" does not exist. Run: npm run init-db' });
    if (err.code === 'ECONNREFUSED' || err.code === 'ENOTFOUND') return res.status(500).json({ error: 'Cannot connect to database. Check .env and that PostgreSQL is running.' });
    console.error('POST /api/candidates error:', err);
    res.status(500).json({ error: err.message || 'Failed to create candidate' });
  }
});

// PUT /api/candidates/:id - Update existing candidate
router.put('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid candidate ID' });

    const errors = validateCandidate(req.body, false);
    if (errors.length > 0) return res.status(400).json({ errors });

    const { name, age, email, phone, skills, experience, applied_position, status } = req.body;
    const result = await pool.query(
      `UPDATE candidates SET
        name = $2, age = $3, email = $4, phone = $5, skills = $6, experience = $7, applied_position = $8, status = $9
       WHERE id = $1
       RETURNING id, name, age, email, phone, skills, experience, applied_position, status, created_at, updated_at`,
      [
        id,
        (name ?? '').toString().trim(),
        parseInt(age, 10),
        (email ?? '').toString().trim().toLowerCase(),
        (phone ?? '').toString().trim() || null,
        (skills ?? '').toString().trim() || null,
        experience != null && experience !== '' ? (experience + '').trim() : null,
        (applied_position ?? '').toString().trim() || null,
        (status ?? 'Applied').toString().trim()
      ]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Candidate not found' });
    res.json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'A candidate with this email already exists' });
    console.error('PUT /api/candidates/:id error:', err);
    res.status(500).json({ error: 'Failed to update candidate' });
  }
});

// DELETE /api/candidates/:id - Delete candidate
router.delete('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid candidate ID' });

    const result = await pool.query('DELETE FROM candidates WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Candidate not found' });
    res.status(204).send();
  } catch (err) {
    console.error('DELETE /api/candidates/:id error:', err);
    res.status(500).json({ error: 'Failed to delete candidate' });
  }
});

module.exports = router;
