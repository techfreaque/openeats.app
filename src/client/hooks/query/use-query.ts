import { type QueryKey } from "@tanstack/react-query";
import { useEffect, useState } from "react";

import type { ApiEndpoint } from "../../../server/endpoints/core/endpoint";
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

  // Get query state from store
  const queryState = useApiStore(
    (state) =>
      state.queries[queryId] || {
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
      },
  );

  const [isInitialized, setIsInitialized] = useState(false);

  // Execute query when component mounts or dependencies change
  useEffect(() => {
    if (options.enabled === false) {
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
    pathParams,
    queryKey
      .map((k) => (typeof k === "object" ? JSON.stringify(k) : String(k)))
      .join("."),
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
    isLoading: queryState.isLoading,
    isFetching: queryState.isFetching,
    isError: queryState.isError,
    isSuccess: queryState.isSuccess,
    isLoadingFresh: queryState.isLoadingFresh,
    isCachedData: queryState.isCachedData,
    statusMessage: queryState.statusMessage,

    // Add additional methods/properties to match React Query's API
    status: queryState.isLoading
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
