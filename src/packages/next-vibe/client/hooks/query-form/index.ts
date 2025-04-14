"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useEffect, useMemo, useRef } from "react";
import type { FieldValues, UseFormProps, UseFormReturn } from "react-hook-form";
import { useForm } from "react-hook-form";

import { parseError } from "../../../shared/utils/parse-error";
import type { ApiEndpoint } from "../../endpoint";
import { useApiQuery } from "../query";
import type { ApiStore } from "../store";
import { useApiStore } from "../store";
import type {
  ApiQueryFormOptions,
  ApiQueryFormReturn,
  ApiQueryOptions,
  SubmitFormFunction,
} from "../types";

/**
 * Creates a form that automatically updates a query based on form values
 * Useful for search forms, filters, and other query parameter-based APIs
 */

/**
 * Creates a form that automatically updates a query based on form values
 * Useful for search forms, filters, and other query parameter-based APIs
 */
export function useApiQueryForm<
  TRequest extends FieldValues,
  TResponse,
  TUrlVariables,
  TExampleKey = "default",
>(
  endpoint: ApiEndpoint<TRequest, TResponse, TUrlVariables, TExampleKey>,
  urlVariables: TUrlVariables,
  formOptions: ApiQueryFormOptions<TRequest> = {},
  queryOptions: ApiQueryOptions<TResponse> = {},
): ApiQueryFormReturn<TRequest, TResponse, TUrlVariables> {
  const {
    autoSubmit = true,
    debounceMs = 500,
    ...restFormOptions
  } = formOptions;

  // Get Zustand store methods
  const { getFormId, setFormQueryParams, getFormQueryParams } = useApiStore();
  const formId = getFormId(endpoint);

  // For query state - use number type instead of NodeJS.Timeout
  const debounceTimerRef = useRef<number | null>(null);

  // Get query params directly from the function, not via a selector
  const queryParams =
    (getFormQueryParams(formId) as TRequest) ?? ({} as TRequest);

  // Create a function to update query params in the store
  const setQueryParams = useCallback(
    (params: TRequest) =>
      setFormQueryParams(formId, params as Record<string, unknown>),
    [formId, setFormQueryParams],
  );

  // Form selectors and state management
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

  const formState = useApiStore(formSelector) ?? {
    formError: null,
    isSubmitting: false,
  };

  // Extract store methods for error handling
  const setFormErrorStore = useApiStore((state) => state.setFormError);
  const clearFormErrorStore = useApiStore((state) => state.clearFormError);

  // Create base form configuration
  const formConfig = {
    ...restFormOptions,
    resolver: zodResolver(endpoint.requestSchema),
  };

  // Initialize form with the proper configuration
  const formMethods = useForm<TRequest>(formConfig as UseFormProps<TRequest>);
  const { watch, getValues } = formMethods;

  // Error management functions
  const clearFormError = useCallback(
    () => clearFormErrorStore(formId),
    [clearFormErrorStore, formId],
  );

  const setError = useCallback(
    (error: Error | null) => setFormErrorStore(formId, error),
    [setFormErrorStore, formId],
  );

  // Use API query with form values as parameters from the store
  const query = useApiQuery(endpoint, queryParams, urlVariables, {
    ...queryOptions,
    enabled: queryOptions.enabled === true,
  });

  // Watch for form changes and update query params
  useEffect(() => {
    if (autoSubmit) {
      const subscription = watch((formData) => {
        if (debounceTimerRef.current) {
          clearTimeout(debounceTimerRef.current);
        }

        debounceTimerRef.current = window.setTimeout(() => {
          if (formData) {
            setQueryParams(formData as TRequest);
          }
        }, debounceMs);
      });

      return (): void => {
        subscription.unsubscribe();
        if (debounceTimerRef.current) {
          clearTimeout(debounceTimerRef.current);
        }
      };
    }
    return;
  }, [watch, autoSubmit, debounceMs, setQueryParams]);

  // Create a submit handler that validates and submits the form
  const submitForm: SubmitFormFunction<TRequest, TResponse, TUrlVariables> = (
    event,
    options,
  ): void => {
    const _submitForm = async (): Promise<void> => {
      try {
        // Get form data
        const formData = getValues();

        // Clear any previous errors
        clearFormError();

        // Update query params immediately
        setQueryParams(formData);

        // Refetch with the new params
        const result = await query.refetch();

        options.onSuccess?.({
          responseData: result,
          pathParams: options.urlParamVariables,
          requestData: formData,
        });
      } catch (error) {
        // Handle any errors that occur during submission
        const parsedError = parseError(error);
        setError(parsedError);
        options.onError?.(parsedError);
      }
    };

    void formMethods.handleSubmit(_submitForm, (errors) =>
      options.onError?.(parseError(errors)),
    )(event);
  };

  return {
    form: formMethods as UseFormReturn<TRequest>,
    submitForm,
    isSubmitting: query.isLoading,
    isSubmitSuccessful: query.isSuccess,
    submitError: query.error ?? formState.formError ?? undefined,
    errorMessage:
      query.error?.message ?? formState.formError?.message ?? undefined,

    // Query-specific properties
    data: query.data,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    isSuccess: query.isSuccess,
    status: query.status,
    refetch: query.refetch,
  };
}
