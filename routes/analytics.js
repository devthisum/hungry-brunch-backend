// routes/analytics.js
const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const authMiddleware = require('../middleware/auth');

router.get('/', authMiddleware, async (req, res) => {
  try {
    const [[menuCount]] = await pool.query('SELECT COUNT(*) as count FROM menu_items');
    const [[availableCount]] = await pool.query('SELECT COUNT(*) as count FROM menu_items WHERE available = TRUE');
    const [[reviewCount]] = await pool.query('SELECT COUNT(*) as count FROM reviews');
    const [[avgRating]] = await pool.query('SELECT AVG(rating) as avg FROM reviews');
    const [[categoryCount]] = await pool.query('SELECT COUNT(*) as count FROM categories');
    const [[galleryCount]] = await pool.query('SELECT COUNT(*) as count FROM gallery');
    const [[newReservations]] = await pool.query("SELECT COUNT(*) as count FROM reservations WHERE status = 'new'");
    const [[totalReservations]] = await pool.query('SELECT COUNT(*) as count FROM reservations');

    const [categoryBreakdown] = await pool.query(
      'SELECT category, COUNT(*) as count FROM menu_items GROUP BY category ORDER BY count DESC'
    );
    const [ratingDist] = await pool.query(
      'SELECT rating, COUNT(*) as count FROM reviews GROUP BY rating ORDER BY rating DESC'
    );

    res.json({
      success: true,
      data: {
        menuTotal: menuCount.count,
        menuAvailable: availableCount.count,
        reviewTotal: reviewCount.count,
        averageRating: avgRating.avg ? parseFloat(avgRating.avg).toFixed(1) : 0,
        categoryTotal: categoryCount.count,
        galleryTotal: galleryCount.count,
        newReservations: newReservations.count,
        totalReservations: totalReservations.count,
        categoryBreakdown,
        ratingDistribution: ratingDist,
      }
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
