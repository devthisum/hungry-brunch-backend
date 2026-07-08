// routes/promotions.js
const express = require('express');
const router  = express.Router();
const { pool }         = require('../config/database');
const authMiddleware   = require('../middleware/auth');
const upload           = require('../middleware/upload');

// Auto-create table if not exists
const ensureTable = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS promotions (
      id          INT AUTO_INCREMENT PRIMARY KEY,
      title       VARCHAR(200) NOT NULL,
      description TEXT,
      discount    VARCHAR(100),
      valid_from  DATE,
      valid_until DATE,
      image_url   VARCHAR(500),
      badge_text  VARCHAR(50) DEFAULT 'Special Offer',
      badge_color VARCHAR(20) DEFAULT 'accent',
      active      BOOLEAN DEFAULT TRUE,
      created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
};
ensureTable().catch(console.error);

// GET /api/promotions — Public
router.get('/', async (req, res) => {
  try {
    const activeOnly = req.query.active === 'true';
    let query = 'SELECT * FROM promotions';
    if (activeOnly) query += ' WHERE active = TRUE AND (valid_until IS NULL OR valid_until >= CURDATE())';
    query += ' ORDER BY created_at DESC';
    const [rows] = await pool.query(query);
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /api/promotions — Admin
router.post('/', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    const { title, description, discount, valid_from, valid_until, badge_text, badge_color, active, image_url } = req.body;
    if (!title) return res.status(400).json({ success: false, message: 'Title required' });

    let imgUrl = image_url || null;
    if (req.file) imgUrl = `/uploads/${req.file.filename}`;

    const [result] = await pool.query(
      `INSERT INTO promotions (title, description, discount, valid_from, valid_until, image_url, badge_text, badge_color, active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [title, description, discount, valid_from || null, valid_until || null, imgUrl, badge_text || 'Special Offer', badge_color || 'accent', active !== 'false']
    );

    const [newPromo] = await pool.query('SELECT * FROM promotions WHERE id = ?', [result.insertId]);
    res.status(201).json({ success: true, data: newPromo[0], message: 'Promotion created!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// PUT /api/promotions/:id — Admin
router.put('/:id', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    const { title, description, discount, valid_from, valid_until, badge_text, badge_color, active, image_url } = req.body;
    const [existing] = await pool.query('SELECT * FROM promotions WHERE id = ?', [req.params.id]);
    if (!existing.length) return res.status(404).json({ success: false, message: 'Not found' });

    let imgUrl = image_url || existing[0].image_url;
    if (req.file) imgUrl = `/uploads/${req.file.filename}`;

    await pool.query(
      `UPDATE promotions SET title=?,description=?,discount=?,valid_from=?,valid_until=?,image_url=?,badge_text=?,badge_color=?,active=? WHERE id=?`,
      [title, description, discount, valid_from || null, valid_until || null, imgUrl, badge_text, badge_color, active !== 'false' && active !== false, req.params.id]
    );
    const [updated] = await pool.query('SELECT * FROM promotions WHERE id = ?', [req.params.id]);
    res.json({ success: true, data: updated[0], message: 'Promotion updated!' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// DELETE /api/promotions/:id — Admin
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    await pool.query('DELETE FROM promotions WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Promotion deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// PATCH /api/promotions/:id/toggle — Admin
router.patch('/:id/toggle', authMiddleware, async (req, res) => {
  try {
    await pool.query('UPDATE promotions SET active = !active WHERE id = ?', [req.params.id]);
    const [updated] = await pool.query('SELECT * FROM promotions WHERE id = ?', [req.params.id]);
    res.json({ success: true, data: updated[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
