"use client";

import { type QueryKey } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useRef } from "react";

import type { ApiEndpoint } from "../../endpoint";
import type { ApiStore, QueryStoreType } from "../store";
import { useApiStore } from "../store";
import type { EnhancedQueryResult } from "../types";

/**
 * React Query hook for GET requests with local storage caching
 * @param endpoint - The endpoint to call
 * @param requestData - Request data for the API call
 * @param urlParams - URL parameters for the API call
 * @param options - Query options
 * @returns Enhanced query result with extra loading state information
 */
export function useApiQuery<
  TRequest,
  TResponse,
  TUrlVariables,
  TExampleKey = "default",
>(
  endpoint: ApiEndpoint<TRequest, TResponse, TUrlVariables, TExampleKey>,
  requestData: TRequest,
  urlParams: TUrlVariables,
  options: {
    queryKey?: QueryKey;
    enabled?: boolean;
    staleTime?: number;
    cacheTime?: number;
    onSuccess?: (data: TResponse) => void;
    onError?: (error: Error) => void;
    disableLocalCache?: boolean;
    refreshDelay?: number;
    /**
     * Whether to skip initial fetch when component mounts
     * @default false
     */
    skipInitialFetch?: boolean;
    /**
     * Whether to refetch when dependencies change
     * @default true
     */
    refetchOnDependencyChange?: boolean;
  } = {},
): EnhancedQueryResult<TResponse> {
  const {
    queryKey: customQueryKey,
    skipInitialFetch = false,
    refetchOnDependencyChange = true,
    ...queryOptions
  } = options;

  // Create a stable query key
  const queryKey: QueryKey = useMemo(
    () =>
      customQueryKey ?? [
        endpoint.path.join('/'),
        endpoint.method,
        // Use a more stable representation for complex objects
        typeof requestData === 'object' ?
          JSON.stringify(requestData, (key, value) =>
            // Handle circular references
            typeof value === 'object' && value !== null ?
              Object.keys(value).length > 0 ?
                Object.fromEntries(Object.entries(value).filter(([k]) => !k.startsWith('_'))) :
                value :
              value
          ) :
          requestData,
        typeof urlParams === 'object' ?
          JSON.stringify(urlParams, (key, value) =>
            // Handle circular references
            typeof value === 'object' && value !== null ?
              Object.keys(value).length > 0 ?
                Object.fromEntries(Object.entries(value).filter(([k]) => !k.startsWith('_'))) :
                value :
              value
          ) :
          urlParams,
      ],
    [customQueryKey, endpoint.path, endpoint.method, requestData, urlParams],
  );

  // Get API store methods
  const { executeQuery, getQueryId } = useApiStore();

  // Get query ID
  const queryId = useMemo(() => getQueryId(queryKey), [getQueryId, queryKey]);

  // Track if this is the initial mount
  const isInitialMount = useRef(true);

  // Create default state based on enabled option
  const defaultState: QueryStoreType<TResponse> = useMemo(() => {
    return options.enabled === false
      ? {
          data: undefined,
          error: null,
          isLoading: false,
          isFetching: false,
          isError: false,
          isSuccess: false,
          isLoadingFresh: false,
          isCachedData: false,
          statusMessage: "Query disabled",
          lastFetchTime: null,
        }
      : {
          data: undefined,
          error: null,
          isLoading: true,
          isFetching: true,
          isError: false,
          isSuccess: false,
          isLoadingFresh: true,
          isCachedData: false,
          statusMessage: "Loading...",
          lastFetchTime: null,
        };
  }, [options.enabled]);

  // Create a selector function for the store
  const selector = useCallback(
    (state: ApiStore): QueryStoreType<TResponse> => {
      const query = state.queries[queryId];
      return query ? (query as QueryStoreType<TResponse>) : defaultState;
    },
    [queryId, defaultState],
  );

  // Get query state from store with shallow comparison
  const queryState = useApiStore(selector);

  // Track the last execution time to prevent excessive API calls
  const lastExecutionTimeRef = useRef<number>(0);
  const isExecutingRef = useRef<boolean>(false);
  const minExecutionInterval = 2000; // Minimum 2 seconds between executions

  // Execute query when component mounts or dependencies change
  useEffect(() => {
    // Skip if query is disabled
    if (options.enabled === false) {
      return;
    }

    // Skip initial fetch if requested
    if (isInitialMount.current && skipInitialFetch) {
      isInitialMount.current = false;
      return;
    }

    // Skip dependency-based refetch if requested
    if (!isInitialMount.current && !refetchOnDependencyChange) {
      return;
    }

    // Check if we're already executing
    if (isExecutingRef.current) {
      return;
    }

    // Check if we're executing too frequently
    const now = Date.now();
    if (now - lastExecutionTimeRef.current < minExecutionInterval) {
      // We're executing too frequently, wait a bit
      const timeoutId = setTimeout(() => {
        // Check if we already have data in the store
        const existingQuery = useApiStore.getState().queries[queryId];
        const hasValidData = existingQuery?.data && !existingQuery.isError;
        const isFresh =
          existingQuery?.lastFetchTime &&
          Date.now() - existingQuery.lastFetchTime <
            (queryOptions.staleTime || 60_000);

        // Skip fetch if we have fresh data
        if (hasValidData && isFresh && !isInitialMount.current) {
          return;
        }

        // Mark as executing
        isExecutingRef.current = true;

        // Execute the query
        void executeQuery(endpoint, requestData, urlParams, {
          ...queryOptions,
          queryKey,
        }).finally(() => {
          // Mark as no longer executing
          isExecutingRef.current = false;
          // Update execution time
          lastExecutionTimeRef.current = Date.now();
        });

        // Update initial mount ref
        isInitialMount.current = false;
      }, minExecutionInterval - (now - lastExecutionTimeRef.current));

      return () => clearTimeout(timeoutId);
    }

    // Check if we already have data in the store
    const existingQuery = useApiStore.getState().queries[queryId];
    const hasValidData = existingQuery?.data && !existingQuery.isError;
    const isFresh =
      existingQuery?.lastFetchTime &&
      Date.now() - existingQuery.lastFetchTime <
        (queryOptions.staleTime || 60_000);

    // Skip fetch if we have fresh data
    if (hasValidData && isFresh && !isInitialMount.current) {
      return;
    }

    // Mark as executing
    isExecutingRef.current = true;

    // Execute the query with a small delay to prevent multiple simultaneous requests
    const timeoutId = setTimeout(() => {
      void executeQuery(endpoint, requestData, urlParams, {
        ...queryOptions,
        queryKey,
      }).finally(() => {
        // Mark as no longer executing
        isExecutingRef.current = false;
        // Update execution time
        lastExecutionTimeRef.current = Date.now();
      });
    }, 100); // Add a small delay

    // Update initial mount ref
    isInitialMount.current = false;

    return () => clearTimeout(timeoutId);
  }, [
    queryId,
    options.enabled,
    executeQuery,
    // Use a stable representation of the query key instead of individual dependencies
    // This prevents unnecessary re-renders when the query key is stable
    JSON.stringify(queryKey),
    skipInitialFetch,
    refetchOnDependencyChange,
    // Include only the necessary options
    queryOptions.staleTime,
    queryOptions.cacheTime,
    queryOptions.refetchOnWindowFocus,
  ]);

  // Refetch function
  const refetch = useCallback(async (): Promise<TResponse> => {
    return await executeQuery<TRequest, TResponse, TUrlVariables, TExampleKey>(
      endpoint,
      requestData,
      urlParams,
      {
        ...queryOptions,
        queryKey,
        disableLocalCache: true, // Force refetch
      },
    );
  }, [executeQuery, endpoint, requestData, urlParams, queryOptions, queryKey]);

  // Remove function
  const remove = useCallback(() => {
    // Clear from in-memory state
    useApiStore.setState((state) => {
      const queries = { ...state.queries };
      delete queries[queryId];
      return { queries };
    });
  }, [queryId]);

  // Create a result object that matches React Query's API
  return useMemo(() => {
    type QueryStatus = "loading" | "error" | "success" | "idle";

    const status: QueryStatus =
      queryState.isLoading || queryState.isFetching
        ? "loading"
        : queryState.isError
          ? "error"
          : queryState.isSuccess
            ? "success"
            : "idle";

    const result: EnhancedQueryResult<TResponse> = {
      data: queryState.data,
      error: queryState.error ?? undefined,
      isLoading: queryState.isLoading || queryState.isFetching,
      isFetching: queryState.isFetching,
      isError: queryState.isError,
      isSuccess: queryState.isSuccess,
      isLoadingFresh: queryState.isLoadingFresh,
      isCachedData: queryState.isCachedData,
      statusMessage: queryState.statusMessage,

      // Add additional methods/properties to match React Query's API
      status,
      refetch,
      remove,
    };

    return result;
  }, [queryState, refetch, remove]);
}
