const ChatSession = require('../models/ChatSession');
const nlpService = require('../services/nlpService');
const { success, error, paginated } = require('../utils/responseHelper');
const { PAGINATION } = require('../config/constants');
const logger = require('../utils/logger');

/**
 * POST /api/chat/sessions
 * Create a new chat session.
 */
async function createSession(req, res, next) {
  try {
    const { title } = req.body;
    const userId = req.user._id;

    const session = await ChatSession.create({
      userId,
      title: title || 'New Chat',
      messages: [
        {
          role: 'system',
          content:
            'You are a multilingual healthcare assistant. You can understand queries in multiple languages including code-mixed text. Provide accurate, helpful healthcare information.',
          language: 'en',
        },
      ],
    });

    logger.info('Chat session created', { sessionId: session._id, userId });

    return success(res, session, 'Chat session created', 201);
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/chat/sessions/:id/messages
 * Send a message in a chat session and get a response.
 */
async function sendMessage(req, res, next) {
  try {
    const { content, language } = req.body;
    const sessionId = req.params.id;
    const userId = req.user._id;

    const session = await ChatSession.findOne({ _id: sessionId, userId });
    if (!session) {
      return error(res, 'Chat session not found.', 404);
    }

    if (!session.isActive) {
      return error(res, 'This chat session is no longer active.', 400);
    }

    // Build conversation history for context
    const conversationHistory = session.messages
      .filter((m) => m.role !== 'system')
      .slice(-10)
      .map((m) => ({ role: m.role, content: m.content }));

    // Run NLP pipeline
    const preferredLanguage = language || req.user.preferredLanguage || 'en';
    const nlpResult = await nlpService.processQuery(content, preferredLanguage, conversationHistory);

    // Add user message
    session.messages.push({
      role: 'user',
      content,
      language: nlpResult.detectedLanguage,
      analysis: {
        detectedLanguage: nlpResult.detectedLanguage,
        isCodeMixed: nlpResult.isCodeMixed,
        intent: nlpResult.classifiedIntent,
        intentConfidence: nlpResult.intentConfidence,
        entities: nlpResult.extractedEntities,
        processingTime: nlpResult.processingTime,
      },
    });

    // Add assistant response
    session.messages.push({
      role: 'assistant',
      content: nlpResult.aiResponse,
      language: nlpResult.responseLanguage,
    });

    // Update title if it's the first real message
    if (session.title === 'New Chat' && content.length > 0) {
      session.title = content.substring(0, 80) + (content.length > 80 ? '...' : '');
    }

    await session.save();

    const lastTwo = session.messages.slice(-2);

    logger.info('Message processed in chat session', {
      sessionId,
      processingTime: nlpResult.processingTime,
    });

    return success(res, {
      sessionId: session._id,
      userMessage: lastTwo[0],
      assistantMessage: lastTwo[1],
      analysis: {
        detectedLanguage: nlpResult.detectedLanguage,
        isCodeMixed: nlpResult.isCodeMixed,
        classifiedIntent: nlpResult.classifiedIntent,
        intentConfidence: nlpResult.intentConfidence,
        extractedEntities: nlpResult.extractedEntities,
        ragSources: nlpResult.ragSources,
        processingTime: nlpResult.processingTime,
      },
    }, 'Message processed');
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/chat/sessions
 * Get all chat sessions for the authenticated user.
 */
async function getSessions(req, res, next) {
  try {
    const userId = req.user._id;
    const page = parseInt(req.query.page, 10) || PAGINATION.DEFAULT_PAGE;
    const limit = Math.min(
      parseInt(req.query.limit, 10) || PAGINATION.DEFAULT_LIMIT,
      PAGINATION.MAX_LIMIT
    );
    const skip = (page - 1) * limit;

    const [sessions, total] = await Promise.all([
      ChatSession.find({ userId })
        .select('title isActive createdAt updatedAt')
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      ChatSession.countDocuments({ userId }),
    ]);

    // Attach message count to each session
    const sessionsWithCount = sessions.map((s) => ({
      ...s,
      messageCount: undefined, // We didn't load messages; we'll query count separately if needed
    }));

    return paginated(res, sessionsWithCount, page, limit, total, 'Sessions retrieved');
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/chat/sessions/:id
 * Get a single chat session with all messages.
 */
async function getSession(req, res, next) {
  try {
    const session = await ChatSession.findOne({
      _id: req.params.id,
      userId: req.user._id,
    }).lean();

    if (!session) {
      return error(res, 'Chat session not found.', 404);
    }

    return success(res, session);
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/chat/sessions/:id
 * Soft-delete a chat session (mark inactive).
 */
async function deleteSession(req, res, next) {
  try {
    const session = await ChatSession.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { isActive: false },
      { new: true }
    );

    if (!session) {
      return error(res, 'Chat session not found.', 404);
    }

    logger.info('Chat session deleted', { sessionId: session._id });

    return success(res, { id: session._id }, 'Chat session deleted');
  } catch (err) {
    next(err);
  }
}

module.exports = { createSession, sendMessage, getSessions, getSession, deleteSession };
