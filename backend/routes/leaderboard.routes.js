const express = require('express');
const router = express.Router();
const leaderboardController = require('../controllers/leaderboard.controller');

// Get global leaderboard
router.get('/global', leaderboardController.getGlobalLeaderboard);

// Get player's rank
router.get('/rank', leaderboardController.getPlayerRank);

module.exports = router;