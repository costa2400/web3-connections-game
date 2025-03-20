const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const authMiddleware = require('../middleware/auth.middleware');

// Public routes (can be accessed without authentication)
// Get player progression (uses x-player-id header if not authenticated)
router.get('/progression', userController.getProgression);

// Get player inventory (uses x-player-id header if not authenticated)
router.get('/inventory', userController.getInventory);

// Protected routes (require authentication)
// Use an item from inventory
router.post('/items/use', authMiddleware, userController.useItem);

// Get player achievements
router.get('/achievements', userController.getAchievements);

// Check for new achievements
router.post('/achievements/check', authMiddleware, userController.checkAchievements);

module.exports = router;