const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth.routes');
const gameRoutes = require('./routes/game.routes');
const rewardRoutes = require('./routes/reward.routes');
const gameProgressRoutes = require('./routes/gameProgress.routes');
const userRoutes = require('./routes/user.routes');
const leaderboardRoutes = require('./routes/leaderboard.routes');

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/games', gameRoutes);
app.use('/api/rewards', rewardRoutes);
app.use('/api/progress', gameProgressRoutes);
app.use('/api/users', userRoutes);
app.use('/api/leaderboard', leaderboardRoutes);

// Basic route for testing
app.get('/api/health', (req, res) => {
  res.status(200).json({ message: 'Server is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'An unexpected error occurred',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

module.exports = app;