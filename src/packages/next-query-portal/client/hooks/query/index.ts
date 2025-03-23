"use client";

import { type QueryKey } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";

// Add this import if not already available
import type { ApiEndpoint } from "../../endpoint";
import type { ApiStore } from "../api-store";
import { useApiStore } from "../api-store";
import type { EnhancedQueryResult } from "../types";

/**
 * React Query hook for GET requests with local storage caching
 * @param endpoint - The endpoint to call
 * @param options - Query options including data and URL params
 * @returns Enhanced query result with extra loading state information
 */
export function useApiQuery<TRequest, TResponse, TUrlVariables>(
  endpoint: ApiEndpoint<TRequest, TResponse, TUrlVariables>,
  options: {
    data?: TRequest;
    urlParams?: TUrlVariables;
    queryKey?: QueryKey;
    enabled?: boolean;
    staleTime?: number;
    cacheTime?: number;
    onSuccess?: (data: TResponse) => void;
    onError?: (error: Error) => void;
    disableLocalCache?: boolean;
    refreshDelay?: number;
  } = {},
): EnhancedQueryResult<TResponse, Error> {
  const {
    data: requestData,
    urlParams: pathParams,
    queryKey: customQueryKey,
    ...queryOptions
  } = options;

  const queryKey = customQueryKey || [
    endpoint.path.join("/"),
    endpoint.method,
    requestData ? JSON.stringify(requestData) : undefined,
    pathParams ? JSON.stringify(pathParams) : undefined,
  ];

  const { executeQuery, getQueryId } = useApiStore();
  const queryId = getQueryId(queryKey);

  // Use a memoized selector function to prevent re-renders
  const selector = useMemo(
    () => (state: any) => state.queries[queryId],
    [queryId],
  );

  // Get query state from store with shallow comparison
  const queryState: ApiStore = useApiStore(selector) || {
    data: undefined,
    error: null,
    isLoading: true,
    isFetching: true,
    isError: false,
    isSuccess: false,
    isLoadingFresh: true,
    isCachedData: false,
    statusMessage: "Loading data...",
    lastFetchTime: null,
  };

  const [isInitialized, setIsInitialized] = useState(false);

  // Memoize dependencies to avoid unnecessary effect triggers
  const deps = useMemo(() => {
    return {
      endpoint: endpoint.path.join("/") + endpoint.method,
      requestData: requestData ? JSON.stringify(requestData) : undefined,
      pathParams: pathParams ? JSON.stringify(pathParams) : undefined,
      enabled: options.enabled,
    };
  }, [endpoint, requestData, pathParams, options.enabled]);

  // Execute query when component mounts or dependencies change
  useEffect(() => {
    if (deps.enabled === false) {
      setIsInitialized(true);
    } else {
      void executeQuery(endpoint, requestData, pathParams, {
        ...queryOptions,
        queryKey,
      })
        .catch(() => {
          // Errors are already handled in the store
        })
        .finally(() => {
          setIsInitialized(true);
        });
    }
  }, [
    deps,
    endpoint,
    executeQuery,
    pathParams,
    queryKey,
    queryOptions,
    requestData,
  ]);

  // Simplified refetch function that properly handles dependencies
  const refetch = async (): Promise<TResponse> => {
    return executeQuery(endpoint, requestData, pathParams, {
      ...queryOptions,
      queryKey,
      disableLocalCache: true, // Force refetch
    });
  };

  // Create a result object that matches React Query's API
  const result: EnhancedQueryResult<TResponse, Error> = {
    data: (queryState.data || undefined) as TResponse,
    error: queryState.error,
    isLoading: queryState.isLoading || queryState.isFetching || !isInitialized,
    isFetching: queryState.isFetching,
    isError: queryState.isError,
    isSuccess: queryState.isSuccess,
    isLoadingFresh: queryState.isLoadingFresh,
    isCachedData: queryState.isCachedData,
    statusMessage: queryState.statusMessage,

    // Add additional methods/properties to match React Query's API
    status:
      queryState.isLoading || queryState.isFetching || !isInitialized
        ? "loading"
        : queryState.isError
          ? "error"
          : queryState.isSuccess
            ? "success"
            : "idle",
    isIdle:
      !queryState.isLoading && !queryState.isError && !queryState.isSuccess,
    failureCount: 0,
    failureReason: queryState.error,
    errorUpdateCount: 0,

    // Add refetch method
    refetch,

    remove: () => {
      // Clear from in-memory state
      useApiStore.setState((state) => {
        const queries = { ...state.queries };
        delete queries[queryId];
        return { queries };
      });
    },
    fetchStatus: queryState.isFetching ? "fetching" : "idle",
  };

  return result;
}
