// routes/reservations.js
const express = require('express');
const router  = express.Router();
const { pool } = require('../config/database');
const authMiddleware = require('../middleware/auth');
const { sendReservationConfirmation, sendAdminNotification } = require('../services/emailService');

// POST /api/reservations — Public (customer submits)
router.post('/', async (req, res) => {
  try {
    const { name, email, phone, date, time, guests, message } = req.body;

    if (!name || !email) {
      return res.status(400).json({ success: false, message: 'Name and email are required' });
    }

    const [result] = await pool.query(
      `INSERT INTO reservations (name, email, phone, date, time, guests, message)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [name, email, phone || null, date || null, time || null, parseInt(guests) || 2, message || null]
    );

    const [newRow] = await pool.query('SELECT * FROM reservations WHERE id = ?', [result.insertId]);
    const reservation = newRow[0];

    // Send emails (non-blocking — don't fail if email fails)
    sendReservationConfirmation(reservation).catch(() => {});
    sendAdminNotification(reservation).catch(() => {});

    res.status(201).json({
      success: true,
      message: 'Reservation request received! We will confirm within 2 hours.',
      data: reservation,
    });
  } catch (error) {
    console.error('Reservation error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/reservations — Admin only
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { status } = req.query;
    let query  = 'SELECT * FROM reservations';
    const params = [];
    if (status && status !== 'all') { query += ' WHERE status = ?'; params.push(status); }
    query += ' ORDER BY created_at DESC';
    const [rows] = await pool.query(query, params);
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/reservations/counts — Admin badge counts
router.get('/counts', authMiddleware, async (req, res) => {
  try {
    const [[n]] = await pool.query("SELECT COUNT(*) as count FROM reservations WHERE status='new'");
    const [[t]] = await pool.query('SELECT COUNT(*) as count FROM reservations');
    const [[td]] = await pool.query("SELECT COUNT(*) as count FROM reservations WHERE DATE(date)=CURDATE()");
    res.json({ success: true, data: { new: n.count, total: t.count, today: td.count } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// PATCH /api/reservations/:id/status — Admin
router.patch('/:id/status', authMiddleware, async (req, res) => {
  try {
    const { status } = req.body;
    if (!['new','confirmed','cancelled'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }
    await pool.query('UPDATE reservations SET status=? WHERE id=?', [status, req.params.id]);
    const [updated] = await pool.query('SELECT * FROM reservations WHERE id=?', [req.params.id]);
    res.json({ success: true, data: updated[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// DELETE /api/reservations/:id — Admin
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    await pool.query('DELETE FROM reservations WHERE id=?', [req.params.id]);
    res.json({ success: true, message: 'Reservation deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
