import "server-only";

import type { ApiHandlerFunction } from "next-vibe/server/endpoints/core/api-handler";
import { hasRole } from "next-vibe/server/endpoints/data";
import type { UndefinedType } from "next-vibe/shared/types/common.schema";
import { UserRoleValue } from "next-vibe/shared/types/enums";
import { debugLogger } from "next-vibe/shared/utils/logger";

/**
 * Category API route handlers
 * Provides category management functionality
 */
import { db } from "../../db";
import type {
  CategoriesResponseType,
  CategoryCreateType,
  CategoryResponseType,
  CategoryUpdateType,
} from "./schema";

/**
 * Get all categories
 * @param props - API handler props
 * @returns List of categories
 */
export const getCategories: ApiHandlerFunction<
  UndefinedType,
  CategoriesResponseType,
  UndefinedType
> = async ({ user }) => {
  try {
    debugLogger("Getting categories", { userId: user.id });

    // Check user roles to determine if unpublished categories should be included
    const userRoles = await db.userRole.findMany({
      where: { userId: user.id },
    });
    const canGetUnpublished = hasRole(userRoles, UserRoleValue.ADMIN);

    debugLogger("User can view unpublished categories", { canGetUnpublished });

    // Fetch categories based on user permissions
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
        createdAt: true,
        updatedAt: true,
      },
    });

    debugLogger("Retrieved categories", { count: categories.length });

    return {
      success: true,
      data: categories,
    };
  } catch (error) {
    debugLogger("Error getting categories", error);
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Unknown error getting categories",
      errorCode: 500,
    };
  }
};

/**
 * Create a new category
 * @param props - API handler props
 * @returns Created category
 */
export const createCategory: ApiHandlerFunction<
  CategoryCreateType,
  CategoryResponseType,
  UndefinedType
> = async ({ data, user }) => {
  try {
    debugLogger("Creating new category", {
      userId: user.id,
      categoryName: data.name,
      parentCategoryId: data.parentCategoryId,
    });

    // Create the category
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
        createdAt: true,
        updatedAt: true,
      },
    });

    debugLogger("Category created successfully", { categoryId: category.id });

    return {
      success: true,
      data: category,
    };
  } catch (error) {
    debugLogger("Error creating category", error);
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Unknown error creating category",
      errorCode: 500,
    };
  }
};

/**
 * Update an existing category
 * @param props - API handler props
 * @returns Updated category
 */
export const updateCategory: ApiHandlerFunction<
  CategoryUpdateType,
  CategoryResponseType,
  UndefinedType
> = async ({ data, user }) => {
  try {
    debugLogger("Updating category", {
      userId: user.id,
      categoryId: data.id,
      categoryName: data.name,
    });

    // Check if category exists
    const existingCategory = await db.category.findUnique({
      where: { id: data.id },
    });

    if (!existingCategory) {
      debugLogger("Category not found", { categoryId: data.id });
      return {
        success: false,
        message: "Category not found",
        errorCode: 404,
      };
    }

    // Update the category
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
        createdAt: true,
        updatedAt: true,
      },
    });

    debugLogger("Category updated successfully", { categoryId: category.id });

    return {
      success: true,
      data: category,
    };
  } catch (error) {
    debugLogger("Error updating category", error);
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Unknown error updating category",
      errorCode: 500,
    };
  }
};
