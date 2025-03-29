import type { QueryKey } from "@tanstack/react-query";
import { QueryClient } from "@tanstack/react-query";
import { create } from "zustand";

import { handleError } from "../../../shared/utils/error-handler";
import { errorLogger } from "../../../shared/utils/logger";
import { generateCacheKey } from "../../config";
import type { ApiEndpoint } from "../../endpoint";
import {
  generateStorageKey,
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
      staleTime: 60000,
      refetchOnWindowFocus: false,
    },
  },
});

// Track in-flight requests to prevent duplicates
const inFlightRequests = new Map<string, Promise<unknown>>();

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
    }
  >;

  // Methods
  executeQuery: <TRequest, TResponse, TUrlVariables>(
    endpoint: ApiEndpoint<TRequest, TResponse, TUrlVariables>,
    requestData: TRequest,
    pathParams: TUrlVariables,
    options?: Omit<ApiQueryOptions<TResponse>, "queryKey"> & {
      queryKey?: QueryKey;
    },
  ) => Promise<TResponse>;

  executeMutation: <TRequest, TResponse, TUrlVariables>(
    endpoint: ApiEndpoint<TRequest, TResponse, TUrlVariables>,
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
  getMutationId: (endpoint: ApiEndpoint<unknown, unknown, unknown>) => string;
  getFormId: (endpoint: ApiEndpoint<unknown, unknown, unknown>) => string;
}

export type QueryStoreType<TResponse> = {
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
};

export type MutationStoreType<TResponse> = {
  isPending: boolean;
  isError: boolean;
  error: Error | null;
  isSuccess: boolean;
  data: TResponse | undefined;
};

