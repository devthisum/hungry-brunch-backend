// routes/categories.js
const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const authMiddleware = require('../middleware/auth');

router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM categories ORDER BY display_order');
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.post('/', authMiddleware, async (req, res) => {
  try {
    const { name, display_order } = req.body;
    if (!name) return res.status(400).json({ success: false, message: 'Name required' });
    const [result] = await pool.query(
      'INSERT INTO categories (name, display_order) VALUES (?, ?)',
      [name, display_order || 0]
    );
    res.status(201).json({ success: true, data: { id: result.insertId, name }, message: 'Category created' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { name, display_order } = req.body;
    await pool.query('UPDATE categories SET name=?, display_order=? WHERE id=?', [name, display_order, req.params.id]);
    res.json({ success: true, message: 'Category updated' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    await pool.query('DELETE FROM categories WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Category deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
