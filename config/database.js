// config/database.js
const mysql = require('mysql2/promise');
require('dotenv').config();

// Get connection details - try all possible variable names
const MYSQL_URL = process.env.MYSQL_URL || 
                  process.env.DATABASE_URL ||
                  null;

const host     = process.env.DB_HOST     || process.env.MYSQLHOST     || 'localhost';
const port     = process.env.DB_PORT     || process.env.MYSQLPORT     || 3306;
const user     = process.env.DB_USER     || process.env.MYSQLUSER     || 'root';
const password = process.env.DB_PASSWORD || process.env.MYSQLPASSWORD || process.env.MYSQL_ROOT_PASSWORD || '';
const database = process.env.DB_NAME     || process.env.MYSQLDATABASE || process.env.MYSQL_DATABASE || 'hungry_brunch';

console.log('🔌 DB connecting to:', MYSQL_URL ? 'URL string' : `${user}@${host}:${port}/${database}`);

const pool = MYSQL_URL
  ? mysql.createPool({ uri: MYSQL_URL, ssl: { rejectUnauthorized: false }, connectionLimit: 10 })
  : mysql.createPool({ host, port: parseInt(port), user, password, database, connectionLimit: 10, waitForConnections: true });

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
