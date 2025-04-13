import type {
  UseApiMutationReturn,
  UseApiQueryReturn,
} from "next-vibe/client/hooks/query";
import { useApiMutation, useApiQuery } from "next-vibe/client/hooks/query";

import definitions from "./definition";

/**
 * Template API hooks
 * This is a reference implementation for API hooks
 */

/**
 * Hook for fetching template resources
 * @param params - Optional parameters for the query
 * @returns Query result with template data
 */
export function useTemplates(params?: {
  someInputValue?: string;
  enabled?: boolean;
}): UseApiQueryReturn {
  return useApiQuery({
    endpoint: definitions.GET,
    payload: params?.someInputValue
      ? { someInputValue: params.someInputValue }
      : undefined,
    urlParams: { someValueFromTheRouteUrl: "" },
    options: {
      enabled: params?.enabled,
    },
  }) as UseApiQueryReturn;
}
export type UseTemplatesReturn = ReturnType<typeof useTemplates>;

/**
 * Hook for creating template resources
 * @returns Mutation for creating templates
 */
export function useCreateTemplate(): UseApiMutationReturn {
  return useApiMutation({
    endpoint: definitions.POST,
    urlParams: { someValueFromTheRouteUrl: "" },
  }) as UseApiMutationReturn;
}
export type UseCreateTemplateReturn = ReturnType<typeof useCreateTemplate>;

/**
 * Hook for updating template resources
 * @returns Mutation for updating templates
 */
export function useUpdateTemplate(): UseApiMutationReturn {
  return useApiMutation({
    endpoint: definitions.PUT,
    urlParams: { someValueFromTheRouteUrl: "" },
  }) as UseApiMutationReturn;
}
export type UseUpdateTemplateReturn = ReturnType<typeof useUpdateTemplate>;
