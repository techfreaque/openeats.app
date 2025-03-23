import type {
  QueryKey,
  UseMutationResult,
  UseQueryOptions,
  UseQueryResult,
} from "@tanstack/react-query";
import type { UseFormProps, UseFormReturn } from "react-hook-form";

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
export interface ApiQueryOptions<TData = unknown, TError = Error>
  extends Omit<
    UseQueryOptions<TData, TError, TData>,
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
  queryKey?: QueryKey; // Custom query key
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
export type ApiFormOptions<TRequest> = Omit<
  UseFormProps<TRequest>,
  "resolver"
> & {
  defaultValues?: Partial<TRequest>;
};

export type ApiFormReturn<TRequest, TResponse> = UseFormReturn<TRequest> & {
  mutation: UseMutationResult<TResponse, Error, TRequest>;
  isSubmitting: boolean;
  submitForm: (data: TRequest) => Promise<TResponse | undefined>;
  formError: Error | null;
  clearFormError: () => void;
  setFormError: (error: Error | null) => void;
};
