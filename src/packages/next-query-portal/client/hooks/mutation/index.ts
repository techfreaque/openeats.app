"use client";

import type { UseMutationResult } from "@tanstack/react-query";
import { useCallback, useMemo } from "react";

import type { ApiEndpoint } from "../../endpoint";
import type { ApiStore, MutationStoreType } from "../store";
import { useApiStore } from "../store";
import type { ApiMutationOptions } from "../types";

/**
 * React Query hook for mutation requests (POST, PUT, DELETE, etc.)
 * @param endpoint - The endpoint to call
 * @param options - Mutation options
 * @returns Mutation result
 */
export function useApiMutation<TResponse, TRequest, TUrlVariables, TExampleKey>(
  endpoint: ApiEndpoint<TRequest, TResponse, TUrlVariables, TExampleKey>,
  options: ApiMutationOptions<TRequest, TResponse, TUrlVariables> = {},
): Omit<
  UseMutationResult<
    TResponse,
    Error,
    { requestData: TRequest; urlParams?: TUrlVariables },
    unknown
  >,
  "mutate" | "mutateAsync" | "isIdle" | "isPaused" | "submittedAt"
> & {
  mutateAsync: (variables: {
    requestData: TRequest;
    urlParams: TUrlVariables;
  }) => Promise<TResponse>;
  mutate: (variables: {
    requestData: TRequest;
    urlParams: TUrlVariables;
  }) => void;
} {
  const { executeMutation, getMutationId } = useApiStore();
  const mutationId = getMutationId(endpoint);
  const defaultState: MutationStoreType<TResponse> = {
    data: undefined,
    isPending: true,
    isError: false,
    error: null,
    isSuccess: false,
  };
  const selector = useMemo(
    () =>
      (state: ApiStore): MutationStoreType<TResponse> =>
        (state.mutations[mutationId] as unknown as
          | undefined
          | MutationStoreType<TResponse>) || defaultState,
    // eslint-disable-next-line react-compiler/react-compiler
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [mutationId],
  );
  // Get mutation state from store with shallow comparison
  const mutationState = useApiStore(selector) || {
    isPending: false,
    isError: false,
    error: null,
    isSuccess: false,
    data: undefined,
  };

  // Create a type-safe mutate function that accepts both data and urlParams
  const mutate = useCallback(
    (variables: { requestData: TRequest; urlParams: TUrlVariables }) => {
      void executeMutation(
        endpoint,
        variables.requestData,
        variables.urlParams,
        options,
      );
    },
    [endpoint, options, executeMutation],
  );

  const mutateAsync = useCallback(
    async (variables: {
      requestData: TRequest;
      urlParams: TUrlVariables;
    }): Promise<TResponse> => {
      return executeMutation(
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
  return {
    mutate: mutate,
    mutateAsync: mutateAsync,
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
