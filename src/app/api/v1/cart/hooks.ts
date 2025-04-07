import { useApiQuery } from "next-vibe/client/hooks/query";
import { useApiQueryForm } from "next-vibe/client/hooks/query-form";
import type { UndefinedType } from "next-vibe/shared/types/common.schema";

import endpoints from "./definition";


export type UseCategoriesReturn = ReturnType<typeof useCategories>;
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function useCategories() {
  return useApiQuery<UndefinedType, CategoriesResponseType, UndefinedType>(
    endpoints.GET,
    undefined,
    undefined,
  );
}

export type UseCreateCategoryReturn = ReturnType<typeof useCreateCategory>;
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function useCreateCategory() {
  return useApiQueryForm<
    CategoryCreateType,
    CategoryResponseType,
    UndefinedType
  >(endpoints.POST, undefined);
}

export type UseUpdateCategoryReturn = ReturnType<typeof useUpdateCategory>;
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function useUpdateCategory() {
  return useApiQueryForm<
    CategoryUpdateType,
    CategoryResponseType,
    UndefinedType
  >(endpoints.PUT, undefined);
}
