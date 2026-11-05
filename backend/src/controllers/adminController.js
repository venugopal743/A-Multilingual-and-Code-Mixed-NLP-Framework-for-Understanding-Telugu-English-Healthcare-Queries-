const User = require('../models/User');
const Query = require('../models/Query');
const ChatSession = require('../models/ChatSession');
const { success, error, paginated } = require('../utils/responseHelper');
const { PAGINATION } = require('../config/constants');
const logger = require('../utils/logger');

/**
 * GET /api/admin/dashboard
 * Aggregated dashboard stats: total users, queries, language & intent distribution.
 */
async function getDashboardStats(req, res, next) {
  try {
    const [
      totalUsers,
      totalQueries,
      totalSessions,
      languageDistribution,
      intentDistribution,
      codeMixedCount,
      avgProcessingTime,
      recentUsersCount,
    ] = await Promise.all([
      User.countDocuments(),
      Query.countDocuments(),
      ChatSession.countDocuments(),
      Query.aggregate([
        { $group: { _id: '$detectedLanguage', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      Query.aggregate([
        { $group: { _id: '$classifiedIntent', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      Query.countDocuments({ isCodeMixed: true }),
      Query.aggregate([
        { $group: { _id: null, avg: { $avg: '$processingTime' } } },
      ]),
      User.countDocuments({
        createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      }),
    ]);

    return success(res, {
      totalUsers,
      totalQueries,
      totalSessions,
      codeMixedCount,
      recentUsersCount,
      averageProcessingTime: avgProcessingTime[0]
        ? Math.round(avgProcessingTime[0].avg)
        : 0,
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

/**
 * GET /api/admin/recent-queries
 * Get the most recent queries across all users (admin only).
 */
async function getRecentQueries(req, res, next) {
  try {
    const page = parseInt(req.query.page, 10) || PAGINATION.DEFAULT_PAGE;
    const limit = Math.min(
      parseInt(req.query.limit, 10) || PAGINATION.DEFAULT_LIMIT,
      PAGINATION.MAX_LIMIT
    );
    const skip = (page - 1) * limit;

    const [queries, total] = await Promise.all([
      Query.find()
        .populate('userId', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Query.countDocuments(),
    ]);

    return paginated(res, queries, page, limit, total, 'Recent queries retrieved');
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/admin/performance
 * Get model performance metrics computed from stored queries.
 */
async function getModelPerformance(req, res, next) {
  try {
    const totalQueries = await Query.countDocuments();

    if (totalQueries === 0) {
      return success(res, {
        totalQueries: 0,
        averageProcessingTime: 0,
        averageIntentConfidence: 0,
        intentAccuracyBreakdown: [],
        languageBreakdown: [],
        codeMixedStats: { total: 0, percentage: 0 },
        processingTimeDistribution: [],
      });
    }

    const [
      avgStats,
      intentBreakdown,
      languageBreakdown,
      codeMixedCount,
      processingTimeBuckets,
    ] = await Promise.all([
      Query.aggregate([
        {
          $group: {
            _id: null,
            avgProcessingTime: { $avg: '$processingTime' },
            avgIntentConfidence: { $avg: '$intentConfidence' },
            minProcessingTime: { $min: '$processingTime' },
            maxProcessingTime: { $max: '$processingTime' },
          },
        },
      ]),
      Query.aggregate([
        {
          $group: {
            _id: '$classifiedIntent',
            count: { $sum: 1 },
            avgConfidence: { $avg: '$intentConfidence' },
          },
        },
        { $sort: { count: -1 } },
      ]),
      Query.aggregate([
        {
          $group: {
            _id: '$detectedLanguage',
            count: { $sum: 1 },
            avgProcessingTime: { $avg: '$processingTime' },
          },
        },
        { $sort: { count: -1 } },
      ]),
      Query.countDocuments({ isCodeMixed: true }),
      Query.aggregate([
        {
          $bucket: {
            groupBy: '$processingTime',
            boundaries: [0, 500, 1000, 2000, 5000, 10000, 30000, Infinity],
            default: 'other',
            output: { count: { $sum: 1 } },
          },
        },
      ]),
    ]);

    const stats = avgStats[0] || {};

    return success(res, {
      totalQueries,
      averageProcessingTime: Math.round(stats.avgProcessingTime || 0),
      averageIntentConfidence: parseFloat((stats.avgIntentConfidence || 0).toFixed(4)),
      minProcessingTime: stats.minProcessingTime || 0,
      maxProcessingTime: stats.maxProcessingTime || 0,
      intentAccuracyBreakdown: intentBreakdown.map((i) => ({
        intent: i._id,
        count: i.count,
        averageConfidence: parseFloat(i.avgConfidence.toFixed(4)),
      })),
      languageBreakdown: languageBreakdown.map((l) => ({
        language: l._id,
        count: l.count,
        averageProcessingTime: Math.round(l.avgProcessingTime),
      })),
      codeMixedStats: {
        total: codeMixedCount,
        percentage: parseFloat(((codeMixedCount / totalQueries) * 100).toFixed(2)),
      },
      processingTimeDistribution: processingTimeBuckets.map((b) => ({
        range: b._id === 'other' ? 'other' : `${b._id}ms+`,
        count: b.count,
      })),
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { getDashboardStats, getRecentQueries, getModelPerformance };
