import type { QueryKey } from "@tanstack/react-query";
import { QueryClient } from "@tanstack/react-query";
import { create } from "zustand";

import { handleError } from "../../../shared/utils/error-handler";
import { debugLogger, errorLogger } from "../../../shared/utils/logger";
import { generateCacheKey } from "../../config";
import type { ApiEndpoint } from "../../endpoint";
import {
  getStorageItem,
  removeStorageItem,
  setStorageItem,
} from "../../storage/storage-client";
import { callApi } from "../api-utils";
import type { ApiMutationOptions, ApiQueryOptions } from "../types";

// Create a single QueryClient instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      refetchOnWindowFocus: false,
    },
  },
});

// Track in-flight requests to prevent duplicates
const inFlightRequests = new Map<
  string,
  { promise: Promise<unknown>; timestamp: number }
>();

// Throttle map to prevent excessive API calls
const throttleMap = new Map<string, number>();
const THROTTLE_INTERVAL = 500; // ms

// Clean up in-flight requests older than 10 seconds
const MAX_REQUEST_AGE = 10_000; // 10 seconds

// Set a maximum number of in-flight requests to prevent memory leaks
const MAX_IN_FLIGHT_REQUESTS = 50;

// Function to clean up old in-flight requests
function cleanupInFlightRequests(): void {
  const now = Date.now();

  // First, clean up old requests
  for (const [key, { timestamp }] of inFlightRequests.entries()) {
    if (now - timestamp > MAX_REQUEST_AGE) {
      inFlightRequests.delete(key);
    }
  }

  // If we still have too many requests, remove the oldest ones
  if (inFlightRequests.size > MAX_IN_FLIGHT_REQUESTS) {
    // Convert to array, sort by timestamp, and keep only the newest MAX_IN_FLIGHT_REQUESTS
    const entries = Array.from(inFlightRequests.entries());
    entries.sort((a, b) => b[1].timestamp - a[1].timestamp); // Sort newest first

    // Keep only the newest MAX_IN_FLIGHT_REQUESTS
    const toKeep = entries.slice(0, MAX_IN_FLIGHT_REQUESTS);

    // Clear the map and add back only the ones we want to keep
    inFlightRequests.clear();
    for (const [key, value] of toKeep) {
      inFlightRequests.set(key, value);
    }
  }
}

// Store types
export interface ApiStore {
  // Query state
  queries: Record<string, QueryStoreType<unknown>>;

  // Mutation state
  mutations: Record<string, MutationStoreType<unknown>>;

  // Form state
  forms: Record<
    string,
    {
      formError: Error | null;
      isSubmitting: boolean;
      queryParams?: Record<string, unknown>;
    }
  >;

  customState: Record<string, unknown>;

  // Methods
  executeQuery: <TRequest, TResponse, TUrlVariables, TExampleKey>(
    endpoint: ApiEndpoint<TRequest, TResponse, TUrlVariables, TExampleKey>,
    requestData: TRequest,
    pathParams: TUrlVariables,
    options?: Omit<ApiQueryOptions<TResponse>, "queryKey"> & {
      queryKey?: QueryKey;
    },
  ) => Promise<TResponse>;

  executeMutation: <TRequest, TResponse, TUrlVariables, TExampleKey>(
    endpoint: ApiEndpoint<TRequest, TResponse, TUrlVariables, TExampleKey>,
    requestData: TRequest,
    pathParams: TUrlVariables,
    options?: ApiMutationOptions<TRequest, TResponse, TUrlVariables>,
  ) => Promise<TResponse>;

  invalidateQueries: (queryKey: QueryKey) => Promise<void>;
  refetchQuery: <TResponse>(
    queryKey: QueryKey,
  ) => Promise<TResponse | undefined>;

  setFormError: (formId: string, error: Error | null) => void;
  clearFormError: (formId: string) => void;

