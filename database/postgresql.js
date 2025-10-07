const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

const initPostgreSQL = async () => {
  const client = await pool.connect();
  
  try {
    // Admins table
    await client.query(`
      CREATE TABLE IF NOT EXISTS admins (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Content table
    await client.query(`
      CREATE TABLE IF NOT EXISTS content (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        type VARCHAR(50) NOT NULL CHECK(type IN ('podcast', 'presentation', 'document')),
        s3_url TEXT NOT NULL,
        thumbnail_url TEXT,
        duration INTEGER,
        file_size INTEGER,
        tags TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Categories table
    await client.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        type VARCHAR(50) NOT NULL CHECK(type IN ('podcast', 'presentation', 'document')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Content categories junction table
    await client.query(`
      CREATE TABLE IF NOT EXISTS content_categories (
        content_id INTEGER REFERENCES content(id),
        category_id INTEGER REFERENCES categories(id),
        PRIMARY KEY (content_id, category_id)
      )
    `);

    console.log('PostgreSQL tables initialized successfully');
  } finally {
    client.release();
  }
};

module.exports = { pool, initPostgreSQL };