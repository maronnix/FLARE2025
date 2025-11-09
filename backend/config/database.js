const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');

const dbPath = path.join(__dirname, '..', 'database.sqlite');
const db = new sqlite3.Database(dbPath);

// Initialize database
const init = () => {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Users table
      db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`);

      // Nominations table
      db.run(`CREATE TABLE IF NOT EXISTS nominations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        category TEXT NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        image_url TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`);

      // Votes table
      db.run(`CREATE TABLE IF NOT EXISTS votes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        nomination_id INTEGER NOT NULL,
        nominee TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id),
        FOREIGN KEY (nomination_id) REFERENCES nominations (id),
        UNIQUE(user_id, nomination_id)
      )`);

      // Reports table
      db.run(`CREATE TABLE IF NOT EXISTS reports (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        nickname TEXT NOT NULL,
        reason TEXT NOT NULL,
        description TEXT NOT NULL,
        fix TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
      )`);

      // Insert default nominations
      const defaultNominations = [
        // Main nominations
        { category: 'main', name: 'Лучший игрок года', description: 'За выдающиеся достижения в игровом процессе и мастерство', image_url: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&h=691&q=80' },
        { category: 'main', name: 'Самый активный участник', description: 'За постоянную активность и вовлеченность в жизнь сообщества', image_url: 'https://images.unsplash.com/photo-1511988617509-a57c8a288659?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&h=691&q=80' },
        { category: 'main', name: 'Лучший коммуникатор', description: 'За умение общаться и создавать приятную атмосферу в коллективе', image_url: 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&h=691&q=80' },
        { category: 'main', name: 'Душа компании', description: 'За создание дружеской и веселой атмосферы в сообществе', image_url: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&h=691&q=80' },
        { category: 'main', name: 'Прорыв года', description: 'За наибольший прогресс и развитие за последний год', image_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&h=691&q=80' },
        { category: 'main', name: 'Лучший ролевик', description: 'За качественную игру и создание интересных персонажей', image_url: 'https://images.unsplash.com/photo-1547891654-e66ed7ebb968?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&h=691&q=80' },
        
        // Additional nominations
        { category: 'additional', name: 'Самый веселый участник', description: 'За способность поднять настроение окружающим и создать позитивную атмосферу', image_url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&h=691&q=80' },
        { category: 'additional', name: 'Лучший строитель', description: 'За создание впечатляющих построек и архитектурных шедевров', image_url: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&h=691&q=80' },
        { category: 'additional', name: 'Музыкальный талант', description: 'За музыкальные способности и создание приятной атмосферы', image_url: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&h=691&q=80' },
        { category: 'additional', name: 'Творческая личность', description: 'За художественные и творческие достижения в различных областях', image_url: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&h=691&q=80' },
        { category: 'additional', name: 'Лучший организатор', description: 'За организацию мероприятий, ивентов и активностей', image_url: 'https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&h=691&q=80' },
        { category: 'additional', name: 'Технический специалист', description: 'За помощь в технических вопросах и решение сложных проблем', image_url: 'https://images.unsplash.com/photo-1526379879527-8559ecfcaec0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&h=691&q=80' },
        { category: 'additional', name: 'Самый мудрый советчик', description: 'За полезные советы, помощь другим и мудрые решения', image_url: 'https://images.unsplash.com/photo-1544717305-2782549b5136?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&h=691&q=80' },
        { category: 'additional', name: 'Лучший исследователь', description: 'За исследование мира, открытие новых мест и интересные находки', image_url: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&h=691&q=80' },
        { category: 'additional', name: 'Лучший PvP-игрок', description: 'За мастерство в боях против других игроков и тактические навыки', image_url: 'https://images.unsplash.com/photo-1542751110-97427bbecf20?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&h=691&q=80' },
        { category: 'additional', name: 'Идея года', description: 'За самую интересную, оригинальную и полезную идею', image_url: 'https://images.unsplash.com/photo-1507413245164-6160d8298b31?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&h=691&q=80' },
        { category: 'additional', name: 'Король/Королева ивентов', description: 'За активное участие в мероприятиях и создание запоминающихся моментов', image_url: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&h=691&q=80' }
      ];

      const stmt = db.prepare(`INSERT OR IGNORE INTO nominations (category, name, description, image_url) VALUES (?, ?, ?, ?)`);
      defaultNominations.forEach(nomination => {
        stmt.run([nomination.category, nomination.name, nomination.description, nomination.image_url]);
      });
      stmt.finalize();

      // Create admin user
      const adminPasswordHash = bcrypt.hashSync('admin123', 10);
      db.run(`INSERT OR IGNORE INTO users (username, password_hash) VALUES (?, ?)`, ['maronnix9991', adminPasswordHash]);

      console.log('✅ Database initialized successfully');
      resolve();
    });
  });
};

module.exports = { db, init };