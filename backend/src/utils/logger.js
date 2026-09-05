const winston = require('winston');

const isTest = process.env.NODE_ENV === 'test';

const transports = [
  new winston.transports.Console({
    silent: isTest,
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.timestamp({ format: 'HH:mm:ss' }),
      winston.format.printf(
        ({ timestamp, level, message }) => `[${timestamp}] ${level}: ${message}`,
      ),
    ),
  }),
];

if (process.env.NODE_ENV === 'production') {
  transports.push(
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
    }),
  );
}

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  levels: winston.config.npm.levels,
  transports,
});

module.exports = logger;
