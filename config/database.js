// config/database.js
const mysql = require('mysql2/promise');
require('dotenv').config();

// Only use individual variables — no URL parsing
const host     = process.env.DB_HOST     || 'localhost';
const port     = parseInt(process.env.DB_PORT || '3306');
const user     = process.env.DB_USER     || 'root';
const password = process.env.DB_PASSWORD || '';
const database = process.env.DB_NAME     || 'hungry_brunch';

console.log(`🔌 Connecting to MySQL: ${user}@${host}:${port}/${database}`);

const pool = mysql.createPool({
  host,
  port,
  user,
  password,
  database,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

const testConnection = async () => {
  try {
    const conn = await pool.getConnection();
    console.log('✅ MySQL connected successfully');
    conn.release();
  } catch (error) {
    console.error('❌ MySQL connection failed:', error.message);
    process.exit(1);
  }
};

module.exports = { pool, testConnection };
