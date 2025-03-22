import type { UseMutationResult } from "@tanstack/react-query";
import { useCallback } from "react";

import type { ApiEndpoint } from "../../../server/endpoints/core/endpoint";
import { useApiStore } from "../api-store";
import type { ApiMutationOptions } from "../types";

/**
 * React Query hook for mutation requests (POST, PUT, DELETE, etc.)
 * @param endpoint - The endpoint to call
 * @param options - Mutation options
 * @returns Mutation result
 */
export function useApiMutation<TResponse, TRequest, TUrlVariables>(
  endpoint: ApiEndpoint<TRequest, TResponse, TUrlVariables>,
  options: ApiMutationOptions<TResponse, TRequest> = {},
): UseMutationResult<
  TResponse,
  Error,
  { data: TRequest; urlParams?: TUrlVariables },
  unknown
> {
  const { executeMutation, getMutationId } = useApiStore();
  const mutationId = getMutationId(endpoint);

  // Get mutation state from store
  const mutationState = useApiStore(
    (state) =>
      state.mutations[mutationId] || {
        isPending: false,
        isError: false,
        error: null,
        isSuccess: false,
        data: undefined,
      },
  );

  // Create a type-safe mutate function that accepts both data and urlParams
  const mutate = useCallback(
    (variables: { data: TRequest; urlParams?: TUrlVariables }) => {
      void executeMutation(
        endpoint,
        variables.data,
        variables.urlParams,
        options,
      );
    },
    [endpoint, options, executeMutation],
  );

  const mutateAsync = useCallback(
    async (variables: {
      data: TRequest;
      urlParams?: TUrlVariables;
    }): Promise<TResponse> => {
      return executeMutation(
        endpoint,
        variables.data,
        variables.urlParams,
        options,
      );
    },
    [endpoint, options, executeMutation],
  );

  // Reset mutation state
  const reset = useCallback(() => {
    useApiStore.setState((state) => {
      const mutations = { ...state.mutations };
      mutations[mutationId] = {
        isPending: false,
        isError: false,
        error: null,
        isSuccess: false,
        data: undefined,
      };
      return { mutations };
    });
  }, [mutationId]);

  // Create a result object that matches React Query's UseMutationResult
  return {
    mutate,
    mutateAsync,
    isPending: mutationState.isPending,
    isError: mutationState.isError,
    error: mutationState.error,
    isSuccess: mutationState.isSuccess,
    data: mutationState.data as TResponse,
    reset,
    status: mutationState.isPending
      ? "pending"
      : mutationState.isError
        ? "error"
        : mutationState.isSuccess
          ? "success"
          : "idle",
    variables: undefined,
    failureCount: 0,
    failureReason: null,
    context: undefined,
  };
}