  // Helper to generate unique IDs
  getQueryId: (queryKey: QueryKey) => string;
  getMutationId: <TRequest, TResponse, TUrlVariables, TExampleKey>(
    endpoint: ApiEndpoint<TRequest, TResponse, TUrlVariables, TExampleKey>,
  ) => string;
  getFormId: <TRequest, TResponse, TUrlVariables, TExampleKey>(
    endpoint: ApiEndpoint<TRequest, TResponse, TUrlVariables, TExampleKey>,
  ) => string;

  setFormQueryParams: (formId: string, params: Record<string, unknown>) => void;
  getFormQueryParams: <T extends Record<string, unknown>>(
    formId: string,
  ) => T | undefined;
}

export interface QueryStoreType<TResponse> {
  data: TResponse | undefined;
  error: Error | null;
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  isSuccess: boolean;
  isLoadingFresh: boolean;
  isCachedData: boolean;
  statusMessage: string;
  lastFetchTime: number | null;
}

export interface MutationStoreType<TResponse> {
  isPending: boolean;
  isError: boolean;
  error: Error | null;
  isSuccess: boolean;
  data: TResponse | undefined;
}

export const useApiStore = create<ApiStore>((set, get) => ({
  queries: {},
  mutations: {},
  forms: {},
  customState: {},

  getQueryId: (queryKey: QueryKey): string => generateCacheKey(queryKey),

  getMutationId: <TRequest, TResponse, TUrlVariables, TExampleKey>(
    endpoint: ApiEndpoint<TRequest, TResponse, TUrlVariables, TExampleKey>,
  ): string => `mutation-${endpoint.path.join("-")}-${endpoint.method}`,

  getFormId: <TRequest, TResponse, TUrlVariables, TExampleKey>(
    endpoint: ApiEndpoint<TRequest, TResponse, TUrlVariables, TExampleKey>,
  ): string => `form-${endpoint.path.join("-")}-${endpoint.method}`,

  executeQuery: async <TRequest, TResponse, TUrlVariables, TExampleKey>(
    endpoint: ApiEndpoint<TRequest, TResponse, TUrlVariables, TExampleKey>,
    requestData: TRequest,
    pathParams: TUrlVariables,
    options: Omit<ApiQueryOptions<TResponse>, "queryKey"> & {
      queryKey?: QueryKey;
    } = {},
  ): Promise<TResponse> => {
    const queryId = get().getQueryId(
      options.queryKey ?? [endpoint.path.join("/"), endpoint.method],
    );
    const storageKey = queryId;
    const requestKey = `${queryId}|${JSON.stringify(requestData)}|${JSON.stringify(pathParams)}`;

    // Clean up old in-flight requests
    cleanupInFlightRequests();

    // Check if we need to throttle this request
    const now = Date.now();
    const lastRequestTime = throttleMap.get(requestKey);
    if (lastRequestTime && now - lastRequestTime < THROTTLE_INTERVAL) {
      // If we've made this request recently, throttle it
      // Check if we already have a request in flight
      const existingRequestEntry = inFlightRequests.get(requestKey);
      if (existingRequestEntry) {
        // If we have a request in flight, return the existing request
        return await (existingRequestEntry.promise as Promise<TResponse>);
      }
    }

    // Update the throttle map
    throttleMap.set(requestKey, now);

    // Clean up the throttle map if it gets too large
    if (throttleMap.size > MAX_IN_FLIGHT_REQUESTS * 2) {
      // Keep only the most recent entries
      const entries = Array.from(throttleMap.entries());
      entries.sort((a, b) => b[1] - a[1]); // Sort by timestamp, newest first
      throttleMap.clear();
      for (const [key, timestamp] of entries.slice(0, MAX_IN_FLIGHT_REQUESTS)) {
        throttleMap.set(key, timestamp);
      }
    }

    // Check if we already have a request in flight
    const existingRequestEntry = inFlightRequests.get(requestKey);
    if (existingRequestEntry && options.refreshDelay) {
      // If we have a request in flight and a refresh delay is set, return the existing request
      return await (existingRequestEntry.promise as Promise<TResponse>);
    }

    // Check if we have fresh data in the store
    const existingQuery = get().queries[queryId];
    const hasValidData = existingQuery?.data && !existingQuery.isError;
    const isFresh =
      existingQuery?.lastFetchTime &&
      Date.now() - existingQuery.lastFetchTime < (options.staleTime ?? 60_000);

    // If we have fresh data and this isn't a forced refresh, just update the state minimally
    if (hasValidData && isFresh && !options.forceRefresh) {
      // Just mark as fetching without changing other state
      set((state) => {
        const queries = { ...state.queries };
        if (queries[queryId]) {
          queries[queryId] = {
            ...queries[queryId],
            isFetching: true,
          };
        }
        return { queries };
      });

      // Return the existing data wrapped in a promise
      const result = existingQuery.data as TResponse;

      // Schedule a background refresh if needed
      if (options.backgroundRefresh) {
        // Define the window interface extension
        interface CustomWindow extends Window {
          __nextVibeTimeouts?: Record<string, () => void>;
        }

        const timeoutKey = `bg_refresh_${queryId}_${Date.now()}`;
        const refreshDelay = options.refreshDelay ?? 100;

        const timeoutId = setTimeout(() => {
          // Remove this timeout from tracking
          if (typeof window !== "undefined") {
            const customWindow = window as CustomWindow;
            if (customWindow.__nextVibeTimeouts) {
              delete customWindow.__nextVibeTimeouts[timeoutKey];
            }
          }

          void get().executeQuery(endpoint, requestData, pathParams, {
            ...options,
            forceRefresh: true,
            backgroundRefresh: false,
          });
        }, refreshDelay);

        // Store the timeout ID so it can be cleaned up if needed
        if (typeof window !== "undefined") {
          const customWindow = window as CustomWindow;

          // Initialize the timeouts object if it doesn't exist
          customWindow.__nextVibeTimeouts ??= {};

          // Store the timeout ID with a cleanup function
          customWindow.__nextVibeTimeouts[timeoutKey] = (): void => {
            clearTimeout(timeoutId);
          };

          // Auto-cleanup after 30 seconds to prevent memory leaks
          setTimeout(() => {
            const win = window as CustomWindow;
            if (win.__nextVibeTimeouts?.[timeoutKey]) {
              // Call the cleanup function
              win.__nextVibeTimeouts[timeoutKey]();
              // Remove the entry
              delete win.__nextVibeTimeouts[timeoutKey];
            }
          }, 30_000);
        }
      }

      return await Promise.resolve(result);
    }

    // Set initial loading state
    set((state) => {
      const queries = { ...state.queries };
      const existingData = queries[queryId]?.data;
      const existingLastFetchTime = queries[queryId]?.lastFetchTime;

      queries[queryId] = {
        data: existingData ?? undefined,
        error: null,
        isError: false,
        isSuccess: false,
        isCachedData: false,
        lastFetchTime: existingLastFetchTime ?? null,
        isLoading: true,
        isFetching: true,
        statusMessage: "Loading data...",
        isLoadingFresh: existingData ? false : true,
      };

      return { queries };
    });

    // Deduplicate in-flight requests
    if (
      inFlightRequests.has(requestKey) &&
      options.deduplicateRequests !== false
    ) {
      try {
        const entry = inFlightRequests.get(requestKey);
        if (entry) {
          return (await entry.promise) as TResponse;
        }
      } catch (error) {
        // If the shared request fails, we'll continue and try again
        errorLogger("Shared request failed, retrying", error);
        // Remove the failed request
        inFlightRequests.delete(requestKey);
      }
    }

    // Try to load from cache if enabled
    if (!options.disableLocalCache) {
      try {
        const cachedData = await getStorageItem<TResponse>(storageKey);
        if (cachedData) {
          set((state) => ({
            queries: {
              ...state.queries,
              [queryId]: {
                data: cachedData,
                lastFetchTime: state.queries[queryId]?.lastFetchTime ?? null,
                ...(state.queries[queryId] ?? {}),
                error: null,
                isLoading: false,
                isFetching: false,
                isError: false,
                isSuccess: true,
                isLoadingFresh: false,
                isCachedData: true,
                statusMessage: "Showing cached data",
              },
            },
          }));

          // Return cached data immediately, but continue fetching fresh data
          // using proper background refresh with delay to prevent race conditions
          const refreshDelay = options.refreshDelay ?? 50; // 50ms default delay

          // Track all background refresh timeouts to prevent memory leaks
          const timeoutKey = `bg_refresh_${queryId}_${Date.now()}`;

          // Define the window interface extension
          interface CustomWindow extends Window {
            __nextVibeTimeouts?: Record<string, () => void>;
          }

          // Use a simple timeout instead of creating a promise that might not be properly cleaned up
          const timeoutId = setTimeout(() => {
            // Remove this timeout from tracking
            if (typeof window !== "undefined") {
              const customWindow = window as CustomWindow;
              if (customWindow.__nextVibeTimeouts) {
                delete customWindow.__nextVibeTimeouts[timeoutKey];
              }
            }

            const { executeQuery } = get();
            executeQuery(endpoint, requestData, pathParams, {
              ...options,
              queryKey: options.queryKey as QueryKey,
              disableLocalCache: true,
              // Prevent infinite chain of background refreshes
              backgroundRefresh: false,
            }).catch((err) => errorLogger("Background refresh failed:", err));
          }, refreshDelay);

          // Store the timeout ID so it can be cleaned up if needed
          if (typeof window !== "undefined") {
            const customWindow = window as CustomWindow;

            // Initialize the timeouts object if it doesn't exist
            customWindow.__nextVibeTimeouts ??= {};

            // Store the timeout ID with a cleanup function
            customWindow.__nextVibeTimeouts[timeoutKey] = (): void => {
              clearTimeout(timeoutId);
            };

            // Auto-cleanup after 30 seconds to prevent memory leaks
            setTimeout(() => {
              const win = window as CustomWindow;
              if (win.__nextVibeTimeouts?.[timeoutKey]) {
                // Call the cleanup function
                win.__nextVibeTimeouts[timeoutKey]();
                // Remove the entry
                delete win.__nextVibeTimeouts[timeoutKey];
              }
            }, 30_000);
          }

          return cachedData;
        }
      } catch (error) {
        errorLogger("Failed to load data from storage:", error);
      }
    }

    // Create the fetch promise
    const fetchPromise = (async (): Promise<TResponse> => {
      try {
        // Execute the API call
        let endpointUrl, postBody, success, message;
        try {
          const result = endpoint.getRequestData({
            requestData,
            pathParams,
          });
          endpointUrl = result.endpointUrl;
          postBody = result.postBody;
          success = result.success;
          message = result.message;

          if (!success) {
            await removeStorageItem(storageKey);
            throw new Error(message);
          }
        } catch (validationError) {
          // Handle validation errors gracefully
          debugLogger("Validation error in API request", validationError);
          await removeStorageItem(storageKey);
          throw new Error(
            `Request validation error: ${validationError instanceof Error ? validationError.message : "Unknown validation error"}`,
          );
        }

        const response = await callApi<
          TRequest,
          TResponse,
          TUrlVariables,
          TExampleKey
        >(endpoint, endpointUrl, postBody);

        if (!response.success) {
          await removeStorageItem(storageKey);
          throw new Error(response.message);
        }

        // Cache successful response if caching is enabled
        if (!options.disableLocalCache) {
          void setStorageItem(storageKey, response.data);
        }

        // Update state with successful result
        set((state) => ({
          queries: {
            ...state.queries,
            [queryId]: {
              data: response.data,
              error: null,
              isLoading: false,
              isFetching: false,
              isError: false,
              isSuccess: true,
              isLoadingFresh: false,
              isCachedData: false,
              statusMessage: "Ready",
              lastFetchTime: Date.now(),
            },
          },
        }));

        // Call onSuccess callback if provided
        if (options.onSuccess) {
          options.onSuccess(response.data);
        }

        return response.data;
      } catch (error) {
        const errorResponse = handleError(error, {
          context: `Query ${endpoint.path.join("/")}`,
        });

        // Update state with error
        set((state) => ({
          queries: {
            ...state.queries,
            [queryId]: {
              ...(state.queries[queryId] ?? {}),
              data: state.queries[queryId]?.data ?? undefined,
              error: new Error(errorResponse.message),
              isLoading: false,
              isFetching: false,
              isError: true,
              isSuccess: false,
              isLoadingFresh: false,
              isCachedData: state.queries[queryId]?.isCachedData ?? false,
              statusMessage: `Error: ${errorResponse.message}`,
              lastFetchTime: Date.now(),
            },
          },
        }));

        // Call onError callback if provided
        if (options.onError) {
          options.onError(new Error(errorResponse.message));
        }

        throw new Error(errorResponse.message);
      } finally {
        // Remove the in-flight request
        inFlightRequests.delete(requestKey);
      }
    })();

    // Register the in-flight request with timestamp
    inFlightRequests.set(requestKey, {
      promise: fetchPromise,
      timestamp: Date.now(),
    });

    return (await fetchPromise) as TResponse;
  },

  executeMutation: async <TRequest, TResponse, TUrlVariables, TExampleKey>(
    endpoint: ApiEndpoint<TRequest, TResponse, TUrlVariables, TExampleKey>,
    requestData: TRequest,
    pathParams: TUrlVariables,
    options: ApiMutationOptions<TRequest, TResponse, TUrlVariables> = {},
  ): Promise<TResponse> => {
    const mutationId = get().getMutationId(endpoint);

    // Set initial state
    set((state) => ({
      mutations: {
        ...state.mutations,
        [mutationId]: {
          isPending: true,
          isError: false,
          error: null,
          isSuccess: false,
          data: undefined,
        },
      },
    }));

    try {
      let endpointUrl, postBody, success, message;
      try {
        const result = endpoint.getRequestData({
          requestData,
          pathParams,
        });
        endpointUrl = result.endpointUrl;
        postBody = result.postBody;
        success = result.success;
        message = result.message;

        if (!success) {
          throw new Error(message);
        }
      } catch (validationError) {
        // Handle validation errors gracefully
        debugLogger("Validation error in API mutation", validationError);
        throw new Error(
          `Request validation error: ${validationError instanceof Error ? validationError.message : "Unknown validation error"}`,
        );
      }

      const response = await callApi<
        TRequest,
        TResponse,
        TUrlVariables,
        TExampleKey
      >(endpoint, endpointUrl, postBody);

      if (!response.success) {
        throw new Error(response.message);
      }

      // Update success state
      set((state) => ({
        mutations: {
          ...state.mutations,
          [mutationId]: {
            isPending: false,
            isError: false,
            error: null,
            isSuccess: true,
            data: response.data,
          },
        },
      }));

      // Invalidate queries (trigger refetch)
      if (options.invalidateQueries) {
        await get().invalidateQueries(options.invalidateQueries);
      }

      // Call onSuccess handler if provided
      if (options.onSuccess) {
        await options.onSuccess({
          responseData: response.data,
          pathParams,
          requestData,
        });
      }

      return response.data;
    } catch (error) {
      const errorResponse = handleError(error, {
        context: `Mutation ${endpoint.path.join("/")}`,
      });

      // Update error state
      set((state) => ({
        mutations: {
          ...state.mutations,
          [mutationId]: {
            isPending: false,
            isError: true,
            error: new Error(errorResponse.message),
            isSuccess: false,
            data: undefined,
          },
        },
      }));

      // Call onError handler if provided
      if (options.onError) {
        await options.onError({
          pathParams,
          requestData,
          error: new Error(errorResponse.message),
        });
      }

      throw new Error(errorResponse.message);
    }
  },

  invalidateQueries: async (queryKey: QueryKey): Promise<void> => {
    const queryId = get().getQueryId(queryKey);

    // Remove from storage
    await removeStorageItem(queryId);

    // Clear from in-memory state to force refetch on next access
    set((state) => {
      const queries = { ...state.queries };
      if (queries[queryId]) {
        // Mark as stale instead of completely removing
        queries[queryId] = {
          ...queries[queryId],
          isCachedData: true,
        };
      }
      return { queries };
    });

    // Also invalidate in React Query if it's being used
    await queryClient.invalidateQueries({ queryKey });
  },

  refetchQuery: async <TResponse>(
    queryKey: QueryKey,
  ): Promise<TResponse | undefined> => {
    const queryId = get().getQueryId(queryKey);
    const query = get().queries[queryId];

    if (!query) {
      return undefined;
    }

    // We'd need the original parameters to refetch properly
    // This is a limitation of the current implementation
    // In a complete solution, we'd store the original parameters with the query

    // For now, just invalidate to force a refetch on next access
    await get().invalidateQueries(queryKey);
    return query.data as TResponse | undefined;
  },

  setFormError: (formId: string, error: Error | null): void => {
    set((state) => ({
      forms: {
        ...state.forms,
        [formId]: {
          ...(state.forms[formId] ?? { isSubmitting: false }),
          formError: error,
        },
      },
    }));
  },

  clearFormError: (formId: string): void => {
    set((state) => ({
      forms: {
        ...state.forms,
        [formId]: {
          ...(state.forms[formId] ?? { formError: null, isSubmitting: false }),
          formError: null,
        },
      },
    }));
  },

  setFormQueryParams: (
    formId: string,
    params: Record<string, unknown>,
  ): void => {
    set((state) => ({
      forms: {
        ...state.forms,
        [formId]: {
          ...(state.forms[formId] ?? { formError: null, isSubmitting: false }),
          queryParams: params,
        },
      },
    }));
  },

  getFormQueryParams: <T extends Record<string, unknown>>(
    formId: string,
  ): T | undefined => {
    const form = get().forms[formId];
    return form?.queryParams as T | undefined;
  },
}));

