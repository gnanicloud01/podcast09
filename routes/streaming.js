const express = require('express');
const { database } = require('../database/index');
const router = express.Router();

// Get all content for public streaming
router.get('/content', async (req, res) => {
  try {
    const { type, search, limit = 50, offset = 0 } = req.query;
    
    let query = 'SELECT * FROM content WHERE 1=1';
    let params = [];

    if (type) {
      query += ' AND type = ?';
      params.push(type);
    }

    if (search) {
      query += ' AND (title LIKE ? OR description LIKE ? OR tags LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const content = await database.all(query, params);
    res.json({ success: true, content });
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({ success: false, message: 'Database error' });
  }
});

// Get single content item
router.get('/content/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const content = await database.get('SELECT * FROM content WHERE id = ?', [id]);
    
    if (!content) {
      return res.status(404).json({ success: false, message: 'Content not found' });
    }
    res.json({ success: true, content });
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({ success: false, message: 'Database error' });
  }
});

// Get content by type with stats
router.get('/stats/:type', async (req, res) => {
  try {
    const { type } = req.params;
    const stats = await database.all(`
      SELECT 
        COUNT(*) as total_count,
        SUM(duration) as total_duration,
        SUM(file_size) as total_size
      FROM content 
      WHERE type = ?
    `, [type]);
    
    res.json({ success: true, stats: stats[0] });
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({ success: false, message: 'Database error' });
  }
});

// Get featured content (latest 6 items)
router.get('/featured', async (req, res) => {
  try {
    const content = await database.all(`
      SELECT * FROM content 
      ORDER BY created_at DESC 
      LIMIT 6
    `);
    res.json({ success: true, content });
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({ success: false, message: 'Database error' });
  }
});

module.exports = router;