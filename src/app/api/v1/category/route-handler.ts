import type { ApiHandlerCallBackFunctionType } from "next-vibe/server/endpoints/core/api-handler";
import type { UndefinedType } from "next-vibe/shared/types/common.schema";

import { db } from "../../db";
import type {
  CategoryCreateType,
  CategoryResponseType,
  CategoryUpdateType,
} from "./schema";

export const createCategory: ApiHandlerCallBackFunctionType<
  CategoryCreateType,
  CategoryResponseType,
  UndefinedType
> = async ({ data }) => {
  const category = await db.category.create({
    data: {
      name: data.name,
      image: data.image,
      parentCategoryId: data.parentCategoryId ?? null,
      published: data.published ?? true,
    },
    select: {
      id: true,
      name: true,
      image: true,
      parentCategoryId: true,
      published: true,
    },
  });

  return {
    success: true,
    data: category,
  };
};

export const updateCategory: ApiHandlerCallBackFunctionType<
  CategoryUpdateType,
  CategoryResponseType,
  UndefinedType
> = async ({ data }) => {
  const category = await db.category.update({
    where: {
      id: data.id,
    },
    data: {
      name: data.name,
      image: data.image,
      parentCategoryId: data.parentCategoryId ?? null,
      published: data.published ?? true,
    },
    select: {
      id: true,
      name: true,
      image: true,
      parentCategoryId: true,
      published: true,
    },
  });

  return {
    success: true,
    data: category,
  };
};
