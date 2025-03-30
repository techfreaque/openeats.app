import type { QueryKey } from "@tanstack/react-query";

import type { ApiEndpoint } from "../endpoint";
import { envClient } from "../env-client";

/**
 * Global API configuration
 * Allows for customization of API behavior
 */
export interface ApiConfig {
  /**
   * Base URL for API requests (default: NEXT_PUBLIC_BACKEND_URL from env)
   */
  baseUrl: string;

  /**
   * Default stale time for queries in milliseconds (default: 60000)
   */
  defaultStaleTime: number;

  /**
   * Default cache time for queries in milliseconds (default: 600000)
   */
  defaultCacheTime: number;

  /**
   * Whether to refetch queries on window focus (default: false)
   */
  defaultRefetchOnWindowFocus: boolean;

  /**
   * Default endpoint path prefix (default: ['api'])
   */
  defaultPathPrefix: string[];

  /**
   * Whether to deduplicate identical requests (default: true)
   */
  deduplicateRequests: boolean;

  /**
   * Custom error handler function
   */
  onError?: (
    error: Error,
    endpoint?: ApiEndpoint<unknown, unknown, unknown, "default">,
  ) => void;
}

let _apiConfig: ApiConfig = {
  baseUrl: envClient.NEXT_PUBLIC_BACKEND_URL,
  defaultStaleTime: 60000,
  defaultCacheTime: 600000,
  defaultRefetchOnWindowFocus: false,
  defaultPathPrefix: ["api"],
  deduplicateRequests: true,
};

/**
 * Configure the API behavior
 */
export function configureApi(config: Partial<ApiConfig>): void {
  _apiConfig = {
    ..._apiConfig,
    ...config,
  };
}

/**
 * Get the current API configuration
 */
export function getApiConfig(): ApiConfig {
  return _apiConfig;
}

/**
 * Generate a unique cache key that avoids collisions
 */
export function generateCacheKey(queryKey: QueryKey): string {
  if (typeof queryKey === "string") {
    return queryKey;
  }
  return simpleHash(JSON.stringify(queryKey));
}

// A simple non-cryptographic hash function (djb2 algorithm)
function simpleHash(str: string): string {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) + hash + str.charCodeAt(i); // hash * 33 + c
  }
  // Convert to an unsigned 32-bit integer
  return String(hash >>> 0);
}