// Export QueryClient for potential direct usage
export { queryClient };

/**
 * Non-hook version for fetching data outside of React components
 * Use this in regular functions instead of useApiQuery
 */
export const apiClient = {
  /**
   * Fetch data from an API endpoint without using React hooks
   */
  fetch: async <TRequest, TResponse, TUrlVariables, TExampleKey>(
    endpoint: ApiEndpoint<TRequest, TResponse, TUrlVariables, TExampleKey>,
    requestData: TRequest,
    pathParams: TUrlVariables,
    options: Omit<ApiQueryOptions<TResponse>, "queryKey"> & {
      queryKey?: QueryKey;
    } = {},
  ): Promise<TResponse> => {
    return await useApiStore
      .getState()
      .executeQuery(endpoint, requestData, pathParams, options);
  },

  /**
   * Mutate data through an API endpoint without using React hooks
   */
  mutate: async <TRequest, TResponse, TUrlVariables, TExampleKey>(
    endpoint: ApiEndpoint<TRequest, TResponse, TUrlVariables, TExampleKey>,
    data: TRequest,
    pathParams: TUrlVariables,
    options: ApiMutationOptions<TRequest, TResponse, TUrlVariables> = {},
  ): Promise<TResponse> => {
    return await useApiStore
      .getState()
      .executeMutation(endpoint, data, pathParams, options);
  },

  /**
   * Invalidate a query to force refetch on next access
   */
  invalidateQueries: async (queryKey: QueryKey): Promise<void> => {
    await useApiStore.getState().invalidateQueries(queryKey);
  },

  /**
   * Get current query state without using React hooks
   */
  getQueryState: <TResponse>(
    queryKey: QueryKey,
  ): QueryStoreType<TResponse> | undefined => {
    const queryId = useApiStore.getState().getQueryId(queryKey);
    const state = useApiStore.getState();
    const query = state.queries[queryId];
    return query ? (query as QueryStoreType<TResponse>) : undefined;
  },

  /**
   * Get current mutation state without using React hooks
   */
  getMutationState: <TRequest, TResponse, TUrlVariables, TExampleKey>(
    endpoint: ApiEndpoint<TRequest, TResponse, TUrlVariables, TExampleKey>,
  ): MutationStoreType<TResponse> | undefined => {
    const mutationId = useApiStore.getState().getMutationId(endpoint);
    const state = useApiStore.getState();
    const mutation = state.mutations[mutationId];
    return mutation ? (mutation as MutationStoreType<TResponse>) : undefined;
  },
};
