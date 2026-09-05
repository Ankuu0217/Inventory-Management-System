import type { FetchBaseQueryError } from '@reduxjs/toolkit/query/react';
import type { SerializedError } from '@reduxjs/toolkit';
import type { ApiErrorEnvelope } from '@/types/product';

function isApiErrorEnvelope(value: unknown): value is ApiErrorEnvelope {
  return (
    typeof value === 'object' &&
    value !== null &&
    'success' in value &&
    (value as { success: unknown }).success === false
  );
}

/**
 * Extracts a human-readable message from an RTK Query error, whether it's
 * our API's error envelope, a network failure, or something unexpected --
 * so the UI always has something meaningful to show instead of a raw object.
 */
export function getErrorMessage(error: FetchBaseQueryError | SerializedError | undefined): string {
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
 */
export function getFieldErrors(
  error: FetchBaseQueryError | SerializedError | undefined,
): Array<{ field: string; message: string }> {
  if (!error || !('status' in error) || !isApiErrorEnvelope(error.data)) return [];
  return error.data.errors ?? [];
}
