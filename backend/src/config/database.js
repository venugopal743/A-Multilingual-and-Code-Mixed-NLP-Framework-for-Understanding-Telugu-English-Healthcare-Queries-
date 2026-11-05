const mongoose = require('mongoose');
const logger = require('../utils/logger');

const MAX_RETRIES = 5;
const RETRY_DELAY_MS = 5000;

async function connectDB(retryCount = 0) {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/multilingual_healthcare_nlp';

  try {
    await mongoose.connect(uri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    logger.info('MongoDB connected successfully');
  } catch (err) {
    logger.error(`MongoDB connection attempt ${retryCount + 1} failed`, {
      error: err.message,
    });

    if (retryCount < MAX_RETRIES) {
      logger.info(`Retrying MongoDB connection in ${RETRY_DELAY_MS / 1000}s...`);
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
      return connectDB(retryCount + 1);
    }

    logger.error('Max MongoDB connection retries reached. Exiting.');
    process.exit(1);
  }
}

// Connection event handlers
mongoose.connection.on('connected', () => {
  logger.info('Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
  logger.error('Mongoose connection error', { error: err.message });
});

mongoose.connection.on('disconnected', () => {
  logger.warn('Mongoose disconnected from MongoDB');
});

module.exports = { connectDB };
