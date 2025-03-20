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

// Award XP to player
const awardXP = async (playerIdentifier, amount) => {
  try {
    // Find user by identifier
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
      return {
        success: false,
        message: 'User not found'
      };
    }
    
    // Current level
    const currentLevel = user.level;
    
    // Add XP
    user.xp += amount;
    
    // Calculate new level
    const levelInfo = calculateLevelFromXP(user.xp);
    user.level = levelInfo.level;
    
    // Check for level up
    const leveledUp = user.level > currentLevel;
    
    await user.save();
    
    return {
      success: true,
      xpAwarded: amount,
      currentXP: user.xp,
      newLevel: user.level,
      leveledUp
    };
  } catch (error) {
    console.error('Award XP error:', error);
    throw error;
  }
};

// Award points to player
const awardPoints = async (playerIdentifier, amount) => {
  try {
    // Find user by identifier
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
      return {
        success: false,
        message: 'User not found'
      };
    }
    
    // Add points
    user.totalPoints += amount;
    
    await user.save();
    
    return {
      success: true,
      pointsAwarded: amount,
      totalPoints: user.totalPoints
    };
  } catch (error) {
    console.error('Award points error:', error);
    throw error;
  }
};

// Check and award achievements based on game progress
const checkAchievements = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) return { success: false, message: 'User not found' };
    
    // Get player game stats
    const totalGames = await GameProgress.countDocuments({ 
      playerIdentifier: user._id.toString() 
    });
    
    const completedGames = await GameProgress.countDocuments({ 
      playerIdentifier: user._id.toString(),
      isCompleted: true 
    });
    
    // Current achievements
    const currentAchievements = user.achievements.map(a => a.id);
    const newAchievements = [];
    
    // Check for achievements
    
    // 1. First game completed
    if (completedGames >= 1 && !currentAchievements.includes('first_game')) {
      newAchievements.push({
        id: 'first_game',
        name: 'First Victory',
        description: 'Complete your first game',
        dateUnlocked: new Date(),
        icon: '🎮'
      });
    }
    
    // 2. Five games completed
    if (completedGames >= 5 && !currentAchievements.includes('five_games')) {
      newAchievements.push({
        id: 'five_games',
        name: 'Getting Started',
        description: 'Complete 5 games',
        dateUnlocked: new Date(),
        icon: '🎯'
      });
    }
    
    // 3. Ten games completed - eligible for NFT reward
    if (completedGames >= 10 && !currentAchievements.includes('ten_games')) {
      newAchievements.push({
        id: 'ten_games',
        name: 'Dedicated Player',
        description: 'Complete 10 games',
        dateUnlocked: new Date(),
        icon: '🏆'
      });
      
      // Add NFT reward to eligible rewards
      if (user.walletAddress) {
        try {
          // Mint NFT reward on blockchain
          const nftResult = await mintReward(user.walletAddress, 'nft_beginner');
          
          if (nftResult && nftResult.success) {
            // Add to inventory
            user.inventory.push({
              itemId: 'nft_beginner',
              name: 'Beginner Trophy',
              quantity: 1,
              icon: '🏆',
              description: 'NFT reward for completing 10 games',
              txHash: nftResult.txHash,
              tokenId: nftResult.nftId
            });
          }
        } catch (nftError) {
          console.error('NFT minting error:', nftError);
          // Continue with achievement award even if NFT fails
        }
      }
    }
    
    // Add new achievements
    if (newAchievements.length > 0) {
      user.achievements.push(...newAchievements);
      await user.save();
      
      // Also award XP for achievements
      await awardXP(userId, newAchievements.length * 50);
    }
    
    return {
      success: true,
      newAchievements
    };
  } catch (error) {
    console.error('Check achievements error:', error);
    throw error;
  }
};

module.exports = {
  calculateLevelFromXP,
  getPlayerProgression,
  awardXP,
  awardPoints,
  checkAchievements
};