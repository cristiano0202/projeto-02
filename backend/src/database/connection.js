const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  database: process.env.DB_NAME || 'ecowatt_db',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  waitForConnections: true,
  connectionLimit: Number(process.env.DB_CONNECTION_LIMIT) || 10,
  queueLimit: 0,
  namedPlaceholders: false
});

async function testConnection() {
  const connection = await pool.getConnection();
  try {
    await connection.ping();
    console.log('Banco MySQL conectado com sucesso.');
  } finally {
    connection.release();
  }
}

module.exports = {
  pool,
  query: (sql, params = []) => pool.execute(sql, params),
  testConnection
};
