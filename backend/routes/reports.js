const express = require('express');
const { db } = require('../config/database');
const router = express.Router();

// Submit report
router.post('/', (req, res) => {
  const { userId, nickname, reason, description, fix } = req.body;

  if (!userId || !nickname || !reason || !description) {
    return res.status(400).json({ error: 'Все обязательные поля должны быть заполнены' });
  }

  db.run('INSERT INTO reports (user_id, nickname, reason, description, fix) VALUES (?, ?, ?, ?, ?)',
    [userId, nickname, reason, description, fix || ''], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Ошибка при отправке репорта' });
    }
    res.json({ message: 'Репорт отправлен' });
  });
});

// Get all reports
router.get('/', (req, res) => {
  db.all(`SELECT r.*, u.username as user_username 
          FROM reports r 
          JOIN users u ON r.user_id = u.id 
          ORDER BY r.created_at DESC`, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Ошибка при получении репортов' });
    }
    res.json(rows);
  });
});

// Get reports count
router.get('/count', (req, res) => {
  db.get('SELECT COUNT(*) as count FROM reports', (err, row) => {
    if (err) {
      return res.status(500).json({ error: 'Ошибка при получении количества репортов' });
    }
    res.json({ count: row.count });
  });
});

module.exports = router;