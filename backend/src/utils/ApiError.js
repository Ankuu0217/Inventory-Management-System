/**
 * Custom application error carrying an HTTP status code and optional
 * field-level validation details, so the centralized error handler can
 * translate it directly into the API's error envelope.
 */
class ApiError extends Error {
  /**
   * @param {number} statusCode HTTP status code to respond with
   * @param {string} message human-readable error message
   * @param {Array<{field: string, message: string}>} [errors] field-level validation errors
   */
  constructor(statusCode, message, errors = []) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.errors = errors;
    Error.captureStackTrace(this, this.constructor);
  }

  /** @param {string} message @param {Array<{field:string,message:string}>} [errors] @returns {ApiError} a 400 */
  static badRequest(message, errors = []) {
    return new ApiError(400, message, errors);
  }

  /** @param {string} message @returns {ApiError} a 404 */
  static notFound(message) {
    return new ApiError(404, message);
  }

  /** @param {string} message @returns {ApiError} a 500 */
  static internal(message) {
    return new ApiError(500, message);
  }
}

module.exports = ApiError;
