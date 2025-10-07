const express = require('express');
const { database } = require('../database/index');
const router = express.Router();

// Get all content for public streaming
router.get('/content', async (req, res) => {
  try {
    const { type, search, limit = 50, offset = 0, video_type } = req.query;
    
    let query = `
      SELECT c.*, cat.name as category_name, cat.color as category_color, cat.icon as category_icon
      FROM content c 
      LEFT JOIN categories cat ON c.category_id = cat.id 
      WHERE 1=1
    `;
    let params = [];

    if (type) {
      query += ' AND c.type = ?';
      params.push(type);
    }

    if (video_type) {
      query += ' AND c.video_type = ?';
      params.push(video_type);
    }

    if (search) {
      query += ' AND (c.title LIKE ? OR c.description LIKE ? OR c.tags LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    query += ' ORDER BY c.is_featured DESC, c.created_at DESC LIMIT ? OFFSET ?';
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
    const content = await database.get(`
      SELECT c.*, cat.name as category_name, cat.color as category_color, cat.icon as category_icon
      FROM content c 
      LEFT JOIN categories cat ON c.category_id = cat.id 
      WHERE c.id = ?
    `, [id]);
    
    if (!content) {
      return res.status(404).json({ success: false, message: 'Content not found' });
    }
    res.json({ success: true, content });
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({ success: false, message: 'Database error' });
  }
});

// Update view count for content
router.post('/content/:id/view', async (req, res) => {
  try {
    const { id } = req.params;
    await database.run('UPDATE content SET view_count = view_count + 1 WHERE id = ?', [id]);
    res.json({ success: true, message: 'View count updated' });
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
      SELECT c.*, cat.name as category_name, cat.color as category_color, cat.icon as category_icon
      FROM content c 
      LEFT JOIN categories cat ON c.category_id = cat.id 
      ORDER BY c.is_featured DESC, c.created_at DESC 
      LIMIT 6
    `);
    res.json({ success: true, content });
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({ success: false, message: 'Database error' });
  }
});

// Get categories
router.get('/categories', async (req, res) => {
  try {
    const { type } = req.query;
    let query = 'SELECT * FROM categories';
    let params = [];

    if (type) {
      query += ' WHERE type = ?';
      params.push(type);
    }

    query += ' ORDER BY name';
    const categories = await database.all(query, params);
    res.json({ success: true, categories });
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({ success: false, message: 'Database error' });
  }
});

module.exports = router;