import type {
  DefaultError,
  QueryKey,
  UseQueryOptions,
  UseQueryResult,
} from "@tanstack/react-query";
import type { FormEvent } from "react";
import type { UseFormProps, UseFormReturn } from "react-hook-form";

/**
 * Enhanced query result with additional loading state info
 */
export type EnhancedQueryResult<
  TResponse,
  TError = unknown,
  TData = TResponse,
> = Omit<UseQueryResult<TData, TError>, "data" | "status" | "refetch"> & {
  data: TData;
  isLoadingFresh: boolean;
  isCachedData: boolean;
  statusMessage: string;
  status: "loading" | "success" | "error" | "idle";
  refetch: () => Promise<TResponse>;
};

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
    "queryFn" | "initialData"
  > {
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

// Form-specific types
export type ApiFormOptions<TRequest> = UseFormProps<TRequest> & {
  defaultValues?: Partial<TRequest>;
};

export type ApiFormReturn<TRequest, TResponse, TUrlVariables> = {
  form: UseFormReturn<TRequest>;
  isSubmitting: boolean;
  isSubmitSuccessful: boolean;
  submitForm: SubmitFormFunction<TResponse>;
  submitError: Error | undefined;
  errorMessage: string | undefined;
};

export type SubmitFormFunction<TResponse> = (
  event?: FormEvent<HTMLFormElement>,
  callbacks?: {
    onSuccess?: (data: TResponse) => void;
    onError?: (error: Error) => void;
  },
) => void;
