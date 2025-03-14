/**
 * Service for handling user progression, levels, and rewards
 * Later this will be integrated with blockchain
 */

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
    // For now, using a mock system
    // In production, this would fetch from database or blockchain
    
    const mockData = {
      totalPoints: 1250,
      xp: 850,
      inventory: [
        { itemId: 'hint', quantity: 3 },
        { itemId: 'theme_dark', quantity: 1 }
      ]
    };
    
    const levelInfo = calculateLevelFromXP(mockData.xp);
    
    return {
      ...mockData,
      ...levelInfo
    };
  };
  
  // Award XP to player
  const awardXP = async (playerIdentifier, amount) => {
    // For now, this is a mock
    // In production, this would update database or blockchain
    console.log(`Awarding ${amount} XP to player ${playerIdentifier}`);
    
    return {
      success: true,
      xpAwarded: amount
    };
  };
  
  module.exports = {
    calculateLevelFromXP,
    getPlayerProgression,
    awardXP
  };