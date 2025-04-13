"use client";

import type { UseMutationResult } from "@tanstack/react-query";
import { useCallback, useMemo } from "react";

import type { ApiEndpoint } from "../../endpoint";
import type { ApiStore, MutationStoreType } from "../store";
import { useApiStore } from "../store";
import type { ApiMutationOptions } from "../types";

/**
 * Type for mutation variables
 */
export interface MutationVariables<TRequest, TUrlVariables> {
  /**
   * Request data for the API call
   */
  requestData: TRequest;

  /**
   * URL parameters for the API call
   */
  urlParams: TUrlVariables;
}

/**
 * Enhanced mutation result type
 */
export type EnhancedMutationResult<TResponse, TRequest, TUrlVariables> = Omit<
  UseMutationResult<
    TResponse,
    Error,
    MutationVariables<TRequest, TUrlVariables>,
    unknown
  >,
  "mutate" | "mutateAsync" | "isIdle" | "isPaused" | "submittedAt"
> & {
  /**
   * Asynchronously perform the mutation and return a promise
   */
  mutateAsync: (
    variables: MutationVariables<TRequest, TUrlVariables>,
  ) => Promise<TResponse>;

  /**
   * Perform the mutation without waiting for the result
   */
  mutate: (variables: MutationVariables<TRequest, TUrlVariables>) => void;
};

/**
 * React Query hook for mutation requests (POST, PUT, DELETE, etc.)
 * @param endpoint - The endpoint to call
 * @param options - Mutation options
 * @returns Mutation result
 */
export function useApiMutation<TResponse, TRequest, TUrlVariables, TExampleKey>(
  endpoint: ApiEndpoint<TRequest, TResponse, TUrlVariables, TExampleKey>,
  options: ApiMutationOptions<TRequest, TResponse, TUrlVariables> = {},
): EnhancedMutationResult<TResponse, TRequest, TUrlVariables> {
  // Get API store methods
  const { executeMutation, getMutationId } = useApiStore();

  // Get mutation ID
  const mutationId = useMemo(
    () => getMutationId(endpoint),
    [getMutationId, endpoint],
  );

  // Default state for the mutation
  const defaultState: MutationStoreType<TResponse> = useMemo(
    () => ({
      data: undefined,
      isPending: false,
      isError: false,
      error: null,
      isSuccess: false,
    }),
    [],
  );

  // Create a selector function for the store
  const selector = useCallback(
    (state: ApiStore): MutationStoreType<TResponse> => {
      const mutation = state.mutations[mutationId];
      return mutation ? (mutation as MutationStoreType<TResponse>) : defaultState;
    },
    [mutationId, defaultState],
  );

  // Get mutation state from store with shallow comparison
  const mutationState = useApiStore(selector);

  // Create a type-safe mutate function that accepts both data and urlParams
  const mutate = useCallback(
    (variables: MutationVariables<TRequest, TUrlVariables>) => {
      void executeMutation(
        endpoint,
        variables.requestData,
        variables.urlParams,
        options,
      );
    },
    [endpoint, options, executeMutation],
  );

  // Create a type-safe mutateAsync function
  const mutateAsync = useCallback(
    async (
      variables: MutationVariables<TRequest, TUrlVariables>,
    ): Promise<TResponse> => {
      return await executeMutation(
        endpoint,
        variables.requestData,
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
  return useMemo(
    () => ({
      mutate,
      mutateAsync,
      isPending: mutationState.isPending,
      isError: mutationState.isError,
      error: mutationState.error,
      isSuccess: mutationState.isSuccess,
      data: mutationState.data,
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
    }),
    [mutate, mutateAsync, mutationState, reset],
  );
}
