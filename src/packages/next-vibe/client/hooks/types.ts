import type {
  DefaultError,
  QueryKey,
  UseQueryOptions,
} from "@tanstack/react-query";
import type { FormEvent } from "react";
import type { FieldValues, UseFormProps, UseFormReturn } from "react-hook-form";

/**
 * Enhanced query result with additional loading state info
 */
export interface EnhancedQueryResult<TResponse> {
  data: TResponse | undefined;
  error: Error | undefined;
  isLoadingFresh: boolean;
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  isSuccess: boolean;
  isCachedData: boolean;
  statusMessage: string;
  status: "loading" | "success" | "error" | "idle";
  refetch: () => Promise<TResponse>;
  remove: () => void;
}

/**
 * Type for the API query options
 */
export interface ApiQueryOptions<
  TQueryFnData = unknown,
  TError = DefaultError,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
> extends Omit<
    UseQueryOptions<TData, TError, TData, TQueryKey>,
    "queryFn" | "initialData" | "queryKey"
  > {
  queryKey?: QueryKey;
  enabled?: boolean;
  staleTime?: number;
  cacheTime?: number;
  refetchOnWindowFocus?: boolean;
  onSuccess?: (data: TData) => void;
  onError?: (error: TError) => void;
  disableLocalCache?: boolean; // Option to disable local caching
  cacheDuration?: number; // Override default cache duration in ms
  deduplicateRequests?: boolean; // Option to disable request deduplication
  refreshDelay?: number; // Delay for refreshing stale data
  forceRefresh?: boolean; // Force refetch even if data is fresh
  backgroundRefresh?: boolean; // Refresh data in background after returning cached data
}

/**
 * Type for the API mutation options
 */
export interface ApiMutationOptions<TRequest, TResponse, TUrlVariables> {
  onSuccess?: (data: {
    requestData: TRequest;
    pathParams: TUrlVariables;
    responseData: TResponse;
  }) => void | Promise<void>;
  onError?: (data: {
    error: Error;
    requestData: TRequest;
    pathParams: TUrlVariables;
  }) => void | Promise<void>;
  invalidateQueries?: string[]; // List of queries to invalidate after mutation
}

/**
 * Type for the API query form options
 */
export interface ApiQueryFormOptions<TRequest extends FieldValues>
  extends ApiFormOptions<TRequest> {
  autoSubmit?: boolean; // Whether to automatically submit the form when values change
  debounceMs?: number; // Debounce time in ms for auto-submission
}

/**
 * Return type for useApiQueryForm hook combining form and query functionality
 */
export interface ApiQueryFormReturn<
  TRequest extends FieldValues,
  TResponse,
  TUrlVariables,
> extends ApiFormReturn<TRequest, TResponse, TUrlVariables> {
  data: TResponse | undefined;
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  isSuccess: boolean;
  status: "loading" | "success" | "error" | "idle";
  refetch: () => Promise<TResponse>;
}

// Form-specific types
// We force our form types with this
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
export type ApiFormOptions<TRequest extends FieldValues> =
  UseFormProps<TRequest> & {
    defaultValues?: Partial<TRequest>;
  };

export interface ApiFormReturn<TRequest, TResponse, TUrlVariables> {
  form: UseFormReturn<TRequest>;
  isSubmitting: boolean;
  isSubmitSuccessful: boolean;
  submitForm: SubmitFormFunction<TRequest, TResponse, TUrlVariables>;
  submitError: Error | undefined;
  errorMessage: string | undefined;
}

export type SubmitFormFunction<TRequest, TResponse, TUrlVariables> = (
  event: FormEvent<HTMLFormElement> | undefined,
  options: {
    urlParamVariables: TUrlVariables;
    onSuccess?: (data: {
      requestData: TRequest;
      pathParams: TUrlVariables;
      responseData: TResponse;
    }) => void;
    onError?: (error: Error) => void;
  },
) => void;
