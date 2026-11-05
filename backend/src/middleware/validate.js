const { validationResult, body, param, query } = require('express-validator');
const { error } = require('../utils/responseHelper');

/**
 * Middleware that checks for validation errors produced by express-validator
 * and returns a 400 response if any exist.
 */
function handleValidationErrors(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const messages = errors.array().map((e) => e.msg);
    return error(res, 'Validation failed', 400, messages);
  }
  next();
}

// ----- Auth validations -----

const validateRegister = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  body('preferredLanguage')
    .optional()
    .trim()
    .isLength({ min: 2, max: 10 })
    .withMessage('Invalid language code'),
  handleValidationErrors,
];

const validateLogin = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
  handleValidationErrors,
];

const validateUpdateProfile = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('preferredLanguage')
    .optional()
    .trim()
    .isLength({ min: 2, max: 10 })
    .withMessage('Invalid language code'),
  handleValidationErrors,
];

// ----- Query validations -----

const validateSubmitQuery = [
  body('text')
    .trim()
    .notEmpty()
    .withMessage('Query text is required')
    .isLength({ max: 5000 })
    .withMessage('Query text cannot exceed 5000 characters'),
  body('language')
    .optional()
    .trim()
    .isLength({ min: 2, max: 10 })
    .withMessage('Invalid language code'),
  handleValidationErrors,
];

const validateObjectId = [
  param('id').isMongoId().withMessage('Invalid ID format'),
  handleValidationErrors,
];

// ----- Chat validations -----

const validateCreateSession = [
  body('title')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Session title cannot exceed 200 characters'),
  handleValidationErrors,
];

const validateSendMessage = [
  param('id').isMongoId().withMessage('Invalid session ID format'),
  body('content')
    .trim()
    .notEmpty()
    .withMessage('Message content is required')
    .isLength({ max: 10000 })
    .withMessage('Message content cannot exceed 10000 characters'),
  body('language')
    .optional()
    .trim()
    .isLength({ min: 2, max: 10 })
    .withMessage('Invalid language code'),
  handleValidationErrors,
];

// ----- Pagination validations -----

const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  handleValidationErrors,
];

module.exports = {
  handleValidationErrors,
  validateRegister,
  validateLogin,
  validateUpdateProfile,
  validateSubmitQuery,
  validateObjectId,
  validateCreateSession,
  validateSendMessage,
  validatePagination,
};
