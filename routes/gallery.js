// routes/gallery.js
const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const authMiddleware = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM gallery ORDER BY created_at DESC');
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.post('/', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    const { caption, category, image_url } = req.body;
    let imageUrl = image_url || null;
    if (req.file) imageUrl = `/uploads/${req.file.filename}`;
    if (!imageUrl) return res.status(400).json({ success: false, message: 'Image required' });

    const [result] = await pool.query(
      'INSERT INTO gallery (image_url, caption, category) VALUES (?, ?, ?)',
      [imageUrl, caption, category || 'food']
    );
    res.status(201).json({ success: true, data: { id: result.insertId, image_url: imageUrl, caption, category } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    await pool.query('DELETE FROM gallery WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Image deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
