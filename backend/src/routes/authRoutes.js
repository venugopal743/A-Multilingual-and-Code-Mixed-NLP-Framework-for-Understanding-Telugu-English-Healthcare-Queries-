const express = require('express');
const rateLimit = require('express-rate-limit');
const { register, login, getProfile, updateProfile } = require('../controllers/authController');
const { auth } = require('../middleware/auth');
const { validateRegister, validateLogin, validateUpdateProfile } = require('../middleware/validate');

const router = express.Router();

// Rate limiter for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  message: {
    success: false,
    message: 'Too many requests from this IP. Please try again after 15 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/register', authLimiter, validateRegister, register);
router.post('/login', authLimiter, validateLogin, login);
router.get('/profile', auth, getProfile);
router.put('/profile', auth, validateUpdateProfile, updateProfile);

module.exports = router;
