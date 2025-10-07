const express = require('express');
const bcrypt = require('bcryptjs');
const { database } = require('../database/index');
const router = express.Router();

// Admin login
router.post('/admin-login', async (req, res) => {
  const { email, password } = req.body;
  const isAjax = req.headers['content-type'] === 'application/json';

  const handleSuccess = () => {
    if (isAjax) {
      return res.json({ success: true, message: 'Login successful' });
    } else {
      return res.redirect('/admin-dashboard');
    }
  };

  const handleError = (message, status = 401) => {
    if (isAjax) {
      return res.status(status).json({ success: false, message });
    } else {
      return res.redirect(`/admin-login?error=${encodeURIComponent(message)}`);
    }
  };

  try {
    // Check demo credentials first
    if (email === process.env.DEMO_ADMIN_EMAIL && password === process.env.DEMO_ADMIN_PASSWORD) {
      req.session.adminId = 'demo';
      req.session.adminEmail = email;
      req.session.adminName = 'Demo Admin';
      return handleSuccess();
    }

    // Check database for admins
    const admin = await database.get('SELECT * FROM admins WHERE email = ?', [email]);
    
    if (!admin) {
      return handleError('Invalid credentials');
    }

    const isValidPassword = await bcrypt.compare(password, admin.password);
    if (!isValidPassword) {
      return handleError('Invalid credentials');
    }

    req.session.adminId = admin.id;
    req.session.adminEmail = admin.email;
    req.session.adminName = admin.name;

    return handleSuccess();
  } catch (error) {
    return handleError('Server error', 500);
  }
});

// Admin logout
router.post('/admin-logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Logout failed' });
    }
    res.json({ success: true, message: 'Logged out successfully', redirect: '/' });
  });
});

// Check admin session
router.get('/admin-check', (req, res) => {
  if (req.session.adminId) {
    res.json({ 
      success: true, 
      admin: {
        id: req.session.adminId,
        email: req.session.adminEmail,
        name: req.session.adminName
      }
    });
  } else {
    res.status(401).json({ success: false, message: 'Not authenticated' });
  }
});

module.exports = router;