// add-reservations-table.js
// Run ONCE on your existing database:
//   node add-reservations-table.js
//
// Safe to run multiple times — uses CREATE TABLE IF NOT EXISTS

require('dotenv').config();
const mysql = require('mysql2/promise');

async function migrate() {
  const conn = await mysql.createConnection({
    host:     process.env.DB_HOST     || 'localhost',
    user:     process.env.DB_USER     || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME     || 'hungry_brunch',
  });

  try {
    console.log('🔧 Running reservations migration...');

    await conn.query(`
      CREATE TABLE IF NOT EXISTS reservations (
        id         INT AUTO_INCREMENT PRIMARY KEY,
        name       VARCHAR(200)                              NOT NULL,
        email      VARCHAR(200)                              NOT NULL,
        phone      VARCHAR(50),
        date       DATE,
        time       TIME,
        guests     INT DEFAULT 2,
        message    TEXT,
        status     ENUM('new','confirmed','cancelled')       DEFAULT 'new',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('✅ reservations table created (or already exists)');

    // Verify
    const [rows] = await conn.query('DESCRIBE reservations');
    console.log(`✅ Table has ${rows.length} columns:`, rows.map(r => r.Field).join(', '));

    console.log('\n🎉 Migration complete! Restart your backend server.');
  } finally {
    await conn.end();
  }
}

migrate().catch(err => {
  console.error('❌ Migration failed:', err.message);
  console.error('Make sure backend/.env has the correct DB credentials.');
  process.exit(1);
});
