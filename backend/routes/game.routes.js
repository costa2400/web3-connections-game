const express = require('express');
const router = express.Router();
const gameController = require('../controllers/game.controller');

// Get a new game
router.get('/new', gameController.getNewGame);

// Submit a guess
router.post('/guess', gameController.submitGuess);

// Get player progress
router.get('/progress', gameController.getPlayerProgress);

// Get game stats (for development/testing)
router.get('/stats', gameController.getGameStats);

module.exports = router;