const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { error } = require('../utils/responseHelper');
const logger = require('../utils/logger');

async function auth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return error(res, 'Access denied. No token provided.', 401);
    }

    const token = authHeader.split(' ')[1];

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return error(res, 'Token has expired. Please login again.', 401);
      }
      if (err.name === 'JsonWebTokenError') {
        return error(res, 'Invalid token.', 401);
      }
      return error(res, 'Token verification failed.', 401);
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      return error(res, 'User associated with this token no longer exists.', 401);
    }

    req.user = user;
    next();
  } catch (err) {
    logger.error('Auth middleware error', { error: err.message });
    return error(res, 'Authentication failed.', 500);
  }
}

function adminOnly(req, res, next) {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  return error(res, 'Access denied. Admin privileges required.', 403);
}

module.exports = { auth, adminOnly };
