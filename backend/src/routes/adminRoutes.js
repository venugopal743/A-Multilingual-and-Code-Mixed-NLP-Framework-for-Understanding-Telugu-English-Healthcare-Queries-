const express = require('express');
const { getDashboardStats, getRecentQueries, getModelPerformance } = require('../controllers/adminController');
const { auth, adminOnly } = require('../middleware/auth');
const { validatePagination } = require('../middleware/validate');

const router = express.Router();

// All admin routes require authentication + admin role
router.use(auth, adminOnly);

router.get('/dashboard', getDashboardStats);
router.get('/recent-queries', validatePagination, getRecentQueries);
router.get('/performance', getModelPerformance);

module.exports = router;
