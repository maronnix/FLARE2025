const express = require('express');
const bcrypt = require('bcryptjs');
const { db } = require('../config/database');
const router = express.Router();

const allowedUsernames = [
  "макос", "акиракуме", "akirakume", "makos", 
  "izumrudik", "изумрудик", "изумруд", "izumrud", "2010_1702", "джек подрочитель", "karyuudo",
  "qusti", "qusti1", "qusti11", "qusti111",
  "dony_zq", "sad_dony", "uw7dhdywg",
  "eozik", "ёжик", "ежик", "ежастик", "seriy_eozik",
  "nodben", "noden",
  "flourin", "flourinees", "flouriness", "flouurinskiy",
  "пиздабол", "cloury", "ainiiaz0132",
  "jr1_s", "menchik", "menchik_342", "sss+", "s1b+",
  "maronnix9991"
];

// Register
router.post('/register', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Все поля обязательны для заполнения' });
  }

  const usernameLower = username.toLowerCase();
  if (!allowedUsernames.includes(usernameLower)) {
    return res.status(400).json({ error: 'Ваш никнейм не найден в списке разрешенных' });
  }

  // Check if user already exists
  db.get('SELECT id FROM users WHERE username = ?', [usernameLower], (err, row) => {
    if (err) {
      return res.status(500).json({ error: 'Ошибка сервера' });
    }
    if (row) {
      return res.status(400).json({ error: 'Аккаунт с таким никнеймом уже зарегистрирован' });
    }

    // Create new user
    const passwordHash = bcrypt.hashSync(password, 10);
    db.run('INSERT INTO users (username, password_hash) VALUES (?, ?)', [usernameLower, passwordHash], function(err) {
      if (err) {
        return res.status(500).json({ error: 'Ошибка при создании аккаунта' });
      }
      res.json({ 
        message: 'Регистрация прошла успешно!',
        user: { id: this.lastID, username: usernameLower }
      });
    });
  });
});

// Login
router.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Все поля обязательны для заполнения' });
  }

  const usernameLower = username.toLowerCase();
  
  db.get('SELECT * FROM users WHERE username = ?', [usernameLower], (err, user) => {
    if (err) {
      return res.status(500).json({ error: 'Ошибка сервера' });
    }
    if (!user) {
      return res.status(400).json({ error: 'Аккаунт с таким никнеймом не зарегистрирован' });
    }

    if (!bcrypt.compareSync(password, user.password_hash)) {
      return res.status(400).json({ error: 'Неверный пароль' });
    }

    res.json({ 
      message: 'Успешный вход!',
      user: { id: user.id, username: user.username }
    });
  });
});

module.exports = router;