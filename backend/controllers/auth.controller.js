// backend/controllers/auth.controller.js
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { validationResult } = require('express-validator');
const User = require('../models/user.model');
const { verifyCosmosSignature } = require('../services/cosmos.service');

// Register a new user
exports.register = async (req, res) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, email, password, walletAddress } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [{ email }, { username }, { walletAddress }] 
    });

    if (existingUser) {
      return res.status(400).json({
        message: 'User already exists with this email, username, or wallet address'
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const user = new User({
      username,
      email,
      password: hashedPassword,
      walletAddress
    });

    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, walletAddress: user.walletAddress },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRATION }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        walletAddress: user.walletAddress
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

// Login with email and password
exports.login = async (req, res) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, walletAddress: user.walletAddress },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRATION }
    );

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        walletAddress: user.walletAddress
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

// Connect/authenticate with Cosmos wallet
exports.connectWallet = async (req, res) => {
  try {
    const { walletAddress, signature, message } = req.body;
    
    // Verify the signature
    const isValid = await verifyCosmosSignature(walletAddress, signature, message);
    
    if (!isValid) {
      return res.status(401).json({ message: 'Invalid signature' });
    }
    
    // Find or create user by wallet address
    let user = await User.findOne({ walletAddress });
    
    if (!user) {
      // Create new user with wallet only
      user = new User({
        username: `user_${walletAddress.slice(0, 8)}`,
        walletAddress,
        authType: 'wallet'
      });
      
      await user.save();
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, walletAddress },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRATION }
    );
    
    res.status(200).json({
      message: 'Wallet connected successfully',
      token,
      user: {
        id: user.id,
        username: user.username,
        walletAddress: user.walletAddress
      }
    });
  } catch (error) {
    console.error('Wallet connection error:', error);
    res.status(500).json({ message: 'Server error during wallet connection' });
  }
};

// Get current user profile
exports.getProfile = async (req, res) => {
  try {
    // User is attached from auth middleware
    const user = await User.findById(req.userId).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.status(200).json({ user });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error while fetching profile' });
  }
};