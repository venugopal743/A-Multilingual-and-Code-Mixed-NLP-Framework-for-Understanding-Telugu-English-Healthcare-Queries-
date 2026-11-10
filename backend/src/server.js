require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const { connectDB } = require('./config/database');
const errorHandler = require('./middleware/errorHandler');
const logger = require('./utils/logger');

// Route imports
const authRoutes = require('./routes/authRoutes');
const queryRoutes = require('./routes/queryRoutes');
const chatRoutes = require('./routes/chatRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();
const PORT = parseInt(process.env.PORT, 10) || 5000;

// --------------- Security Middleware ---------------
app.use(helmet());

// --------------- CORS ---------------
const corsOptions = {
  origin: (origin, callback) => callback(null, true),
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 86400,
};
app.use(cors(corsOptions));

// --------------- Body Parsers ---------------
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// --------------- Request Logging ---------------
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// --------------- Global Rate Limiter ---------------
const globalLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10) || 100,
  message: {
    success: false,
    message: 'Too many requests from this IP. Please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', globalLimiter);

// --------------- Health Check ---------------
app.get('/health', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'Multilingual Healthcare NLP API is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// --------------- API Routes ---------------
app.use('/api/auth', authRoutes);
app.use('/api/queries', queryRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/admin', adminRoutes);

// --------------- 404 Handler ---------------
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// --------------- Global Error Handler ---------------
app.use(errorHandler);

// --------------- Start Server ---------------
async function startServer() {
  try {
    await connectDB();

    const server = app.listen(PORT, () => {
      logger.info(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    });

    // Graceful shutdown
    function gracefulShutdown(signal) {
      logger.info(`${signal} received. Shutting down gracefully...`);
      server.close(async () => {
        logger.info('HTTP server closed');
        try {
          const mongoose = require('mongoose');
          await mongoose.connection.close();
          logger.info('MongoDB connection closed');
        } catch (err) {
          logger.error('Error closing MongoDB connection', { error: err.message });
        }
        process.exit(0);
      });

      // Force close after 10 seconds
      setTimeout(() => {
        logger.error('Forced shutdown after timeout');
        process.exit(1);
      }, 10000);
    }

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    process.on('unhandledRejection', (reason) => {
      logger.error('Unhandled Rejection', { reason: String(reason) });
    });

    process.on('uncaughtException', (err) => {
      logger.error('Uncaught Exception', { error: err.message, stack: err.stack });
      gracefulShutdown('uncaughtException');
    });
  } catch (err) {
    logger.error('Failed to start server', { error: err.message });
    process.exit(1);
  }
}

startServer();

module.exports = app;
