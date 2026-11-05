const User = require('../models/User');
const { success, error } = require('../utils/responseHelper');
const logger = require('../utils/logger');

/**
 * POST /api/auth/register
 */
async function register(req, res, next) {
  try {
    const { name, email, password, preferredLanguage } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return error(res, 'An account with this email already exists.', 409);
    }

    const user = await User.create({
      name,
      email,
      password,
      preferredLanguage: preferredLanguage || 'en',
    });

    const token = user.generateToken();

    logger.info('New user registered', { userId: user._id, email: user.email });

    return success(
      res,
      {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          preferredLanguage: user.preferredLanguage,
          role: user.role,
          createdAt: user.createdAt,
        },
        token,
      },
      'Registration successful',
      201
    );
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/auth/login
 */
async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return error(res, 'Invalid email or password.', 401);
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return error(res, 'Invalid email or password.', 401);
    }

    const token = user.generateToken();

    logger.info('User logged in', { userId: user._id });

    return success(res, {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        preferredLanguage: user.preferredLanguage,
        role: user.role,
        createdAt: user.createdAt,
      },
      token,
    }, 'Login successful');
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/auth/profile
 */
async function getProfile(req, res, next) {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return error(res, 'User not found.', 404);
    }

    return success(res, {
      id: user._id,
      name: user.name,
      email: user.email,
      preferredLanguage: user.preferredLanguage,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/auth/profile
 */
async function updateProfile(req, res, next) {
  try {
    const { name, preferredLanguage } = req.body;
    const updateFields = {};

    if (name !== undefined) updateFields.name = name;
    if (preferredLanguage !== undefined) updateFields.preferredLanguage = preferredLanguage;

    if (Object.keys(updateFields).length === 0) {
      return error(res, 'No fields to update.', 400);
    }

    const user = await User.findByIdAndUpdate(req.user._id, updateFields, {
      new: true,
      runValidators: true,
    });

    if (!user) {
      return error(res, 'User not found.', 404);
    }

    logger.info('User profile updated', { userId: user._id });

    return success(res, {
      id: user._id,
      name: user.name,
      email: user.email,
      preferredLanguage: user.preferredLanguage,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }, 'Profile updated successfully');
  } catch (err) {
    next(err);
  }
}

module.exports = { register, login, getProfile, updateProfile };
