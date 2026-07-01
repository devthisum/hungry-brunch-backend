// config/database.js
const mysql = require('mysql2/promise');
require('dotenv').config();

// Railway provides MYSQL_URL or individual MYSQL* vars
// Local dev uses DB_HOST, DB_USER etc from .env
const pool = process.env.MYSQL_URL
  ? mysql.createPool({
      uri: process.env.MYSQL_URL,
      waitForConnections: true,
      connectionLimit: 10,
      ssl: { rejectUnauthorized: false },
    })
  : process.env.MYSQLHOST
  ? mysql.createPool({
      host:               process.env.MYSQLHOST,
      port:               process.env.MYSQLPORT     || 3306,
      user:               process.env.MYSQLUSER,
      password:           process.env.MYSQLPASSWORD,
      database:           process.env.MYSQLDATABASE,
      waitForConnections: true,
      connectionLimit:    10,
      ssl: { rejectUnauthorized: false },
    })
  : mysql.createPool({
      host:               process.env.DB_HOST     || 'localhost',
      port:               process.env.DB_PORT     || 3306,
      user:               process.env.DB_USER     || 'root',
      password:           process.env.DB_PASSWORD || '',
      database:           process.env.DB_NAME     || 'hungry_brunch',
      waitForConnections: true,
      connectionLimit:    10,
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