export const useApiStore = create<ApiStore>((set, get) => ({
  queries: {},
  mutations: {},
  forms: {},

  getQueryId: (queryKey: QueryKey): string => generateCacheKey(queryKey),

  getMutationId: (endpoint: ApiEndpoint<unknown, unknown, unknown>): string =>
    `mutation-${endpoint.path.join("-")}-${endpoint.method}`,

  getFormId: (endpoint: ApiEndpoint<unknown, unknown, unknown>): string =>
    `form-${endpoint.path.join("-")}-${endpoint.method}`,

  executeQuery: async <TRequest, TResponse, TUrlVariables>(
    endpoint: ApiEndpoint<TRequest, TResponse, TUrlVariables>,
    requestData: TRequest,
    pathParams: TUrlVariables,
    options: Omit<ApiQueryOptions<TResponse>, "queryKey"> & {
      queryKey?: QueryKey;
    } = {},
  ): Promise<TResponse> => {
    const queryId = get().getQueryId(
      options.queryKey || [endpoint.path.join("/"), endpoint.method],
    );
    const storageKey = queryId;
    const requestKey = `${queryId}|${JSON.stringify(requestData)}|${JSON.stringify(pathParams)}`;

    // Set initial loading state
    set((state) => ({
      queries: {
        ...state.queries,
        [queryId]: {
          data: undefined,
          error: null,
          isError: false,
          isSuccess: false,
          isCachedData: false,
          lastFetchTime: null,
          isLoading: true,
          isFetching: true,
          statusMessage: "Loading data...",
          isLoadingFresh: state.queries[queryId]?.data ? false : true,
          ...(state.queries[queryId] || {}),
        },
      },
    }));

    // Deduplicate in-flight requests
    if (
      inFlightRequests.has(requestKey) &&
      options.deduplicateRequests !== false
    ) {
      try {
        return inFlightRequests.get(requestKey) as Promise<TResponse>;
      } catch (error) {
        // If the shared request fails, we'll continue and try again
        errorLogger("Shared request failed, retrying", error);
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
                lastFetchTime: state.queries[queryId]?.lastFetchTime || null,
                ...(state.queries[queryId] || {}),
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

          const refreshPromise = new Promise<void>((resolve) => {
            setTimeout(() => {
              get()
                .executeQuery(endpoint, requestData, pathParams, {
                  ...options,
                  queryKey: options.queryKey as QueryKey,
                  disableLocalCache: true,
                })
                .catch((err) => errorLogger("Background refresh failed:", err))
                .finally(() => resolve());
            }, refreshDelay);
          });

          // Don't block the return, but initiate the refresh
          void refreshPromise;

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
        const { endpointUrl, postBody, success, message } =
          endpoint.getRequestData({
            requestData,
            pathParams,
          });

        if (!success) {
          await removeStorageItem(storageKey);
          throw new Error(message);
        }

        const response = await callApi<TRequest, TResponse, TUrlVariables>(
          endpoint,
          endpointUrl,
          postBody,
        );

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
              ...(state.queries[queryId] || {}),
              data: state.queries[queryId]?.data || undefined,
              error: new Error(errorResponse.message),
              isLoading: false,
              isFetching: false,
              isError: true,
              isSuccess: false,
              isLoadingFresh: false,
              isCachedData: state.queries[queryId]?.isCachedData || false,
              statusMessage: `Error: ${errorResponse.message}`,
              lastFetchTime: Date.now(),
            },
          },
        }));

        // Call onError callback if provided
        if (options.onError) {
          options.onError(new Error(errorResponse.message));
        }

        // throw new Error(errorResponse.message);
      } finally {
        // Remove the in-flight request
        inFlightRequests.delete(requestKey);
      }
    })();

    // Register the in-flight request
    inFlightRequests.set(requestKey, fetchPromise);

    return fetchPromise;
  },

  executeMutation: async <TRequest, TResponse, TUrlVariables>(
    endpoint: ApiEndpoint<TRequest, TResponse, TUrlVariables>,
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
      const { endpointUrl, postBody, success, message } =
        endpoint.getRequestData({
          requestData,
          pathParams,
        });

      if (!success) {
        throw new Error(message);
      }

      const response = await callApi<TRequest, TResponse, TUrlVariables>(
        endpoint,
        endpointUrl,
        postBody,
      );

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

      // Handle optimistic updates
      if (options.updateQueries) {
        options.updateQueries.forEach(({ queryKey, updater }) => {
          const queryId = get().getQueryId(queryKey);
          const currentData = get().queries[queryId]?.data;

          if (currentData) {
            const newData = updater(currentData, response.data);

            // Update in-memory state
            set((state) => ({
              queries: {
                ...state.queries,
                [queryId]: {
                  ...(state.queries[queryId] || {}),
                  data: newData,
                  isSuccess: true,
                  lastFetchTime: Date.now(),
                  error: null,
                  isLoading: false,
                  isFetching: false,
                  isError: false,
                  isLoadingFresh: false,
                  isCachedData: false,
                  statusMessage: "Ready",
                },
              },
            }));

            // Update storage
            const storageKey = generateStorageKey(queryKey);
            void setStorageItem(storageKey, newData);
          }
        });
      }

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
    return query.data as TResponse;
  },

  setFormError: (formId: string, error: Error | null): void => {
    set((state) => ({
      forms: {
        ...state.forms,
        [formId]: {
          ...(state.forms[formId] || { isSubmitting: false }),
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
          ...(state.forms[formId] || { formError: null, isSubmitting: false }),
          formError: null,
        },
      },
    }));
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
  fetch: async <TRequest, TResponse, TUrlVariables>(
    endpoint: ApiEndpoint<TRequest, TResponse, TUrlVariables>,
    requestData: TRequest,
    pathParams: TUrlVariables,
    options: Omit<ApiQueryOptions<TResponse>, "queryKey"> & {
      queryKey?: QueryKey;
    } = {},
  ): Promise<TResponse> => {
    return useApiStore
      .getState()
      .executeQuery(endpoint, requestData, pathParams, options);
  },

  /**
   * Mutate data through an API endpoint without using React hooks
   */
  mutate: async <TRequest, TResponse, TUrlVariables>(
    endpoint: ApiEndpoint<TRequest, TResponse, TUrlVariables>,
    data: TRequest,
    pathParams: TUrlVariables,
    options: ApiMutationOptions<TRequest, TResponse, TUrlVariables> = {},
  ): Promise<TResponse> => {
    return useApiStore
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
  ):
    | {
        data: TResponse;
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
    | undefined => {
    const queryId = useApiStore.getState().getQueryId(queryKey);
    const state = useApiStore.getState();
    return state.queries[queryId] as
      | {
          data: TResponse;
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
      | undefined;
  },

  /**
   * Get current mutation state without using React hooks
   */
  getMutationState: <TResponse>(
    endpoint: ApiEndpoint<unknown, TResponse, unknown>,
  ):
    | {
        isPending: boolean;
        isError: boolean;
        error: Error | null;
        isSuccess: boolean;
        data: TResponse;
      }
    | undefined => {
    const mutationId = useApiStore.getState().getMutationId(endpoint);
    const state = useApiStore.getState();
    return state.mutations[mutationId] as
      | {
          isPending: boolean;
          isError: boolean;
          error: Error | null;
          isSuccess: boolean;
          data: TResponse;
        }
      | undefined;
  },
};
