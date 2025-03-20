// backend/models/gameProgress.model.js
const mongoose = require('mongoose');

const gameProgressSchema = new mongoose.Schema({
  // Can be either a user ID or a simple identifier like 'anonymous'
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
  timeCompleted: {
    type: Date
  },
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
  },
  isDaily: {
    type: Boolean,
    default: false
  },
  doublePointsActive: {
    type: Boolean,
    default: false
  },
  hintsUsed: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

// Create a compound index for player and game
gameProgressSchema.index({ playerIdentifier: 1, gameId: 1 }, { unique: true });

module.exports = mongoose.model('GameProgress', gameProgressSchema);