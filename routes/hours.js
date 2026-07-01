// routes/hours.js
const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const authMiddleware = require('../middleware/auth');

router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM opening_hours ORDER BY FIELD(day_name, "Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday")');
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { open_time, close_time, is_closed } = req.body;
    await pool.query(
      'UPDATE opening_hours SET open_time=?, close_time=?, is_closed=? WHERE id=?',
      [open_time, close_time, is_closed, req.params.id]
    );
    res.json({ success: true, message: 'Hours updated' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
