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