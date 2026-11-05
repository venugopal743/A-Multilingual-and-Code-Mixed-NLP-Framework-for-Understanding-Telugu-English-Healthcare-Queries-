const express = require('express');
const {
  createSession,
  sendMessage,
  getSessions,
  getSession,
  deleteSession,
} = require('../controllers/chatController');
const { auth } = require('../middleware/auth');
const {
  validateCreateSession,
  validateSendMessage,
  validateObjectId,
  validatePagination,
} = require('../middleware/validate');

const router = express.Router();

// All chat routes require authentication
router.use(auth);

router.post('/sessions', validateCreateSession, createSession);
router.get('/sessions', validatePagination, getSessions);
router.get('/sessions/:id', validateObjectId, getSession);
router.post('/sessions/:id/messages', validateSendMessage, sendMessage);
router.delete('/sessions/:id', validateObjectId, deleteSession);

module.exports = router;
