/**
 * Builds the standard success-response envelope used by every endpoint.
 * @param {import('express').Response} res express response object
 * @param {number} statusCode HTTP status code to respond with
 * @param {*} data response payload
 * @param {string} [message] human-readable success message
 * @returns {import('express').Response}
 */
function sendSuccess(res, statusCode, data, message = 'Success') {
  return res.status(statusCode).json({
    success: true,
    data,
    message,
  });
}

module.exports = { sendSuccess };
