import type { QueryKey } from "@tanstack/react-query";

import { envClient } from "../../client";
import type { ApiEndpoint } from "../../client/endpoint";

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
    endpoint?: ApiEndpoint<unknown, unknown, unknown>,
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

  // Create a more reliable hash for complex keys
  const keyString = queryKey
    .map((item) => {
      if (typeof item === "object" && item !== null) {
        return JSON.stringify(
          Object.entries(item)
            .sort()
            .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {}),
        );
      }
      return `${JSON.stringify(item)}`;
    })
    .join("|");

  return `${envClient.NEXT_PUBLIC_APP_NAME}-${keyString}`;
}
