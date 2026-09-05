const mongoose = require('mongoose');
const env = require('./env');
const logger = require('../utils/logger');

const MAX_RETRIES = 5;
const RETRY_DELAY_MS = 3000;

/**
 * Connects to MongoDB, retrying with a fixed delay on failure.
 * Exits the process if it cannot connect after MAX_RETRIES attempts.
 * @param {number} [attempt=1] current attempt number
 * @returns {Promise<void>}
 */
async function connectDB(attempt = 1) {
  try {
    await mongoose.connect(env.mongoUri);
    logger.info('MongoDB connected successfully');
  } catch (err) {
    logger.error(`MongoDB connection attempt ${attempt} failed: ${err.message}`);

    if (attempt >= MAX_RETRIES) {
      logger.error('Exceeded maximum MongoDB connection retries. Exiting.');
      process.exit(1);
      return;
    }

    await new Promise((resolve) => {
      setTimeout(resolve, RETRY_DELAY_MS);
    });
    await connectDB(attempt + 1);
  }
}

module.exports = connectDB;
