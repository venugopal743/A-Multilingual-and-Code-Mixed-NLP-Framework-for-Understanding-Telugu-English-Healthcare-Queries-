const mongoose = require('mongoose');
const logger = require('../utils/logger');

async function connectDB() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/multilingual_healthcare_nlp';

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2000,
      socketTimeoutMS: 5000,
    });
    logger.info('MongoDB connected successfully');
    return true;
  } catch (err) {
    logger.warn('⚠️ Local MongoDB not detected. Running server in active NLP proxy mode.');
    return false;
  }
}

// Connection event handlers
mongoose.connection.on('connected', () => {
  logger.info('Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
  logger.warn('Mongoose connection notice:', err.message);
});

mongoose.connection.on('disconnected', () => {
  logger.warn('Mongoose disconnected from MongoDB');
});

module.exports = { connectDB };
