const mongoose = require('mongoose');
const env = require('../config/env');
const ApiError = require('../utils/ApiError');
const logger = require('../utils/logger');

/**
 * Normalizes any thrown/forwarded error into an ApiError so the response
 * shape is always consistent, translating Mongoose's ValidationError and
 * CastError into 400s.
 * @param {Error} err original error
 * @returns {ApiError}
 */
function normalizeError(err) {
  if (err instanceof ApiError) return err;

  if (err instanceof mongoose.Error.CastError) {
    return ApiError.badRequest(`Invalid ${err.path}: ${err.value}`);
  }

  if (err instanceof mongoose.Error.ValidationError) {
    const errors = Object.values(err.errors).map((fieldError) => ({
      field: fieldError.path,
      message: fieldError.message,
    }));
    return ApiError.badRequest('Validation failed', errors);
  }

  return ApiError.internal(err.message || 'Internal server error');
}

/**
 * Centralized error-handling middleware. Must be registered last, after the
 * 404 handler. Logs every error server-side and never leaks stack traces or
 * internal error details to the client in production.
 */
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  const apiError = normalizeError(err);
  const isServerError = apiError.statusCode >= 500;

  logger.error(
    `${req.method} ${req.originalUrl} -> ${apiError.statusCode}: ${err.stack || err.message}`,
  );

  const body = {
    success: false,
    message: isServerError && env.isProduction ? 'Internal server error' : apiError.message,
  };

  if (apiError.errors && apiError.errors.length > 0) {
    body.errors = apiError.errors;
  }

  res.status(apiError.statusCode).json(body);
}

module.exports = errorHandler;
