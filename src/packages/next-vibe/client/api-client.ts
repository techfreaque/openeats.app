/**
 * API Client for making HTTP requests
 *
 * This module provides a lightweight, type-safe API client for making HTTP requests.
 * It handles authentication, error handling, and response parsing.
 */

import type { ResponseType } from "../shared/types/response.schema";
import { errorLogger } from "../shared/utils/logger";
import type { ApiEndpoint } from "./endpoint";

/**
 * Options for API requests
 */
export interface ApiRequestOptions {
  /**
   * Whether to include credentials in the request
   * @default true
   */
  includeCredentials?: boolean;

  /**
   * Additional headers to include in the request
   */
  headers?: Record<string, string>;

  /**
   * Timeout in milliseconds
   * @default 30000
   */
  timeout?: number;

  /**
   * Whether to disable the default error handling
   * @default false
   */
  disableErrorHandling?: boolean;

  /**
   * Custom error handler
   */
  onError?: (error: Error) => void;
}

/**
 * Default API request options
 */
const defaultOptions: Omit<Required<ApiRequestOptions>, "onError"> & {
  onError: ((error: Error) => void) | undefined;
} = {
  includeCredentials: true,
  headers: {},
  timeout: 30000,
  disableErrorHandling: false,
  onError: undefined,
};

/**
 * Make an API request
 * @param endpoint - API endpoint configuration
 * @param requestData - Request data
 * @param urlParams - URL parameters
 * @param options - Request options
 * @returns Promise with the response data
 */
export async function apiRequest<
  TRequest,
  TResponse,
  TUrlVariables,
  TExampleKey,
>(
  endpoint: ApiEndpoint<TRequest, TResponse, TUrlVariables, TExampleKey>,
  requestData?: TRequest,
  urlParams?: TUrlVariables,
  options: ApiRequestOptions = {},
): Promise<TResponse> {
  const mergedOptions = { ...defaultOptions, ...options };

  // Get request data and URL
  const requestParams = {
    ...(requestData !== undefined ? { requestData } : {}),
    ...(urlParams !== undefined ? { pathParams: urlParams } : {}),
  } as {
    requestData?: TRequest;
    pathParams?: TUrlVariables;
  };

  const requestInfo = endpoint.getRequestData(requestParams);

  if (!requestInfo.success) {
    throw new Error(requestInfo.message);
  }

  const { endpointUrl, postBody } = requestInfo;

  // Create AbortController for timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    controller.abort();
  }, mergedOptions.timeout);

  try {
    // Prepare headers
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...mergedOptions.headers,
    };

    // Make the request
    const fetchOptions: RequestInit = {
      method: endpoint.method,
      headers,
      ...(postBody ? { body: postBody } : {}),
      credentials: mergedOptions.includeCredentials ? "include" : "same-origin",
      signal: controller.signal,
    };

    const response = await fetch(endpointUrl, fetchOptions);

    // Clear timeout
    clearTimeout(timeoutId);

    // Parse response
    const responseData = (await response.json()) as ResponseType<TResponse>;

    // Handle API errors
    if (!response.ok || !responseData.success) {
      const errorMessage =
        responseData.message ?? `API error: ${response.statusText}`;
      const error = new Error(errorMessage);

      const enhancedError = Object.assign(error, {
        status: response.status,
        endpoint: endpoint.path.join("/"),
        method: endpoint.method,
        responseData,
        errorType: responseData.errorType ?? "UNKNOWN_ERROR",
        errorCode: response.status,
      });

      throw enhancedError;
    }

    return responseData.data;
  } catch (error) {
    // Clear timeout
    clearTimeout(timeoutId);

    // Log error
    errorLogger("API request failed:", error);

    // Call custom error handler if provided
    if (mergedOptions.onError && error instanceof Error) {
      mergedOptions.onError(error);
    }

    // Re-throw error
    throw error;
  }
}

/**
 * Make a GET request
 */
export async function apiGet<TRequest, TResponse, TUrlVariables, TExampleKey>(
  endpoint: ApiEndpoint<TRequest, TResponse, TUrlVariables, TExampleKey>,
  requestData?: TRequest,
  urlParams?: TUrlVariables,
  options?: ApiRequestOptions,
): Promise<TResponse> {
  return await apiRequest(endpoint, requestData, urlParams, options);
}

/**
 * Make a POST request
 */
export async function apiPost<TRequest, TResponse, TUrlVariables, TExampleKey>(
  endpoint: ApiEndpoint<TRequest, TResponse, TUrlVariables, TExampleKey>,
  requestData?: TRequest,
  urlParams?: TUrlVariables,
  options?: ApiRequestOptions,
): Promise<TResponse> {
  return await apiRequest(endpoint, requestData, urlParams, options);
}

/**
 * Make a PUT request
 */
export async function apiPut<TRequest, TResponse, TUrlVariables, TExampleKey>(
  endpoint: ApiEndpoint<TRequest, TResponse, TUrlVariables, TExampleKey>,
  requestData?: TRequest,
  urlParams?: TUrlVariables,
  options?: ApiRequestOptions,
): Promise<TResponse> {
  return await apiRequest(endpoint, requestData, urlParams, options);
}

/**
 * Make a DELETE request
 */
export async function apiDelete<
  TRequest,
  TResponse,
  TUrlVariables,
  TExampleKey,
>(
  endpoint: ApiEndpoint<TRequest, TResponse, TUrlVariables, TExampleKey>,
  requestData?: TRequest,
  urlParams?: TUrlVariables,
  options?: ApiRequestOptions,
): Promise<TResponse> {
  return await apiRequest(endpoint, requestData, urlParams, options);
}
