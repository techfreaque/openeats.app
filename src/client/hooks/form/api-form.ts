import { zodResolver } from "@hookform/resolvers/zod";
import type { UseMutationResult } from "@tanstack/react-query";
import { useCallback } from "react";
import { useForm } from "react-hook-form";

import type { ApiEndpoint } from "../../../server/endpoints/core/endpoint";
import { parseError } from "../../../shared/utils/parse-error";
import { useApiStore } from "../api-store";
import type {
  ApiFormOptions,
  ApiFormReturn,
  ApiMutationOptions,
} from "../types";

/**
 * Creates a form integrated with API mutation based on the endpoint's request schema
 * Works with both React and React Native
 */
export function useApiForm<TResponse, TRequest, TUrlVariables>(
  endpoint: ApiEndpoint<TRequest, TResponse, TUrlVariables>,
  options: ApiFormOptions<TRequest> = {},
  mutationOptions: ApiMutationOptions<TResponse, TRequest> = {},
): ApiFormReturn<TRequest, TResponse> {
  // Get Zustand store methods
  const { executeMutation, getMutationId, getFormId } = useApiStore();
  const formId = getFormId(endpoint);
  const mutationId = getMutationId(endpoint);

  // Extract the form and mutation state from the store
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

  const formState = useApiStore(
    (state) =>
      state.forms[formId] || {
        formError: null,
        isSubmitting: false,
      },
  );

  const setFormError = useApiStore((state) => state.setFormError);
  const clearFormErrorStore = useApiStore((state) => state.clearFormError);

  // Extract the request schema and create a resolver for React Hook Form
  const requestSchema = endpoint.requestSchema;

  // Initialize the form with zodResolver for validation
  const formMethods = useForm<TRequest>({
    resolver: requestSchema ? zodResolver(requestSchema) : undefined,
    defaultValues: options.defaultValues,
    ...options,
  });

  const clearFormError = useCallback(
    () => clearFormErrorStore(formId),
    [clearFormErrorStore, formId],
  );

  // Create a submit handler that validates and submits the form
  const submitForm = async (data: TRequest): Promise<TResponse | undefined> => {
    clearFormError();
    try {
      return await executeMutation(endpoint, data, undefined, mutationOptions);
    } catch (error) {
      const parsedError = parseError(error);
      setFormError(formId, parsedError);
      return undefined;
    }
  };

  // Create a mock UseMutationResult object that matches React Query's API
  const mutation: UseMutationResult<TResponse, Error, TRequest> = {
    mutate: (data) => {
      void submitForm(data);
    },
    mutateAsync: submitForm,
    isPending: mutationState.isPending,
    isError: mutationState.isError,
    error: mutationState.error,
    isSuccess: mutationState.isSuccess,
    data: mutationState.data as TResponse,
    reset: () => {
      // Reset the mutation state in the store
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
    },
    status: mutationState.isPending
      ? "pending"
      : mutationState.isError
        ? "error"
        : mutationState.isSuccess
          ? "success"
          : "idle",
    variables: undefined as TRequest | undefined,
    failureCount: 0,
    failureReason: null as Error | null,
    context: undefined as unknown,
  };

  // Return combined form methods, mutation, and submission utilities
  return {
    ...formMethods,
    mutation,
    isSubmitting: mutationState.isPending,
    submitForm,
    formError: formState.formError,
    clearFormError,
    setFormError: (error) => setFormError(formId, error),
  };
}
