const jwt = require('jsonwebtoken');

const optionalAuth = async (req, res, next) => {
  try {
    const token = req.header('x-auth-token');
    
    if (!token) {
      // If no token, continue without setting user
      return next();
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded.user;
    } catch (err) {
      // If token is invalid, continue without setting user
      console.log('Invalid token in optional auth:', err.message);
    }
    
    next();
  } catch (err) {
    console.error('Error in optional auth middleware:', err);
    next();
  }
};

module.exports = optionalAuth; 