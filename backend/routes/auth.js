const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * @desc    Middleware to protect routes by verifying JWT
 * @param   {Object} req - Request object
 * @param   {Object} res - Response object
 * @param   {Function} next - Next middleware function
 */
const protect = async (req, res, next) => {
  let token;

  // 1. Check if the Authorization header exists and starts with 'Bearer'
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // 2. Extract the token from the "Bearer <token>" string
      token = req.headers.authorization.split(' ')[1];

      // 3. Verify the token using your secret key
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // 4. Find the user associated with the token and attach to req.user
      // We exclude the password from the fetched user object for security
      req.user = await User.findById(decoded.id).select('-password');

      // 5. If user no longer exists in DB, deny access
      if (!req.user) {
        return res.status(401).json({ 
          message: 'Not authorized: User no longer exists.' 
        });
      }

      // 6. Everything is valid, proceed to the actual route handler
      next();
    } catch (error) {
      console.error('JWT Verification Error:', error.message);
      
      // Handle expired tokens specifically
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Token expired, please login again.' });
      }

      return res.status(401).json({ message: 'Not authorized, token failed.' });
    }
  }

  // 7. If no token was found in the headers
  if (!token) {
    return res.status(401).json({ 
      message: 'Not authorized, no token provided.' 
    });
  }
};

// We export it as an object so you can destructure it in projects.js
// using: const { protect } = require('../middleware/auth');
module.exports = { protect };