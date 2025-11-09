const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const db = require('./config/database');

const app = express();

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(cors());
app.use(express.json());

// Serve static files from frontend folder
app.use(express.static(path.join(__dirname, '../frontend')));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use(limiter);

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/nominations', require('./routes/nominations'));
app.use('/api/votes', require('./routes/votes'));
app.use('/api/reports', require('./routes/reports'));

// Serve frontend for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Initialize database and start server
db.init().then(() => {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🎨 Beautiful frontend available at http://localhost:${PORT}`);
    console.log(`📊 API available at http://localhost:${PORT}/api`);
  });
}).catch(err => {
  console.error('❌ Failed to start server:', err);
});