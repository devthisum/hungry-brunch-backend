// fix-admin-password.js
// Run this once with: node fix-admin-password.js
// It resets the admin password to: admin123

require('dotenv').config();
const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');

async function fix() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'hungry_brunch',
  });

  try {
    const hash = await bcrypt.hash('admin123', 10);

    // Check if admin exists
    const [rows] = await conn.query('SELECT id FROM admins WHERE username = ?', ['admin']);

    if (rows.length > 0) {
      await conn.query('UPDATE admins SET password_hash = ? WHERE username = ?', [hash, 'admin']);
      console.log('✅ Admin password reset to: admin123');
    } else {
      await conn.query('INSERT INTO admins (username, password_hash) VALUES (?, ?)', ['admin', hash]);
      console.log('✅ Admin account created with password: admin123');
    }

    // Verify it works
    const [admin] = await conn.query('SELECT password_hash FROM admins WHERE username = ?', ['admin']);
    const valid = await bcrypt.compare('admin123', admin[0].password_hash);
    console.log('✅ Password verification:', valid ? 'PASSED' : 'FAILED');

  } finally {
    await conn.end();
  }
}

fix().catch(err => {
  console.error('❌ Error:', err.message);
  console.error('Make sure your .env file has the correct DB credentials.');
  process.exit(1);
});
