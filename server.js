const express = require('express');
const cors = require('cors');
const session = require('express-session');
const path = require('path');
require('dotenv').config();

const { database } = require('./database/index');
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const streamingRoutes = require('./routes/streaming');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key-here',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 } // 24 hours
}));

// Routes
app.use('/auth', authRoutes);
app.use('/admin', adminRoutes);
app.use('/api', streamingRoutes);

// Main streaming page
app.get('/', (req, res) => {
  res.render('index');
});

// Admin login page
app.get('/admin-login', (req, res) => {
  res.render('admin-login');
});

// Admin dashboard
app.get('/admin-dashboard', (req, res) => {
  if (!req.session.adminId) {
    return res.redirect('/admin-login');
  }
  res.render('admin-dashboard');
});

// Debug page
app.get('/debug', (req, res) => {
  res.sendFile(__dirname + '/public/debug-admin.html');
});

// Test login page
app.get('/test-login', (req, res) => {
  res.sendFile(__dirname + '/public/test-login.html');
});

// Test admin dashboard
app.get('/test-admin', (req, res) => {
  res.sendFile(__dirname + '/test-admin-dashboard.html');
});

// Content section pages
app.get('/podcasts', (req, res) => {
  res.render('podcasts');
});

app.get('/presentations', (req, res) => {
  res.render('presentations');
});

app.get('/documents', (req, res) => {
  res.render('documents');
});

app.get('/gt-cloud', (req, res) => {
  res.render('gt-cloud');
});

// Simple admin creation endpoint
app.get('/create-admin-now', async (req, res) => {
  try {
    const bcrypt = require('bcryptjs');

    // Delete any existing admin
    await database.run('DELETE FROM admins WHERE email = ?', ['gnaneshwar14']);

    // Create fresh admin
    const hashedPassword = await bcrypt.hash('gnani@1429', 10);
    const result = await database.run(
      'INSERT INTO admins (email, password, name) VALUES (?, ?, ?)',
      ['gnaneshwar14', hashedPassword, 'Gnaneshwar']
    );

    res.json({
      success: true,
      message: 'Admin user created successfully!',
      adminId: result.lastID,
      credentials: {
        username: 'gnaneshwar14',
        password: 'gnani@1429'
      }
    });
  } catch (error) {
    res.json({
      success: false,
      error: error.message,
      message: 'Failed to create admin user'
    });
  }
});

// Debug endpoint to check admin users
app.get('/debug-admin', async (req, res) => {
  try {
    const admins = await database.all('SELECT id, email, name, created_at FROM admins');
    res.json({
      success: true,
      admins: admins,
      count: admins.length
    });
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
});

// Force create admin endpoint
app.get('/force-create-admin', async (req, res) => {
  try {
    const bcrypt = require('bcryptjs');

    // Delete existing admin if any
    await database.run('DELETE FROM admins WHERE email = ?', ['gnaneshwar14']);

    // Create new admin
    const hashedPassword = await bcrypt.hash('gnani@1429', 10);
    await database.run(
      'INSERT INTO admins (email, password, name) VALUES (?, ?, ?)',
      ['gnaneshwar14', hashedPassword, 'Gnaneshwar']
    );

    res.json({
      success: true,
      message: 'Admin user created successfully'
    });
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
});

// Initialize database and start server
async function startServer() {
  try {
    // Initialize database
    await database.init();

    // Auto-create admin user on startup
    try {
      const bcrypt = require('bcryptjs');

      // Check if admin exists first
      const existingAdmin = await database.get('SELECT id FROM admins WHERE email = ?', ['gnaneshwar14']);

      if (!existingAdmin) {
        const hashedPassword = await bcrypt.hash('gnani@1429', 10);
        await database.run(
          'INSERT INTO admins (email, password, name) VALUES (?, ?, ?)',
          ['gnaneshwar14', hashedPassword, 'Gnaneshwar']
        );
        console.log('✅ Admin user created successfully');
      } else {
        console.log('✅ Admin user already exists');
      }
    } catch (adminError) {
      console.log('⚠️ Admin user creation error:', adminError.message);

      // Force create admin if there's an issue
      try {
        const bcrypt = require('bcryptjs');
        const hashedPassword = await bcrypt.hash('gnani@1429', 10);
        await database.run(
          'DELETE FROM admins WHERE email = ?',
          ['gnaneshwar14']
        );
        await database.run(
          'INSERT INTO admins (email, password, name) VALUES (?, ?, ?)',
          ['gnaneshwar14', hashedPassword, 'Gnaneshwar']
        );
        console.log('✅ Admin user force created');
      } catch (forceError) {
        console.log('❌ Could not create admin user:', forceError.message);
      }
    }

    // Start server
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📱 Admin login: http://localhost:${PORT}/admin-login`);
      console.log(`🎵 Admin credentials: gnaneshwar14 / gnani@1429`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();