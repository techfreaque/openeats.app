"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useMemo } from "react";
import { type FieldValues, useForm } from "react-hook-form";

import { parseError } from "../../../shared/utils/parse-error";
import type { ApiEndpoint } from "../../endpoint";
import type { ApiStore } from "../api-store";
import { useApiStore } from "../api-store";
import type {
  ApiFormOptions,
  ApiFormReturn,
  ApiMutationOptions,
} from "../types";

/**
 * Creates a form integrated with API mutation based on the endpoint's request schema
 * Works with both React and React Native
 *
 * Simplified version that focuses on form functionality and hides implementation details
 */
export function useApiForm<
  TResponse,
  TRequest extends FieldValues = FieldValues,
  TUrlVariables = unknown,
>(
  endpoint: ApiEndpoint<TRequest, TResponse, TUrlVariables>,
  options: ApiFormOptions<TRequest> = {},
  mutationOptions: ApiMutationOptions<TResponse, TRequest> = {},
): ApiFormReturn<TRequest, TResponse, TUrlVariables> {
  // Get Zustand store methods
  const { executeMutation, getMutationId, getFormId } = useApiStore();
  const formId = getFormId(endpoint);
  const mutationId = getMutationId(endpoint);

  // Create memoized selectors to prevent re-renders
  const mutationSelector = useMemo(
    () =>
      (
        state: ApiStore,
      ):
        | {
            isPending: boolean;
            isError: boolean;
            error: Error | null;
            isSuccess: boolean;
            data: unknown;
          }
        | undefined =>
        state.mutations[mutationId],
    [mutationId],
  );

  const formSelector = useMemo(
    () =>
      (
        state: ApiStore,
      ):
        | {
            formError: Error | null;
            isSubmitting: boolean;
          }
        | undefined =>
        state.forms[formId],
    [formId],
  );

  // Extract state from the Zustand store with shallow comparison
  const mutationState = useApiStore(mutationSelector) || {
    isPending: false,
    isError: false,
    error: null,
    isSuccess: false,
    data: undefined,
  };

  const formState = useApiStore(formSelector) || {
    formError: null,
  };

  // Extract store methods for error handling
  const setFormErrorStore = useApiStore((state) => state.setFormError);
  const clearFormErrorStore = useApiStore((state) => state.clearFormError);

  // Create base configuration without resolver
  const formConfig: ApiFormOptions<TRequest> = {
    ...options,
    resolver: zodResolver(endpoint.requestSchema),
  };

  // Initialize form with the proper configuration
  const formMethods = useForm<TRequest>(formConfig);

  // Error management functions
  const clearFormError = useCallback(
    () => clearFormErrorStore(formId),
    [clearFormErrorStore, formId],
  );

  const setError = useCallback(
    (error: Error | null) => setFormErrorStore(formId, error),
    [setFormErrorStore, formId],
  );

  // Create a submit handler that validates and submits the form
  const submitForm = async (
    urlParamVariables?: TUrlVariables,
  ): Promise<TResponse | undefined> => {
    try {
      // Get form data
      const formData = formMethods.getValues();

      // Clear any previous errors
      clearFormError();

      // Call the API with the form data
      const result = await executeMutation(
        endpoint,
        formData as unknown as TRequest,
        urlParamVariables,
        mutationOptions,
      );

      return result;
    } catch (error) {
      // Handle any errors that occur during submission
      const parsedError = parseError(error);
      setError(parsedError);
      return undefined;
    }
  };

  return {
    ...formMethods,
    submitForm,
    isSubmitting: mutationState.isPending,
    isSubmitSuccessful: mutationState.isSuccess,
    submitError: mutationState.error || formState.formError,
    errorMessage:
      mutationState.error?.message || formState.formError?.message || null,
    clearFormError,
    
  };
}
