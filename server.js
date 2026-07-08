// server.js
require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const helmet  = require('helmet');
const rateLimit = require('express-rate-limit');
const path    = require('path');
const { testConnection } = require('./config/database');

const app  = express();
const PORT = process.env.PORT || 5000;

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

app.use(cors({ origin: '*', credentials: false }));

const limiter     = rateLimit({ windowMs: 15 * 60 * 1000, max: 300 });
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20  });
app.use('/api/', limiter);
app.use('/api/auth/login', authLimiter);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth',         require('./routes/auth'));
app.use('/api/menu',         require('./routes/menu'));
app.use('/api/categories',   require('./routes/categories'));
app.use('/api/reviews',      require('./routes/reviews'));
app.use('/api/gallery',      require('./routes/gallery'));
app.use('/api/hours',        require('./routes/hours'));
app.use('/api/analytics',    require('./routes/analytics'));
app.use('/api/reservations', require('./routes/reservations'));
app.use('/api/promotions',   require('./routes/promotions'));
app.use('/api/qrcode',       require('./routes/qrcode'));

app.get('/api/health', (req, res) => {
  res.json({ success: true, message: '🍳 Hungry Brunch API is running', timestamp: new Date() });
});

app.use((req, res) => res.status(404).json({ success: false, message: 'Route not found' }));
app.use((err, req, res, next) => res.status(500).json({ success: false, message: err.message }));

app.listen(PORT, () => {
  console.log(`\n🍳 Hungry Brunch API running on port ${PORT}`);
  testConnection();
});
