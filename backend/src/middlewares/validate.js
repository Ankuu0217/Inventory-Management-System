const ApiError = require('../utils/ApiError');

/**
 * Builds a generic Zod-schema validation middleware. The schema is expected
 * to validate a `{ body, params, query }` shaped object mirroring the parts
 * of the request it cares about (any part it omits is left untouched).
 * On success, `req.body`/`req.params`/`req.query` are replaced with the
 * parsed (coerced, defaulted) values so controllers never re-check types.
 *
 * @param {import('zod').ZodType} schema schema validating { body, params, query }
 * @returns {Function} express middleware
 */
function validate(schema) {
  return function validator(req, res, next) {
    const result = schema.safeParse({
      body: req.body,
      params: req.params,
      query: req.query,
    });

    if (!result.success) {
      const errors = result.error.issues.map((issue) => ({
        field: issue.path.slice(1).join('.') || issue.path.join('.'),
        message: issue.message,
      }));
      next(ApiError.badRequest('Validation failed', errors));
      return;
    }

    if (result.data.body !== undefined) req.body = result.data.body;
    if (result.data.params !== undefined) req.params = result.data.params;
    if (result.data.query !== undefined) req.query = result.data.query;

    next();
  };
}

module.exports = validate;
