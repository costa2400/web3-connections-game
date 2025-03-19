// backend/routes/game.routes.js
const express = require('express');
const router = express.Router();
const gameController = require('../controllers/game.controller');

// Get a new game
router.get('/new', gameController.getNewGame);

// Submit a guess
router.post('/guess', gameController.submitGuess);

// Get game stats
router.get('/stats', gameController.getGameStats);

module.exports = router;