const app = require('./app');
const env = require('./config/env');
const connectDB = require('./config/db');
const logger = require('./utils/logger');

async function start() {
  await connectDB();

  const server = app.listen(env.port, () => {
    logger.info(`Server listening on port ${env.port} [${env.nodeEnv}]`);
  });

  const shutdown = (signal) => {
    logger.info(`${signal} received. Shutting down gracefully.`);
    server.close(() => {
      logger.info('HTTP server closed.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

start();
