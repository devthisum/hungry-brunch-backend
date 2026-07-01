// routes/menu.js
const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const authMiddleware = require('../middleware/auth');
const upload = require('../middleware/upload');

// GET /api/menu - Public
router.get('/', async (req, res) => {
  try {
    const { category, search, available } = req.query;
    let query = 'SELECT * FROM menu_items WHERE 1=1';
    const params = [];

    if (category && category !== 'All') {
      query += ' AND category = ?';
      params.push(category);
    }
    if (search) {
      query += ' AND (name LIKE ? OR description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }
    if (available === 'true') {
      query += ' AND available = TRUE';
    }

    query += ' ORDER BY featured DESC, created_at DESC';

    const [rows] = await pool.query(query, params);
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Get menu error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/menu/featured
router.get('/featured', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM menu_items WHERE featured = TRUE AND available = TRUE ORDER BY created_at DESC LIMIT 8'
    );
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/menu/:id
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM menu_items WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'Item not found' });
    res.json({ success: true, data: rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /api/menu - Admin only
router.post('/', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    const { name, description, price, category, available, featured } = req.body;
    if (!name || !price || !category) {
      return res.status(400).json({ success: false, message: 'Name, price, and category required' });
    }

    let imageUrl = req.body.image_url || null;
    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
    }

    const [result] = await pool.query(
      'INSERT INTO menu_items (name, description, price, category, image_url, available, featured) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [name, description, parseFloat(price), category, imageUrl, available !== 'false', featured === 'true']
    );

    const [newItem] = await pool.query('SELECT * FROM menu_items WHERE id = ?', [result.insertId]);
    res.status(201).json({ success: true, data: newItem[0], message: 'Menu item created' });
  } catch (error) {
    console.error('Create menu error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// PUT /api/menu/:id - Admin only
router.put('/:id', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    const { name, description, price, category, available, featured, image_url } = req.body;
    const [existing] = await pool.query('SELECT * FROM menu_items WHERE id = ?', [req.params.id]);
    if (existing.length === 0) return res.status(404).json({ success: false, message: 'Item not found' });

    let imageUrl = image_url || existing[0].image_url;
    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
    }

    await pool.query(
      'UPDATE menu_items SET name=?, description=?, price=?, category=?, image_url=?, available=?, featured=? WHERE id=?',
      [
        name || existing[0].name,
        description !== undefined ? description : existing[0].description,
        price ? parseFloat(price) : existing[0].price,
        category || existing[0].category,
        imageUrl,
        available !== undefined ? available !== 'false' && available !== false : existing[0].available,
        featured !== undefined ? featured === 'true' || featured === true : existing[0].featured,
        req.params.id
      ]
    );

    const [updated] = await pool.query('SELECT * FROM menu_items WHERE id = ?', [req.params.id]);
    res.json({ success: true, data: updated[0], message: 'Menu item updated' });
  } catch (error) {
    console.error('Update menu error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// DELETE /api/menu/:id - Admin only
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const [existing] = await pool.query('SELECT * FROM menu_items WHERE id = ?', [req.params.id]);
    if (existing.length === 0) return res.status(404).json({ success: false, message: 'Item not found' });

    await pool.query('DELETE FROM menu_items WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Menu item deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// PATCH /api/menu/:id/toggle - Admin only
router.patch('/:id/toggle', authMiddleware, async (req, res) => {
  try {
    await pool.query('UPDATE menu_items SET available = !available WHERE id = ?', [req.params.id]);
    const [updated] = await pool.query('SELECT * FROM menu_items WHERE id = ?', [req.params.id]);
    res.json({ success: true, data: updated[0], message: 'Availability toggled' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
