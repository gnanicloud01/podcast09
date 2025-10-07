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

// Initialize database and start server
async function startServer() {
  try {
    // Initialize database
    await database.init();
    
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