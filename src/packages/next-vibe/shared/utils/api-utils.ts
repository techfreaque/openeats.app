import { errorLogger } from "./logger";
import { parseError } from "./parse-error";

/**
 * Shared API utilities for client and server
 */

/**
 * Handle API errors in a consistent way
 * @param error - The error to handle
 * @param context - Context information for logging
 * @returns Properly formatted error response
 */
export function handleApiError(
  error: unknown,
  context: string,
): {
  success: false;
  error: string;
  status: number;
} {
  const parsedError = parseError(error);
  errorLogger(`Error in ${context}:`, parsedError);

  // Check for status code in error object
  let status = 500;
  if (error && typeof error === "object" && "status" in error) {
    status = (error as { status: number }).status;
  } else if (error && typeof error === "object" && "statusCode" in error) {
    status = (error as { statusCode: number }).statusCode;
  }

  return {
    success: false,
    error: parsedError.message || "An unexpected error occurred",
    status,
  };
}

/**
 * Create a success response with consistent format
 * @param data - Response data
 * @param message - Optional success message
 * @returns Formatted success response
 */
export function createSuccessResponse<T>(
  data: T,
  message = "Success",
): { success: true; message: string; data: T } {
  return {
    success: true,
    message,
    data,
  };
}

/**
 * Create an error response with consistent format
 * @param error - Error message or object
 * @param status - HTTP status code
 * @returns Formatted error response
 */
export function createErrorResponse(
  error: string,
  status = 400,
): { success: false; error: string; status: number } {
  return {
    success: false,
    error,
    status,
  };
}
