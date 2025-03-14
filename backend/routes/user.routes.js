const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');

// Get player progression
router.get('/progression', userController.getProgression);

// Get player inventory
router.get('/inventory', userController.getInventory);

// Use an item from inventory
router.post('/items/use', userController.useItem);

module.exports = router;