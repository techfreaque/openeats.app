/**
 * Rate Limiter Middleware
 *
 * This middleware provides rate limiting functionality to protect the API
 * from abuse and denial-of-service attacks. It limits the number of requests
 * from a single IP address within a specific time window.
 */

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import type { ErrorResponseType } from "../../../shared/types/response.schema";
import { ErrorResponseTypes } from "../../../shared/types/response.schema";
import { debugLogger } from "../../../shared/utils/logger";

// In-memory store for rate limiting
// In a production environment with multiple instances, this should be replaced
// with a distributed cache like Redis
interface RateLimitStore {
  [ip: string]: {
    count: number;
    resetTime: number;
  };
}

const store: RateLimitStore = {};

export interface RateLimitOptions {
  // Maximum number of requests allowed within the window
  limit?: number;
  // Time window in milliseconds
  windowMs?: number;
  // Whether to include remaining requests in response headers
  standardHeaders?: boolean;
  // Custom message for rate limit exceeded
  message?: string;
}

/**
 * Rate limit error response type
 */
export type RateLimitErrorResponse = ErrorResponseType<
  undefined,
  ErrorResponseTypes.HTTP_ERROR
>;

/**
 * Rate limiter middleware function type
 */
export type RateLimiterMiddleware = (
  request: NextRequest,
  response?: NextResponse,
) => NextResponse;

const DEFAULT_OPTIONS: Required<RateLimitOptions> = {
  limit: 100,
  windowMs: 60 * 1000, // 1 minute
  standardHeaders: true,
  message: "Too many requests, please try again later.",
};

/**
 * Creates a rate limiting middleware function
 * @param options Rate limiting options
 * @returns Middleware function
 */
export function createRateLimiter(
  options: RateLimitOptions = {},
): RateLimiterMiddleware {
  const mergedOptions: Required<RateLimitOptions> = {
    ...DEFAULT_OPTIONS,
    ...options,
  };

  return function rateLimiter(
    request: NextRequest,
    response?: NextResponse,
  ): NextResponse {
    // Get IP from request
    // In Next.js 13+, IP is available in headers
    const forwardedFor = request.headers.get("x-forwarded-for");
    const ip =
      (forwardedFor
        ? forwardedFor.split(",")[0].trim()
        : request.headers.get("x-real-ip")) ?? "unknown";

    // Check if we already have a record for this IP
    store[ip] ??= {
      count: 0,
      resetTime: Date.now() + mergedOptions.windowMs,
    };

    // Check if the time window has expired and reset if needed
    if (Date.now() > store[ip]?.resetTime) {
      store[ip] = {
        count: 0,
        resetTime: Date.now() + mergedOptions.windowMs,
      };
    }

    // Increment request count
    store[ip].count++;

    // Calculate remaining requests and time to reset
    const remaining = Math.max(
      0,
      mergedOptions.limit - (store[ip]?.count ?? 0),
    );
    const reset = Math.ceil(
      ((store[ip]?.resetTime ?? Date.now()) - Date.now()) / 1000,
    );

    // Create a new response if none was provided
    const res = response ?? NextResponse.next();

    // Add rate limit headers if standardHeaders is enabled
    if (mergedOptions.standardHeaders) {
      res.headers.set("X-RateLimit-Limit", mergedOptions.limit.toString());
      res.headers.set("X-RateLimit-Remaining", remaining.toString());
      res.headers.set("X-RateLimit-Reset", reset.toString());
    }

    // Check if the rate limit has been exceeded
    if ((store[ip]?.count ?? 0) > mergedOptions.limit) {
      debugLogger("Rate limit exceeded", { ip, count: store[ip]?.count ?? 0 });

      // Return rate limit exceeded response
      return new NextResponse(
        JSON.stringify({
          success: false,
          message: mergedOptions.message,
          errorCode: 429,
          errorType: ErrorResponseTypes.HTTP_ERROR,
        } as RateLimitErrorResponse),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            ...(mergedOptions.standardHeaders && {
              "X-RateLimit-Limit": mergedOptions.limit.toString(),
              "X-RateLimit-Remaining": "0",
              "X-RateLimit-Reset": reset.toString(),
              "Retry-After": reset.toString(),
            }),
          },
        },
      );
    }

    // Garbage collection: Cleanup old entries periodically
    // In a production implementation, this would be handled by TTL in Redis
    if (Math.random() < 0.01) {
      // 1% chance to run cleanup on each request
      for (const key in store) {
        if (store[key] && Date.now() > store[key]?.resetTime) {
          delete store[key];
        }
      }
    }

    return res;
  };
}

/**
 * Default rate limiter instance with standard options
 */
export const defaultRateLimiter = createRateLimiter();

/**
 * Strict rate limiter for sensitive endpoints (e.g., authentication)
 * with more restrictive limits
 */
export const strictRateLimiter = createRateLimiter({
  limit: 20,
  windowMs: 60 * 1000, // 1 minute
  message: "Too many authentication attempts, please try again later.",
});

/**
 * API rate limiter for regular API endpoints
 */
export const apiRateLimiter = createRateLimiter({
  limit: 60,
  windowMs: 60 * 1000, // 1 minute
});
