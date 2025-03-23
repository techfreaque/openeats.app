import type {
  DefaultError,
  QueryKey,
  UseQueryOptions,
  UseQueryResult,
} from "@tanstack/react-query";
import type { FieldValues, UseFormProps, UseFormReturn } from "react-hook-form";

/**
 * Enhanced query result with additional loading state info
 */
export type EnhancedQueryResult<
  TResponse,
  TError = unknown,
  TData = TResponse,
> = Omit<UseQueryResult<TData, TError>, "data"> & {
  data: TData;
  isLoadingFresh: boolean;
  isCachedData: boolean;
  statusMessage: string;
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
export interface ApiMutationOptions<TData = unknown, TVariables = unknown> {
  onSuccess?: (data: TData, variables: TVariables) => void | Promise<void>;
  onError?: (error: Error, variables: TVariables) => void | Promise<void>;
  invalidateQueries?: QueryKey | QueryKey[];
  updateQueries?: Array<{
    queryKey: QueryKey;
    updater: <TOldData, TNewData extends TData>(
      oldData: TOldData,
      newData: TNewData,
    ) => TOldData;
  }>;
}

// Form-specific types
export type ApiFormOptions<TRequest extends FieldValues> =
  UseFormProps<TRequest> & {
    defaultValues?: Partial<TRequest>;
  };

export type ApiFormReturn<
  TRequest extends FieldValues,
  TResponse,
  TUrlVariables,
> = UseFormReturn<TRequest> & {
  isSubmitting: boolean;
  isSubmitSuccessful: boolean;
  submitForm: (
    urlParamVariables?: TUrlVariables,
  ) => Promise<TResponse | undefined>;
  formError: Error | null;
  submitError: Error | null;
  clearFormError: () => void;
  setFormError: (error: Error | null) => void;
  errorMessage: string | null;
};
