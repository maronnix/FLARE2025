const express = require('express');
const { db } = require('../config/database');
const router = express.Router();

// Get all nominations
router.get('/', (req, res) => {
  db.all('SELECT * FROM nominations ORDER BY category, id', (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Ошибка при получении номинаций' });
    }
    
    const nominations = {
      main: rows.filter(row => row.category === 'main'),
      additional: rows.filter(row => row.category === 'additional')
    };
    
    res.json(nominations);
  });
});

// Update nomination image
router.put('/:id/image', (req, res) => {
  const { id } = req.params;
  const { imageUrl } = req.body;

  db.run('UPDATE nominations SET image_url = ? WHERE id = ?', [imageUrl, id], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Ошибка при обновлении изображения' });
    }
    res.json({ message: 'Изображение обновлено' });
  });
});

module.exports = router;