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
        endpoint.path,
        endpoint.method,
        requestData,
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

    // Execute the query
    void executeQuery(endpoint, requestData, urlParams, {
      ...queryOptions,
      queryKey,
    });

    // Update initial mount ref
    isInitialMount.current = false;
  }, [
    queryId,
    options.enabled,
    executeQuery,
    endpoint,
    requestData,
    urlParams,
    queryOptions,
    queryKey,
    skipInitialFetch,
    refetchOnDependencyChange,
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
