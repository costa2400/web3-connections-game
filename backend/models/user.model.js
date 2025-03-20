const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: false,
    unique: true,
    sparse: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: false
  },
  walletAddress: {
    type: String,
    required: false,
    unique: true,
    sparse: true
  },
  authType: {
    type: String,
    enum: ['email', 'wallet'],
    default: 'email'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastLoginAt: {
    type: Date
  }
});

module.exports = mongoose.model('User', userSchema);