// backend/routes/game.routes.js
const express = require('express');
const router = express.Router();
const gameController = require('../controllers/game.controller');
const authMiddleware = require('../middleware/auth.middleware');
const optionalAuth = require('../middleware/optionalAuth.middleware');

// Public routes (authentication optional)
// Get a new game
router.get('/new', optionalAuth, gameController.getNewGame);

// Submit a guess
router.post('/guess', optionalAuth, gameController.submitGuess);

// Get game stats (more detailed if authenticated)
router.get('/stats', optionalAuth, gameController.getGameStats);

// Get daily challenge
router.get('/daily', optionalAuth, gameController.getDailyChallenge);

module.exports = router;