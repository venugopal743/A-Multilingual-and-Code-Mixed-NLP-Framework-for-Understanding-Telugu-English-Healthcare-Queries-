const Query = require('../models/Query');
const nlpService = require('../services/nlpService');
const { success, error, paginated } = require('../utils/responseHelper');
const { PAGINATION } = require('../config/constants');
const logger = require('../utils/logger');

/**
 * POST /api/queries/query
 * Submit a healthcare query for NLP processing.
 */
async function submitQuery(req, res, next) {
  try {
    const { text, language } = req.body;
    const userId = req.user._id;
    const preferredLanguage = language || req.user.preferredLanguage || 'en';

    logger.info('Processing query', { userId, textLength: text.length });

    // Call the NLP pipeline
    const nlpResult = await nlpService.processQuery(text, preferredLanguage);

    // Persist the query and result
    const query = await Query.create({
      userId,
      originalText: text,
      detectedLanguage: nlpResult.detectedLanguage,
      isCodeMixed: nlpResult.isCodeMixed,
      extractedEntities: nlpResult.extractedEntities,
      classifiedIntent: nlpResult.classifiedIntent,
      intentConfidence: nlpResult.intentConfidence,
      ragSources: nlpResult.ragSources,
      aiResponse: nlpResult.aiResponse,
      responseLanguage: nlpResult.responseLanguage,
      processingTime: nlpResult.processingTime,
    });

    logger.info('Query processed successfully', {
      queryId: query._id,
      processingTime: nlpResult.processingTime,
    });

    return success(res, query, 'Query processed successfully', 201);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/queries/history
 * Get the authenticated user's query history with pagination.
 */
async function getQueryHistory(req, res, next) {
  try {
    const userId = req.user._id;
    const page = parseInt(req.query.page, 10) || PAGINATION.DEFAULT_PAGE;
    const limit = Math.min(
      parseInt(req.query.limit, 10) || PAGINATION.DEFAULT_LIMIT,
      PAGINATION.MAX_LIMIT
    );
    const skip = (page - 1) * limit;

    const [queries, total] = await Promise.all([
      Query.find({ userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Query.countDocuments({ userId }),
    ]);

    return paginated(res, queries, page, limit, total, 'Query history retrieved');
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/queries/query/:id
 * Get a single query by ID (must belong to the authenticated user).
 */
async function getQueryById(req, res, next) {
  try {
    const query = await Query.findOne({
      _id: req.params.id,
      userId: req.user._id,
    }).lean();

    if (!query) {
      return error(res, 'Query not found.', 404);
    }

    return success(res, query);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/queries/stats
 * Get query statistics for the authenticated user.
 */
async function getQueryStats(req, res, next) {
  try {
    const userId = req.user._id;

    const [totalQueries, languageDistribution, intentDistribution, avgProcessingTime] =
      await Promise.all([
        Query.countDocuments({ userId }),
        Query.aggregate([
          { $match: { userId } },
          { $group: { _id: '$detectedLanguage', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
        ]),
        Query.aggregate([
          { $match: { userId } },
          { $group: { _id: '$classifiedIntent', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
        ]),
        Query.aggregate([
          { $match: { userId } },
          { $group: { _id: null, avg: { $avg: '$processingTime' } } },
        ]),
      ]);

    const codeMixedCount = await Query.countDocuments({ userId, isCodeMixed: true });

    return success(res, {
      totalQueries,
      codeMixedCount,
      averageProcessingTime: avgProcessingTime[0] ? Math.round(avgProcessingTime[0].avg) : 0,
      languageDistribution: languageDistribution.map((l) => ({
        language: l._id,
        count: l.count,
      })),
      intentDistribution: intentDistribution.map((i) => ({
        intent: i._id,
        count: i.count,
      })),
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { submitQuery, getQueryHistory, getQueryById, getQueryStats };
