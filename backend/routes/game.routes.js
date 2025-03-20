// backend/routes/game.routes.js
const express = require('express');
const router = express.Router();
const gameController = require('../controllers/game.controller');
const authMiddleware = require('../middleware/auth.middleware');
const optionalAuth = require('../middleware/optionalAuth.middleware');

// Public routes (authentication optional)
// Get a new practice game
router.get('/new', optionalAuth, gameController.getNewGame);

// Get daily challenge
router.get('/daily', optionalAuth, gameController.getDailyChallenge);

// Submit a guess
router.post('/guess', optionalAuth, gameController.submitGuess);

// Get game stats (more detailed if authenticated)
router.get('/stats', optionalAuth, gameController.getGameStats);

module.exports = router;