// backend/models/game.model.js
const mongoose = require('mongoose');

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
gameSchema.statics.createNewGame = async function() {
  // Sample game data - in production, this would be more dynamic
  const sampleGame = {
    groups: [
      ['Bitcoin', 'Ethereum', 'Cardano', 'Solana'],
      ['Wallet', 'Private Key', 'Seed Phrase', 'Public Address'],
      ['Smart Contract', 'DApp', 'Token', 'NFT'],
      ['Mining', 'Staking', 'Yield Farming', 'Liquidity Pool']
    ],
    groupNames: [
      'Cryptocurrencies',
      'Wallet Components',
      'Blockchain Applications',
      'Earning Methods'
    ],
    groupColors: [
      '#FF6B6B',  // Red
      '#4ECDC4',  // Teal
      '#45B7D1',  // Blue
      '#96CEB4'   // Green
    ]
  };

  return this.create(sampleGame);
};

module.exports = mongoose.model('Game', gameSchema);