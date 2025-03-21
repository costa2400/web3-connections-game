/**
 * Service for handling user progression, levels, and rewards
 * Integrates with database and blockchain
 */
const mongoose = require('mongoose');
const User = require('../models/user.model');
const GameProgress = require('../models/gameProgress.model');
const { mintReward } = require('./cosmos.service');

// Simple level progression system
const calculateLevelFromXP = (xp) => {
  const baseXP = 100;
  const scaleFactor = 1.5;
  
  let level = 1;
  let xpForNextLevel = baseXP;
  
  while (xp >= xpForNextLevel) {
    level++;
    xpForNextLevel = Math.round(baseXP * Math.pow(scaleFactor, level - 1));
  }
  
  return {
    level,
    currentXP: xp,
    xpForNextLevel,
    progress: Math.min(Math.floor((xp / xpForNextLevel) * 100), 100)
  };
};

// Award XP to a user
const awardXP = async (userId, amount) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Update user's XP
    user.xp += amount;
    
    // Calculate new level info
    const levelInfo = calculateLevelFromXP(user.xp);
    
    // Check if leveled up
    const leveledUp = levelInfo.level > user.level;
    if (leveledUp) {
      user.level = levelInfo.level;
    }
    
    // Save the updated user
    await user.save();
    
    return {
      xpAwarded: amount,
      leveledUp,
      newXP: user.xp,
      newLevel: user.level
    };
  } catch (error) {
    console.error('Award XP error:', error);
    throw error;
  }
};

// Award points to a user
const awardPoints = async (userId, amount) => {
  try {
    // For now, just return success
    // In production, this would update user points
    return true;
  } catch (error) {
    console.error('Award points error:', error);
    throw error;
  }
};

// Check user achievements
const checkAchievements = async (userId) => {
  try {
    // For now, just return success
    // In production, this would check and award achievements
    return true;
  } catch (error) {
    console.error('Check achievements error:', error);
    throw error;
  }
};

// Calculate player level and XP from game progress
const getPlayerProgression = async (playerIdentifier) => {
  try {
    // Find user by identifier (could be ID or wallet address)
    let user;
    
    if (mongoose.Types.ObjectId.isValid(playerIdentifier)) {
      user = await User.findById(playerIdentifier);
    } else {
      // Look for username or wallet address
      user = await User.findOne({
        $or: [
          { username: playerIdentifier },
          { walletAddress: playerIdentifier }
        ]
      });
    }
    
    if (!user) {
      // Return default progression for anonymous players
      return {
        totalPoints: 0,
        xp: 0,
        level: 1,
        xpForNextLevel: 100,
        progress: 0,
        inventory: []
      };
    }
    
    // Calculate level info
    const levelInfo = calculateLevelFromXP(user.xp);
    
    // Check if level has changed (level up)
    if (levelInfo.level !== user.level) {
      // Update user level
      user.level = levelInfo.level;
      await user.save();
    }
    
    return {
      totalPoints: user.totalPoints,
      xp: user.xp,
      inventory: user.inventory,
      achievements: user.achievements,
      ...levelInfo
    };
  } catch (error) {
    console.error('Get player progression error:', error);
    throw error;
  }
};

// Export all functions
module.exports = {
  calculateLevelFromXP,
  getPlayerProgression,
  awardXP,
  awardPoints,
  checkAchievements
};