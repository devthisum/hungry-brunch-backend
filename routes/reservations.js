// routes/reservations.js
const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const authMiddleware = require('../middleware/auth');

// POST /api/reservations — Public (customer submits form)
router.post('/', async (req, res) => {
  try {
    const { name, email, phone, date, time, guests, message } = req.body;

    if (!name || !email) {
      return res.status(400).json({ success: false, message: 'Name and email are required' });
    }

    const [result] = await pool.query(
      `INSERT INTO reservations (name, email, phone, date, time, guests, message)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        name,
        email,
        phone || null,
        date || null,
        time || null,
        parseInt(guests) || 2,
        message || null,
      ]
    );

    const [newRow] = await pool.query('SELECT * FROM reservations WHERE id = ?', [result.insertId]);

    res.status(201).json({
      success: true,
      message: 'Reservation request received! We will confirm within 24 hours.',
      data: newRow[0],
    });
  } catch (error) {
    console.error('Reservation error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/reservations — Admin only (view all)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { status } = req.query;
    let query = 'SELECT * FROM reservations';
    const params = [];

    if (status && status !== 'all') {
      query += ' WHERE status = ?';
      params.push(status);
    }

    query += ' ORDER BY created_at DESC';

    const [rows] = await pool.query(query, params);
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/reservations/counts — Admin dashboard badge counts
router.get('/counts', authMiddleware, async (req, res) => {
  try {
    const [[newCount]] = await pool.query(
      "SELECT COUNT(*) as count FROM reservations WHERE status = 'new'"
    );
    const [[totalCount]] = await pool.query('SELECT COUNT(*) as count FROM reservations');
    const [[todayCount]] = await pool.query(
      "SELECT COUNT(*) as count FROM reservations WHERE DATE(date) = CURDATE()"
    );

    res.json({
      success: true,
      data: {
        new: newCount.count,
        total: totalCount.count,
        today: todayCount.count,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// PATCH /api/reservations/:id/status — Admin: confirm or cancel
router.patch('/:id/status', authMiddleware, async (req, res) => {
  try {
    const { status } = req.body;
    if (!['new', 'confirmed', 'cancelled'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    await pool.query('UPDATE reservations SET status = ? WHERE id = ?', [status, req.params.id]);

    const [updated] = await pool.query('SELECT * FROM reservations WHERE id = ?', [req.params.id]);
    res.json({ success: true, data: updated[0], message: `Reservation ${status}` });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// DELETE /api/reservations/:id — Admin: delete
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    await pool.query('DELETE FROM reservations WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Reservation deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
