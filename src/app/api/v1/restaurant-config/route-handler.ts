import "server-only";

import type { ApiHandlerFunction } from "next-vibe/server/endpoints/core/api-handler";
import { hasRole } from "next-vibe/server/endpoints/data";
import type { UndefinedType } from "next-vibe/shared/types/common.schema";
import { UserRoleValue } from "next-vibe/shared/types/enums";
import { debugLogger } from "next-vibe/shared/utils/logger";

import { db } from "../../../../packages/next-vibe/server/db";
import type {
  CategoryCreateType,
  CategoryResponseType,
  CategoryUpdateType,
} from "./schema";

/**
 * Create a new category
 * @param props - API handler props
 * @returns Created category
 */
export const createCategory: ApiHandlerFunction<
  CategoryCreateType,
  CategoryResponseType,
  UndefinedType
> = async ({ data }) => {
  try {
    // Validate data
    if (!data.name || data.name.trim() === "") {
      return {
        success: false,
        message: "Category name is required",
        errorCode: 400,
      };
    }

    if (!data.image?.startsWith("http")) {
      return {
        success: false,
        message: "Valid image URL is required",
        errorCode: 400,
      };
    }

    // Create category in database
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
> = async ({ data }) => {
  try {
    // Validate data
    if (!data.id) {
      return {
        success: false,
        message: "Category ID is required",
        errorCode: 400,
      };
    }

    if (!data.name || data.name.trim() === "") {
      return {
        success: false,
        message: "Category name is required",
        errorCode: 400,
      };
    }

    if (!data.image?.startsWith("http")) {
      return {
        success: false,
        message: "Valid image URL is required",
        errorCode: 400,
      };
    }

    // Check if category exists
    const existingCategory = await db.category.findUnique({
      where: { id: data.id },
    });

    if (!existingCategory) {
      return {
        success: false,
        message: "Category not found",
        errorCode: 404,
      };
    }

    // Update category in database
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

/**
 * Get all categories
 * @param props - API handler props
 * @returns List of categories
 */
export const getCategories: ApiHandlerFunction<
  UndefinedType,
  CategoryResponseType[],
  UndefinedType
> = async ({ user }) => {
  try {
    if (!user?.id) {
      return {
        success: false,
        message: "User authentication required",
        errorCode: 401,
      };
    }

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
      },
      orderBy: {
        name: "asc",
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
