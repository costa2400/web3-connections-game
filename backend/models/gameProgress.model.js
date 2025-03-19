// backend/models/gameProgress.model.js
const mongoose = require('mongoose');

const gameProgressSchema = new mongoose.Schema({
  // For now, we'll use a simpler model without user authentication
  playerIdentifier: {
    type: String,
    required: true
  },
  gameId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Game',
    required: true
  },
  solvedGroups: {
    type: [Number],
    default: []
  },
  timeStarted: {
    type: Date,
    default: Date.now
  },
  timeCompleted: Date,
  points: {
    type: Number,
    default: 0
  },
  streak: {
    type: Number,
    default: 0
  },
  attempts: {
    type: Number,
    default: 0
  },
  isCompleted: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

// Index for fast lookups
gameProgressSchema.index({ playerIdentifier: 1, gameId: 1 }, { unique: true });

const GameProgress = mongoose.model('GameProgress', gameProgressSchema);

module.exports = GameProgress;