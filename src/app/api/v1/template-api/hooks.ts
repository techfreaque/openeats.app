import type { ApiFormReturn, ApiQueryFormReturn } from "next-vibe/client";
import { useApiForm, useApiQueryForm } from "next-vibe/client";

import definitions from "./definition";
import type {
  TemplateCreateType,
  TemplatePostRequestUrlParamsType,
  TemplateResponseType,
} from "./schema";

/**
 * Template API hooks
 * This is a reference implementation for API hooks
 */

/**
 * Hook for fetching template resources
 * @param params - Optional parameters for the query
 * @returns Query result with template data
 */
export function useTemplates(params: {
  someInputValue: string;
  someValueFromTheRouteUrl: string;
  enabled?: boolean;
}): ApiQueryFormReturn<
  TemplateCreateType,
  TemplateResponseType,
  TemplatePostRequestUrlParamsType
> {
  return useApiQueryForm(definitions.GET, {
    someValueFromTheRouteUrl: params.someValueFromTheRouteUrl,
  });
}
export type UseTemplatesReturn = ReturnType<typeof useTemplates>;

/**
 * Hook for creating template resources
 * @returns Mutation for creating templates
 */
export function useCreateTemplate(): ApiFormReturn<
  TemplateCreateType,
  TemplateResponseType,
  TemplatePostRequestUrlParamsType
> {
  return useApiForm(definitions.POST);
}
export type UseCreateTemplateReturn = ReturnType<typeof useCreateTemplate>;

/**
 * Hook for updating template resources
 * @returns Mutation for updating templates
 */
export function useUpdateTemplate(): ApiFormReturn<
  TemplateCreateType,
  TemplateResponseType,
  TemplatePostRequestUrlParamsType
> {
  return useApiForm(definitions.PUT);
}
export type UseUpdateTemplateReturn = ReturnType<typeof useUpdateTemplate>;
