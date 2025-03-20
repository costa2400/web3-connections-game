// backend/middleware/optionalAuth.middleware.js
const jwt = require('jsonwebtoken');

// This middleware checks for authentication but doesn't require it
module.exports = (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('x-auth-token');

    // If no token, continue without authentication
    if (!token) {
      return next();
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Add user ID from payload to request
    req.userId = decoded.id;
    req.walletAddress = decoded.walletAddress;
    
    next();
  } catch (error) {
    // If token is invalid, continue without authentication
    console.error('Optional auth middleware error:', error);
    next();
  }
};