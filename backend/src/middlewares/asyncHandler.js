/**
 * Wraps an async Express route handler so any rejected promise is forwarded
 * to `next(err)` instead of crashing the process or hanging the request.
 * @param {Function} fn async (req, res, next) => void
 * @returns {Function} express-compatible middleware
 */
function asyncHandler(fn) {
  return function wrapped(req, res, next) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

module.exports = asyncHandler;
