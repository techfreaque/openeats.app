import { useApiQuery } from "next-vibe/client/hooks/query";
import { useApiQueryForm } from "next-vibe/client/hooks/query-form";

import endpoints from "./definition";
import type {
  TemplateCreateType,
  TemplatePostRequestUrlParamsType,
  TemplateResponseType,
  TemplateUpdateType,
} from "./schema";

/**
 * Template API hooks
 * This is a reference implementation for API hooks
 */

/**
 * Hook for fetching template resources
 * @returns Query result with template data
 */
export function useTemplate(): ReturnType<
  typeof useApiQuery<
    TemplateCreateType,
    TemplateResponseType,
    TemplatePostRequestUrlParamsType
  >
> {
  return useApiQuery<
    TemplateCreateType,
    TemplateResponseType,
    TemplatePostRequestUrlParamsType
  >(endpoints.GET, { someInputValue: "" }, { someValueFromTheRouteUrl: "" });
}
export type UseTemplateReturn = ReturnType<typeof useTemplate>;

/**
 * Hook for creating template resources
 * @returns Form mutation for creating templates
 */
export function useCreateTemplate(): ReturnType<
  typeof useApiQueryForm<
    TemplateCreateType,
    TemplateResponseType,
    TemplatePostRequestUrlParamsType
  >
> {
  return useApiQueryForm<
    TemplateCreateType,
    TemplateResponseType,
    TemplatePostRequestUrlParamsType
  >(endpoints.POST, { someValueFromTheRouteUrl: "" });
}
export type UseCreateTemplateReturn = ReturnType<typeof useCreateTemplate>;

/**
 * Hook for updating template resources
 * @returns Form mutation for updating templates
 */
export function useUpdateTemplate(): ReturnType<
  typeof useApiQueryForm<
    TemplateUpdateType,
    TemplateResponseType,
    TemplatePostRequestUrlParamsType
  >
> {
  return useApiQueryForm<
    TemplateUpdateType,
    TemplateResponseType,
    TemplatePostRequestUrlParamsType
  >(endpoints.PUT, { someValueFromTheRouteUrl: "" });
}
export type UseUpdateTemplateReturn = ReturnType<typeof useUpdateTemplate>;
