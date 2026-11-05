const express = require('express');
const { submitQuery, getQueryHistory, getQueryById, getQueryStats } = require('../controllers/queryController');
const { auth } = require('../middleware/auth');
const { validateSubmitQuery, validateObjectId, validatePagination } = require('../middleware/validate');

const router = express.Router();

// All query routes require authentication
router.use(auth);

router.post('/query', validateSubmitQuery, submitQuery);
router.get('/history', validatePagination, getQueryHistory);
router.get('/stats', getQueryStats);
router.get('/query/:id', validateObjectId, getQueryById);

module.exports = router;
