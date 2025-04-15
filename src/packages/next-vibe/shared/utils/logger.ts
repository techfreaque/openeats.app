import { envClient } from "../../client/env-client";
import { APP_NAME } from "../constants";
import { parseError } from "./parse-error";

export function debugLogger(message: string, ...other: unknown[]): void {
  if (envClient.NODE_ENV === "development" || envClient.NODE_ENV === "test") {
    // eslint-disable-next-line no-console
    console.log(`[${APP_NAME}][DEBUG] ${message}`, ...other);
  }
}

export function errorLogger(
  message: string,
  error?: unknown,
  ...other: unknown[]
): void {
  const typedError = parseError(error);
  if (envClient.NODE_ENV === "development" || envClient.NODE_ENV === "test") {
    // eslint-disable-next-line no-console
    console.error(`[${APP_NAME}][ERROR] ${message}`, typedError, ...other);
  } else {
    // TODO

    // eslint-disable-next-line no-console
    console.error(`[${APP_NAME}][ERROR] ${message}`, typedError, ...other);
  }
}

/**
 * API request logger - logs information about API requests
 * In production, this would ideally send logs to a centralized logging system
 *
 * @param method HTTP method of the request
 * @param path API path that was called
 * @param statusCode HTTP status code of the response
 * @param responseTime Time taken to process the request in ms
 * @param userId ID of the authenticated user (if available)
 * @param metadata Additional metadata about the request
 */
export function apiLogger(
  method: string,
  path: string,
  statusCode: number,
  responseTime: number,
  userId?: string | null,
  metadata?: Record<string, unknown>,
): void {
  // Create a structured log object that would be easy to parse in log aggregation tools
  const logData = {
    timestamp: new Date().toISOString(),
    method,
    path,
    statusCode,
    responseTime: `${responseTime}ms`,
    userId: userId || "anonymous",
    ...metadata,
  };

  if (statusCode >= 400) {
    // Log errors with the error logger
    errorLogger(`API Error [${method} ${path}]`, null, logData);
  } else {
    // Log successful requests with debug logger in development
    // In production, these could go to a different log stream
    debugLogger(`API Request [${method} ${path}]`, logData);

    // In production environments, you might want to:
    // 1. Send logs to a centralized logging system (e.g., ELK, Datadog, CloudWatch)
    // 2. Sample logs to reduce volume (e.g., log only 1% of successful requests)
    // 3. Aggregate metrics (e.g., average response time by endpoint)

    if (envClient.NODE_ENV === "production") {
      // Example of how you might implement production logging:
      // await sendToLogAggregator(logData);

      // For now, just log to console in production as well
      // eslint-disable-next-line no-console
      console.log(
        `[${APP_NAME}][API] Request processed`,
        JSON.stringify(logData),
      );
    }
  }
}
