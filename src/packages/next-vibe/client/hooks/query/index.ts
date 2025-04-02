"use client";

import { type QueryKey } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";

// Add this import if not already available
import type { ApiEndpoint } from "../../endpoint";
import type { ApiStore, QueryStoreType } from "../store";
import { useApiStore } from "../store";
import type { EnhancedQueryResult } from "../types";

/**
 * React Query hook for GET requests with local storage caching
 * @param endpoint - The endpoint to call
 * @param options - Query options including data and URL params
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
  } = {},
): EnhancedQueryResult<TResponse> {
  const { queryKey: customQueryKey, ...queryOptions } = options;

  const queryKey: QueryKey = customQueryKey ?? [
    endpoint.path,
    endpoint.method,
    requestData,
    urlParams,
  ];

  const { executeQuery, getQueryId } = useApiStore();
  const queryId = getQueryId(queryKey);
  const defaultState: QueryStoreType<TResponse> = options.enabled
    ? {
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
      }
    : {
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
      };
  const selector = useMemo(
    () =>
      (state: ApiStore): QueryStoreType<TResponse> =>
        (state.queries[queryId] as unknown as
          | undefined
          | QueryStoreType<TResponse>) ?? defaultState,
    // eslint-disable-next-line react-compiler/react-compiler
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [queryId, options.enabled],
  );

  // Get query state from store with shallow comparison
  const queryState = useApiStore(selector);

  // const [isInitialized, setIsInitialized] = useState(false);

  // Execute query when component mounts or dependencies change
  useEffect(() => {
    if (options.enabled === false) {
      //   setIsInitialized(true);
    } else {
      void executeQuery(endpoint, requestData, urlParams, {
        ...queryOptions,
        queryKey,
      });
      // .catch(() => {
      //   // Errors are already handled in the store
      // })
      // .finally(() => {
      //   setIsInitialized(true);
      // });
    }
    // eslint-disable-next-line react-compiler/react-compiler
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryId, options.enabled]);

  const refetch = async (): Promise<TResponse> => {
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
  };

  // Create a result object that matches React Query's API
  const result: EnhancedQueryResult<TResponse> = {
    data: queryState.data ?? undefined,
    error: queryState.error ?? undefined,
    isLoading: queryState.isLoading || queryState.isFetching,
    isFetching: queryState.isFetching,
    isError: queryState.isError,
    isSuccess: queryState.isSuccess,
    isLoadingFresh: queryState.isLoadingFresh,
    isCachedData: queryState.isCachedData,
    statusMessage: queryState.statusMessage,

    // Add additional methods/properties to match React Query's API
    status:
      queryState.isLoading || queryState.isFetching
        ? "loading"
        : queryState.isError
          ? "error"
          : queryState.isSuccess
            ? "success"
            : "idle",
    refetch,
    remove: () => {
      // Clear from in-memory state
      useApiStore.setState((state) => {
        const queries = { ...state.queries };
        delete queries[queryId];
        return { queries };
      });
    },
  };

  return result;
}
