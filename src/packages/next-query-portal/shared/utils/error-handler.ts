import { envClient } from "next-query-portal/client/env-client";

import { errorLogger } from "./logger";
import { parseError } from "./parse-error";

export type ErrorHandlerOptions = {
  logError?: boolean;
  context?: string;
  silent?: boolean;
};

/**
 * Standard error response format
 */
export interface ErrorResponse {
  success: false;
  message: string;
  code?: number;
  context?: string;
  timestamp: number;
}

// Global error handler callback
type GlobalErrorHandler = (error: Error, context?: string) => void;
let globalErrorHandler: GlobalErrorHandler | null = null;

/**
 * Set a global error handler that will be called for all errors
 */
export function setGlobalErrorHandler(handler: GlobalErrorHandler): void {
  globalErrorHandler = handler;
}

/**
 * Global error handler for consistent error processing
 */
export function handleError(
  error: unknown,
  options: ErrorHandlerOptions = { logError: true },
): ErrorResponse {
  const parsedError = parseError(error);
  const errorResponse: ErrorResponse = {
    success: false,
    message: parsedError.message,
    timestamp: Date.now(),
  };

  if (options.context) {
    errorResponse.context = options.context;
  }

  // Extract status code if available
  if ("code" in parsedError || "statusCode" in parsedError) {
    if (typeof error === "object" && error !== null) {
      const errorObj = error as { code?: number; statusCode?: number };
      errorResponse.code = errorObj.code || errorObj.statusCode || 500;
    } else {
      errorResponse.code = 500;
    }
  } else {
    errorResponse.code = 500;
  }

  // Log error if enabled (default) and not silent
  if (options.logError !== false && !options.silent) {
    errorLogger(
      `${options.context ? `[${options.context}] ` : ""}Error: ${parsedError.message}`,
      parsedError,
    );
  }

  // Call global error handler if set
  if (globalErrorHandler && !options.silent) {
    try {
      globalErrorHandler(parsedError, options.context);
    } catch (handlerError) {
      // Don't let errors in the error handler affect the flow
      if (envClient.NODE_ENV === "development") {
        errorLogger("Error in global error handler:", handlerError);
      }
    }
  }

  return errorResponse;
}

/**
 * Try to execute a function and handle any errors
 */
export async function tryCatch<T>(
  fn: () => Promise<T>,
  options?: ErrorHandlerOptions,
): Promise<T | ErrorResponse> {
  try {
    return await fn();
  } catch (error) {
    return handleError(error, options);
  }
}

/**
 * Check if a response is an error response
 */
export function isErrorResponse(response: unknown): response is ErrorResponse {
  return (
    typeof response === "object" &&
    response !== null &&
    "success" in response &&
    (response as { success: unknown }).success === false &&
    "message" in response
  );
}
