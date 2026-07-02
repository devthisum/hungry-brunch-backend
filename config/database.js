// config/database.js
const mysql = require('mysql2/promise');
require('dotenv').config();

// Print every env var that starts with MYSQL for debugging
const mysqlVars = Object.keys(process.env).filter(k => k.startsWith('MYSQL') || k.startsWith('DB_'));
console.log('Available DB vars:', mysqlVars);
mysqlVars.forEach(k => {
  if (!k.includes('PASSWORD') && !k.includes('ROOT')) {
    console.log(`  ${k} = ${process.env[k]}`);
  }
});

// Try every possible variable name Railway might use
const host     = process.env.MYSQLHOST     || process.env.MYSQL_HOST     || process.env.DB_HOST     || 'localhost';
const port     = process.env.MYSQLPORT     || process.env.MYSQL_PORT     || process.env.DB_PORT     || 3306;
const user     = process.env.MYSQLUSER     || process.env.MYSQL_USER     || process.env.DB_USER     || 'root';
const password = process.env.MYSQLPASSWORD || process.env.MYSQL_PASSWORD || process.env.MYSQL_ROOT_PASSWORD || process.env.DB_PASSWORD || '';
const database = process.env.MYSQLDATABASE || process.env.MYSQL_DATABASE || process.env.MYSQL_DBNAME || process.env.DB_NAME || 'railway';

console.log(`Connecting to: ${user}@${host}:${port}/${database}`);

// If MYSQL_URL is available use that — it's the most reliable
let pool;

if (process.env.MYSQL_URL) {
  console.log('Using MYSQL_URL connection string');
  pool = mysql.createPool(process.env.MYSQL_URL + '?ssl={"rejectUnauthorized":false}');
} else {
  console.log('Using individual connection variables');
  pool = mysql.createPool({
    host,
    port:               parseInt(port),
    user,
    password,
    database,
    waitForConnections: true,
    connectionLimit:    10,
    ssl:                { rejectUnauthorized: false },
  });
}

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
