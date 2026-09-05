const { MongoMemoryServer } = require('mongodb-memory-server');

/**
 * Starts a single in-memory MongoDB instance shared by the whole test run.
 * The connection URI is exposed via MONGODB_URI so it's picked up by
 * src/config/env.js when application modules are required inside test files.
 */
module.exports = async function globalSetup() {
  const mongod = await MongoMemoryServer.create();
  global.__MONGOD__ = mongod;

  process.env.NODE_ENV = 'test';
  process.env.MONGODB_URI = mongod.getUri();
  process.env.CORS_ORIGIN = 'http://localhost:5173';
  process.env.RATE_LIMIT_WINDOW_MS = '900000';
  process.env.RATE_LIMIT_MAX = '100000';
  process.env.LOG_LEVEL = 'error';
};
