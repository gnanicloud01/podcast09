const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '..', 'database.sqlite');
const db = new sqlite3.Database(dbPath);

// Initialize database tables
const initDatabase = () => {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Admins table
      db.run(`CREATE TABLE IF NOT EXISTS admins (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        name TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`);

      // Content table for all three models
      db.run(`CREATE TABLE IF NOT EXISTS content (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        type TEXT NOT NULL CHECK(type IN ('podcast', 'presentation', 'document')),
        s3_url TEXT NOT NULL,
        thumbnail_url TEXT,
        duration INTEGER,
        file_size INTEGER,
        tags TEXT,
        category_id INTEGER,
        video_type TEXT CHECK (video_type IN ('slide', 'video', 'interactive')),
        is_featured BOOLEAN DEFAULT 0,
        view_count INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES categories (id)
      )`);

      // Categories table
      db.run(`CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        icon TEXT,
        color TEXT,
        type TEXT NOT NULL CHECK(type IN ('podcast', 'presentation', 'document')),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`);

      // Insert default presentation categories
      db.run(`INSERT OR IGNORE INTO categories (name, description, icon, color, type) VALUES
        ('Architecture', 'System architecture and infrastructure presentations', 'fas fa-building', '#667eea', 'presentation'),
        ('Technical', 'Technical deep-dives and implementation details', 'fas fa-cogs', '#764ba2', 'presentation'),
        ('Features', 'Product features and functionality showcases', 'fas fa-star', '#f093fb', 'presentation'),
        ('Security', 'Security, privacy and compliance presentations', 'fas fa-shield-alt', '#f5576c', 'presentation'),
        ('AI Technology', 'Artificial intelligence and machine learning', 'fas fa-brain', '#4facfe', 'presentation'),
        ('Analytics', 'Data analytics and business intelligence', 'fas fa-chart-line', '#43e97b', 'presentation')
      `);

      // Content categories junction table
      db.run(`CREATE TABLE IF NOT EXISTS content_categories (
        content_id INTEGER,
        category_id INTEGER,
        FOREIGN KEY (content_id) REFERENCES content (id),
        FOREIGN KEY (category_id) REFERENCES categories (id),
        PRIMARY KEY (content_id, category_id)
      )`, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  });
};

module.exports = { db, initDatabase };