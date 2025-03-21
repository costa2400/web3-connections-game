const express = require('express');
const router = express.Router();
const rewardController = require('../controllers/reward.controller');

// Get all rewards
router.get('/', rewardController.getAllRewards);

// Get reward by ID
router.get('/:id', rewardController.getRewardById);

// Create initial rewards (for development/setup)
router.post('/init', rewardController.createInitialRewards);

// Get user rewards
router.get('/user', rewardController.getUserRewards);

// Claim reward
router.post('/claim', rewardController.claimReward);

module.exports = router;