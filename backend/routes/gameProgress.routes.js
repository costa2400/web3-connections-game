const express = require('express');
const router = express.Router();
const gameProgressController = require('../controllers/gameProgress.controller');

// Get player's active games
router.get('/active', gameProgressController.getActiveGames);

// Get player stats
router.get('/stats', gameProgressController.getPlayerStats);

// Reset a game in progress
router.post('/:gameId/reset', gameProgressController.resetGame);

module.exports = router;