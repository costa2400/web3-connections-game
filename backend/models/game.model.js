// backend/models/game.model.js
const mongoose = require('mongoose');
const wordDatabase = require('../data/wordDatabase');

const gameSchema = new mongoose.Schema({
  groups: [[String]],
  groupNames: [String],
  groupColors: [String],
  isDaily: {
    type: Boolean,
    default: false
  },
  dailyDate: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: '30d' // Automatically deleted after 30 days
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

// Static method to create a new game
gameSchema.statics.createNewGame = async function(isDaily = false) {
  let gameData;
  
  if (isDaily) {
    // Get today's date and generate a daily game
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    gameData = wordDatabase.getDailyGame(today);
    gameData.isDaily = true;
    gameData.dailyDate = today;
  } else {
    // Generate a random game for practice
    gameData = wordDatabase.getDailyGame(new Date(Math.random() * Date.now()));
  }

  return this.create(gameData);
};

// Static method to get or create daily challenge
gameSchema.statics.getDailyChallenge = async function() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Try to find today's challenge
  let dailyGame = await this.findOne({
    isDaily: true,
    dailyDate: {
      $gte: today,
      $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
    }
  });
  
  // If no daily challenge exists, create one
  if (!dailyGame) {
    dailyGame = await this.createNewGame(true);
  }
  
  return dailyGame;
};

module.exports = mongoose.model('Game', gameSchema);