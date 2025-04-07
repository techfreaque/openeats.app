import type { ApiHandlerCallBackFunctionType } from "next-vibe/server/endpoints/core/api-handler";
import { hasRole } from "next-vibe/server/endpoints/data";
import type { UndefinedType } from "next-vibe/shared/types/common.schema";
import { UserRoleValue } from "next-vibe/shared/types/enums";

import { db } from "../../db";
import type {
  CategoriesResponseType,
  CategoryCreateType,
  CategoryResponseType,
  CategoryUpdateType,
} from "./schema";

export const getCategories: ApiHandlerCallBackFunctionType<
  UndefinedType,
  CategoriesResponseType,
  UndefinedType
> = async ({ user }) => {
  const userRoles = await db.userRole.findMany({
    where: { userId: user.id },
  });
  const canGetUnpublished = hasRole(userRoles, UserRoleValue.ADMIN);
  const categories = await db.category.findMany({
    ...(canGetUnpublished
      ? {}
      : {
          where: {
            published: true,
          },
        }),
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
    data: categories,
  };
};

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
