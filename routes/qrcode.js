// routes/qrcode.js
const express = require('express');
const router  = express.Router();
const QRCode  = require('qrcode');

// GET /api/qrcode/menu — returns QR code as base64 PNG
router.get('/menu', async (req, res) => {
  try {
    const menuUrl = `${process.env.FRONTEND_URL || 'https://hungry-brunch-frontend-one.vercel.app'}/menu`;

    const qrDataUrl = await QRCode.toDataURL(menuUrl, {
      width:          400,
      margin:         2,
      color: {
        dark:  '#D97706', // amber
        light: '#FFFFFF',
      },
    });

    res.json({ success: true, data: { qr: qrDataUrl, url: menuUrl } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'QR generation failed' });
  }
});

// GET /api/qrcode/menu.png — returns raw PNG image
router.get('/menu.png', async (req, res) => {
  try {
    const menuUrl = `${process.env.FRONTEND_URL || 'https://hungry-brunch-frontend-one.vercel.app'}/menu`;
    const buffer  = await QRCode.toBuffer(menuUrl, {
      width:  400,
      margin: 2,
      color:  { dark: '#D97706', light: '#FFFFFF' },
    });
    res.setHeader('Content-Type', 'image/png');
    res.send(buffer);
  } catch (error) {
    res.status(500).json({ success: false, message: 'QR generation failed' });
  }
});

module.exports = router;
