// backend/models/reward.model.js
const mongoose = require('mongoose');

const rewardSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  cost: {
    type: Number,
    required: true
  },
  icon: {
    type: String,
    required: true
  },
  levelRequired: {
    type: Number,
    default: 1
  },
  type: {
    type: String,
    enum: ['theme', 'consumable', 'nft', 'token'],
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  blockchain: {
    isOnChain: {
      type: Boolean,
      default: false
    },
    contractAddress: String,
    tokenId: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Reward = mongoose.model('Reward', rewardSchema);

module.exports = Reward;