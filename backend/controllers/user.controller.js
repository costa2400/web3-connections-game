const userService = require('../services/user.service');
const User = require('../models/user.model');
const mongoose = require('mongoose');

// Get player progression (level, XP, etc.)
exports.getProgression = async (req, res) => {
  try {
    const userId = req.userId || req.headers['x-player-id'] || 'anonymous';
    
    const progression = await userService.getPlayerProgression(userId);
    
    res.status(200).json({ progression });
  } catch (error) {
    console.error('Get progression error:', error);
    res.status(500).json({ message: 'Server error while fetching progression' });
  }
};

// Get player inventory
exports.getInventory = async (req, res) => {
  try {
    const userId = req.userId || req.headers['x-player-id'] || 'anonymous';
    
    // If it's a valid user ID, fetch from database
    if (mongoose.Types.ObjectId.isValid(userId)) {
      const user = await User.findById(userId);
      
      if (user) {
        return res.status(200).json({ inventory: user.inventory || [] });
      }
    }
    
    // For anonymous users or if user not found
    res.status(200).json({ inventory: [] });
  } catch (error) {
    console.error('Get inventory error:', error);
    res.status(500).json({ message: 'Server error while fetching inventory' });
  }
};

// Use an item from inventory
exports.useItem = async (req, res) => {
  try {
    const { itemId, gameId } = req.body;
    const userId = req.userId;
    
    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    if (!itemId) {
      return res.status(400).json({ message: 'Item ID is required' });
    }
    
    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check if item exists in inventory
    const inventoryItem = user.inventory.find(item => item.itemId === itemId);
    if (!inventoryItem || inventoryItem.quantity <= 0) {
      return res.status(400).json({ message: 'Item not available in inventory' });
    }
    
    // Decrement item quantity
    inventoryItem.quantity -= 1;
    
    // If quantity reaches 0, consider removing item (unless it's a permanent item)
    if (inventoryItem.quantity <= 0 && !['theme_dark', 'theme_light'].includes(itemId)) {
      user.inventory = user.inventory.filter(item => item.itemId !== itemId);
    }
    
    await user.save();
    
    // Return what effect was applied (for client to implement)
    let effectDetails = {};
    
    switch (itemId) {
      case 'hint':
        effectDetails = { type: 'hint', message: 'Hint used to reveal a word' };
        break;
      case 'shuffle':
        effectDetails = { type: 'shuffle', message: 'Grid shuffled' };
        break;
      case 'time_freeze':
        effectDetails = { type: 'time_freeze', message: 'Timer frozen for 30 seconds', duration: 30 };
        break;
      case 'double_points':
        effectDetails = { type: 'double_points', message: 'Double points activated for next solve' };
        break;
      default:
        effectDetails = { type: itemId, message: 'Item effect applied' };
    }
    
    res.status(200).json({
      message: `Item ${itemId} used successfully`,
      success: true,
      effectApplied: true,
      effect: effectDetails,
      remainingQuantity: inventoryItem ? inventoryItem.quantity : 0
    });
  } catch (error) {
    console.error('Use item error:', error);
    res.status(500).json({ message: 'Server error while using item' });
  }
};

// Get player achievements
exports.getAchievements = async (req, res) => {
  try {
    const userId = req.userId || req.headers['x-player-id'] || 'anonymous';
    
    // If it's a valid user ID, fetch from database
    if (mongoose.Types.ObjectId.isValid(userId)) {
      const user = await User.findById(userId);
      
      if (user) {
        return res.status(200).json({ achievements: user.achievements || [] });
      }
    }
    
    // For anonymous users or if user not found
    res.status(200).json({ achievements: [] });
  } catch (error) {
    console.error('Get achievements error:', error);
    res.status(500).json({ message: 'Server error while fetching achievements' });
  }
};

// Check for new achievements
exports.checkAchievements = async (req, res) => {
  try {
    const userId = req.userId;
    
    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    // Check for new achievements
    const result = await userService.checkAchievements(userId);
    
    res.status(200).json({
      success: true,
      newAchievements: result.newAchievements || []
    });
  } catch (error) {
    console.error('Check achievements error:', error);
    res.status(500).json({ message: 'Server error while checking achievements' });
  }
};