const { Pool } = require('pg');

// Configuración de la base de datos PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? {
    rejectUnauthorized: false
  } : false
});

// Función para inicializar las tablas de la base de datos
async function initDatabase() {
  const client = await pool.connect();
  
  try {
    // Crear tabla de usuarios
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(20) DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Crear tabla de donaciones recibidas
    await client.query(`
      CREATE TABLE IF NOT EXISTS donations_received (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        amount INTEGER,
        description TEXT,
        date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Crear tabla de solicitudes de donaciones
    await client.query(`
      CREATE TABLE IF NOT EXISTS donation_requests (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        item_type VARCHAR(50),
        quantity INTEGER,
        reason TEXT,
        status VARCHAR(20) DEFAULT 'pending',
        date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Crear tabla de inventario
    await client.query(`
      CREATE TABLE IF NOT EXISTS inventory (
        id SERIAL PRIMARY KEY,
        item_name VARCHAR(100) NOT NULL,
        category VARCHAR(50),
        quantity INTEGER DEFAULT 0,
        size VARCHAR(20),
        last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Crear usuario admin por defecto si no existe
    const bcrypt = require('bcryptjs');
    const adminPassword = await bcrypt.hash('admin123', 10);
    
    await client.query(`
      INSERT INTO users (username, email, password, role)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (username) DO NOTHING
    `, ['admin', 'admin@donaciones.com', adminPassword, 'admin']);

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Función helper para ejecutar queries
async function query(text, params) {
  const start = Date.now();
  const res = await pool.query(text, params);
  const duration = Date.now() - start;
  console.log('Executed query', { text, duration, rows: res.rowCount });
  return res;
}

module.exports = {
  query,
  pool,
  initDatabase
};