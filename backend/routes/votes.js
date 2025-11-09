const express = require('express');
const { db } = require('../config/database');
const router = express.Router();

// Submit vote
router.post('/', (req, res) => {
  const { userId, nominationId, nominee } = req.body;

  if (!userId || !nominationId || !nominee) {
    return res.status(400).json({ error: 'Все поля обязательны' });
  }

  // Check if user already voted for this nomination
  db.get('SELECT id FROM votes WHERE user_id = ? AND nomination_id = ?', [userId, nominationId], (err, row) => {
    if (err) {
      return res.status(500).json({ error: 'Ошибка сервера' });
    }

    if (row) {
      // Update existing vote
      db.run('UPDATE votes SET nominee = ? WHERE id = ?', [nominee, row.id], function(err) {
        if (err) {
          return res.status(500).json({ error: 'Ошибка при обновлении голоса' });
        }
        res.json({ message: 'Голос обновлен' });
      });
    } else {
      // Create new vote
      db.run('INSERT INTO votes (user_id, nomination_id, nominee) VALUES (?, ?, ?)', 
        [userId, nominationId, nominee], function(err) {
        if (err) {
          return res.status(500).json({ error: 'Ошибка при сохранении голоса' });
        }
        res.json({ message: 'Голос сохранен' });
      });
    }
  });
});

// Get user votes
router.get('/user/:userId', (req, res) => {
  const { userId } = req.params;

  db.all(`SELECT v.*, n.name as nomination_name, n.category 
          FROM votes v 
          JOIN nominations n ON v.nomination_id = n.id 
          WHERE v.user_id = ?`, [userId], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Ошибка при получении голосов' });
    }
    
    const votes = {};
    rows.forEach(row => {
      votes[row.nomination_id] = {
        nominee: row.nominee,
        nominationName: row.nomination_name,
        category: row.category
      };
    });
    
    res.json(votes);
  });
});

// Get voting results
router.get('/results', (req, res) => {
  db.all(`SELECT n.id as nomination_id, n.name as nomination_name, n.category,
                 v.nominee, COUNT(v.nominee) as vote_count
          FROM nominations n
          LEFT JOIN votes v ON n.id = v.nomination_id
          GROUP BY n.id, v.nominee
          ORDER BY n.category, n.id, vote_count DESC`, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Ошибка при получении результатов' });
    }

    const results = {};
    rows.forEach(row => {
      if (!results[row.nomination_id]) {
        results[row.nomination_id] = {
          name: row.nomination_name,
          category: row.category,
          votes: {}
        };
      }
      if (row.nominee) {
        results[row.nomination_id].votes[row.nominee] = row.vote_count;
      }
    });

    res.json(results);
  });
});

// Get detailed statistics
router.get('/stats/detailed', (req, res) => {
  db.all(`SELECT u.username, n.name as nomination_name, v.nominee, v.created_at
          FROM votes v
          JOIN users u ON v.user_id = u.id
          JOIN nominations n ON v.nomination_id = n.id
          ORDER BY n.name, v.created_at`, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Ошибка при получении статистики' });
    }
    res.json(rows);
  });
});

module.exports = router;