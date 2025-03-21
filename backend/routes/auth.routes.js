// backend/routes/auth.routes.js
const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const authController = require('../controllers/auth.controller');
const authMiddleware = require('../middleware/auth.middleware');

// Register a new user
router.post(
  '/register',
  [
    check('username', 'Username is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password must be at least 6 characters').isLength({ min: 6 }),
    check('walletAddress', 'Valid wallet address is required').optional()
  ],
  authController.register
);

// Login with email and password
router.post(
  '/login',
  [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists()
  ],
  authController.login
);

// Connect/authenticate with Cosmos wallet
router.post(
  '/wallet-connect',
  [
    check('walletAddress', 'Wallet address is required').not().isEmpty(),
    check('signature', 'Signature is required').not().isEmpty(),
    check('message', 'Message is required').not().isEmpty()
  ],
  authController.connectWallet
);

// Add wallet authentication route
router.post('/wallet', authController.authenticateWallet);

// Get current user profile
router.get('/profile', authMiddleware, authController.getProfile);

module.exports = router;