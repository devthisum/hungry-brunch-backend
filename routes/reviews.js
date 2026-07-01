// routes/reviews.js
const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const authMiddleware = require('../middleware/auth');

router.get('/', async (req, res) => {
  try {
    const featured = req.query.featured;
    let query = 'SELECT * FROM reviews';
    if (featured === 'true') query += ' WHERE is_featured = TRUE';
    query += ' ORDER BY created_at DESC';
    const [rows] = await pool.query(query);
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.post('/', authMiddleware, async (req, res) => {
  try {
    const { customer_name, rating, comment, is_featured } = req.body;
    if (!customer_name || !rating) {
      return res.status(400).json({ success: false, message: 'Name and rating required' });
    }
    const [result] = await pool.query(
      'INSERT INTO reviews (customer_name, rating, comment, is_featured) VALUES (?, ?, ?, ?)',
      [customer_name, parseInt(rating), comment, is_featured === true || is_featured === 'true']
    );
    const [newReview] = await pool.query('SELECT * FROM reviews WHERE id = ?', [result.insertId]);
    res.status(201).json({ success: true, data: newReview[0], message: 'Review created' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { customer_name, rating, comment, is_featured } = req.body;
    await pool.query(
      'UPDATE reviews SET customer_name=?, rating=?, comment=?, is_featured=? WHERE id=?',
      [customer_name, rating, comment, is_featured, req.params.id]
    );
    const [updated] = await pool.query('SELECT * FROM reviews WHERE id = ?', [req.params.id]);
    res.json({ success: true, data: updated[0], message: 'Review updated' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    await pool.query('DELETE FROM reviews WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Review deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
