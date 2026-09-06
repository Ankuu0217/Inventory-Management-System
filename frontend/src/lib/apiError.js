/**
 * @param {unknown} value
 * @returns {boolean} true when `value` looks like the API's error envelope
 */
function isApiErrorEnvelope(value) {
  return typeof value === 'object' && value !== null && value.success === false;
}

/**
 * Extracts a human-readable message from an RTK Query error, whether it's the
 * API's error envelope, a network failure, or something unexpected -- so the
 * UI always has something meaningful to show instead of a raw object.
 *
 * @param {import('@reduxjs/toolkit/query').FetchBaseQueryError | import('@reduxjs/toolkit').SerializedError | undefined} error
 * @returns {string}
 */
export function getErrorMessage(error) {
  if (!error) return 'Something went wrong. Please try again.';

  if ('status' in error) {
    if (error.status === 'FETCH_ERROR') {
      return "Couldn't reach the server. Check your connection and try again.";
    }
    if (error.status === 'TIMEOUT_ERROR') {
      return 'The request timed out. Please try again.';
    }
    if (isApiErrorEnvelope(error.data)) {
      return error.data.message;
    }
    return `Request failed (${error.status}).`;
  }

  return error.message ?? 'An unexpected error occurred.';
}

/**
 * Extracts field-level validation errors from an RTK Query error, if the API
 * returned any -- used to map backend validation failures onto form fields.
 *
 * @param {import('@reduxjs/toolkit/query').FetchBaseQueryError | import('@reduxjs/toolkit').SerializedError | undefined} error
 * @returns {import('@/types/product').ApiFieldError[]}
 */
export function getFieldErrors(error) {
  if (!error || !('status' in error) || !isApiErrorEnvelope(error.data)) return [];
  return Array.isArray(error.data.errors) ? error.data.errors : [];
}
