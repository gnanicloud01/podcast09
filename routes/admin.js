const express = require('express');
const { database } = require('../database/index');
const router = express.Router();

// Middleware to check admin authentication
const requireAdmin = (req, res, next) => {
  if (!req.session.adminId) {
    return res.status(401).json({ success: false, message: 'Admin authentication required' });
  }
  next();
};

// Get all content
router.get('/content', requireAdmin, async (req, res) => {
  try {
    const { type } = req.query;
    let query = `
      SELECT c.*, cat.name as category_name, cat.color as category_color 
      FROM content c 
      LEFT JOIN categories cat ON c.category_id = cat.id
    `;
    let params = [];

    if (type) {
      query += ' WHERE c.type = ?';
      params.push(type);
    }

    query += ' ORDER BY c.created_at DESC';
    const content = await database.all(query, params);
    res.json({ success: true, content });
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({ success: false, message: 'Database error' });
  }
});

// Add new content
router.post('/content', requireAdmin, async (req, res) => {
  try {
    const { title, description, type, s3_url, thumbnail_url, duration, file_size, tags, video_type, category_id, is_featured } = req.body;

    if (!title || !type || !s3_url) {
      return res.status(400).json({ success: false, message: 'Title, type, and S3 URL are required' });
    }

    const query = `
      INSERT INTO content (title, description, type, s3_url, thumbnail_url, duration, file_size, tags, video_type, category_id, is_featured)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const result = await database.run(query, [
      title, description, type, s3_url, thumbnail_url, duration, file_size, tags, 
      video_type, category_id, is_featured ? 1 : 0
    ]);
    res.json({ success: true, message: 'Content added successfully', id: result.lastID });
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({ success: false, message: 'Failed to add content' });
  }
});

// Update content
router.put('/content/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, type, s3_url, thumbnail_url, duration, file_size, tags, video_type, category_id, is_featured } = req.body;

    const query = `
      UPDATE content 
      SET title = ?, description = ?, type = ?, s3_url = ?, thumbnail_url = ?, 
          duration = ?, file_size = ?, tags = ?, video_type = ?, category_id = ?, 
          is_featured = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;

    const result = await database.run(query, [
      title, description, type, s3_url, thumbnail_url, duration, file_size, tags, 
      video_type, category_id, is_featured ? 1 : 0, id
    ]);
    
    if (result.changes === 0) {
      return res.status(404).json({ success: false, message: 'Content not found' });
    }
    res.json({ success: true, message: 'Content updated successfully' });
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({ success: false, message: 'Failed to update content' });
  }
});

// Delete content
router.delete('/content/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await database.run('DELETE FROM content WHERE id = ?', [id]);
    
    if (result.changes === 0) {
      return res.status(404).json({ success: false, message: 'Content not found' });
    }
    res.json({ success: true, message: 'Content deleted successfully' });
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({ success: false, message: 'Failed to delete content' });
  }
});

// Get categories
router.get('/categories', requireAdmin, async (req, res) => {
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

// Add category
router.post('/categories', requireAdmin, async (req, res) => {
  try {
    const { name, type } = req.body;

    if (!name || !type) {
      return res.status(400).json({ success: false, message: 'Name and type are required' });
    }

    const result = await database.run('INSERT INTO categories (name, type) VALUES (?, ?)', [name, type]);
    res.json({ success: true, message: 'Category added successfully', id: result.lastID });
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({ success: false, message: 'Failed to add category' });
  }
});

// Bulk upload content
router.post('/bulk-upload', requireAdmin, async (req, res) => {
  try {
    const { content } = req.body;

    if (!content || !Array.isArray(content) || content.length === 0) {
      return res.status(400).json({ success: false, message: 'Content array is required' });
    }

    // Validate required fields for each item
    const validTypes = ['podcast', 'presentation', 'document'];
    const errors = [];
    
    content.forEach((item, index) => {
      if (!item.title) errors.push(`Row ${index + 1}: Title is required`);
      if (!item.type) errors.push(`Row ${index + 1}: Type is required`);
      if (!validTypes.includes(item.type)) errors.push(`Row ${index + 1}: Type must be podcast, presentation, or document`);
      if (!item.s3_url) errors.push(`Row ${index + 1}: S3 URL is required`);
    });

    if (errors.length > 0) {
      return res.status(400).json({ success: false, message: 'Validation errors', errors });
    }

    // Prepare bulk insert
    const query = `
      INSERT INTO content (title, description, type, s3_url, thumbnail_url, duration, file_size, tags)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    let successCount = 0;
    let errorCount = 0;
    
    for (const item of content) {
      try {
        const duration = item.duration ? parseInt(item.duration) : null;
        const fileSize = item.file_size ? parseInt(item.file_size) : null;
        
        await database.run(query, [
          item.title,
          item.description || null,
          item.type,
          item.s3_url,
          item.thumbnail_url || null,
          duration,
          fileSize,
          item.tags || null
        ]);
        successCount++;
      } catch (err) {
        console.error('Bulk insert error:', err);
        errorCount++;
      }
    }

    if (successCount > 0) {
      res.json({ 
        success: true, 
        message: `Successfully uploaded ${successCount} items${errorCount > 0 ? `, ${errorCount} failed` : ''}`,
        count: successCount,
        errors: errorCount
      });
    } else {
      res.status(500).json({ success: false, message: 'All uploads failed' });
    }
  } catch (err) {
    console.error('Bulk upload error:', err);
    res.status(500).json({ success: false, message: 'Bulk upload failed' });
  }
});

module.exports = router;