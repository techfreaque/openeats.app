import "server-only";

import type { ApiHandlerProps } from "next-vibe/server/endpoints/core/api-handler";
import { hasRole } from "next-vibe/server/endpoints/data";
import type { UndefinedType } from "next-vibe/shared/types/common.schema";
import { UserRoleValue } from "next-vibe/shared/types/enums";
import { debugLogger } from "next-vibe/shared/utils/logger";

import { categoryRepository } from "./category.repository";
import type { Category } from "./db";
import type {
  CategoriesResponseType,
  CategoryCreateType,
  CategoryResponseType,
  CategoryUpdateType,
} from "./schema";

/**
 * Category API route handlers
 * Provides category management functionality
 */

// Define the response type for success and error cases
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errorCode?: number;
}

/**
 * Get all categories
 * @param props - API handler props
 * @returns List of categories
 */
export async function getCategories(
  props: ApiHandlerProps<UndefinedType, UndefinedType>,
): Promise<ApiResponse<CategoriesResponseType>> {
  try {
    const { user } = props;
    debugLogger("Getting categories", { userId: user.id });

    // Check user roles to determine if unpublished categories should be included
    // Type assertion needed because of the strict typing
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const canGetUnpublished = hasRole(user.userRoles, UserRoleValue.ADMIN);
    debugLogger("User can view unpublished categories", { canGetUnpublished });

    // Fetch categories based on user permissions
    let categories: Category[] = [];

    if (canGetUnpublished) {
      // Admin can see all categories
      categories = await categoryRepository.findAll();
    } else {
      // Non-admin can only see published categories
      const allCategories = await categoryRepository.findAll();
      categories = allCategories.filter((category) => category.published);
    }

    // Return success response with categories
    return {
      success: true,
      data: {
        categories,
      },
    };
  } catch (error) {
    debugLogger("Error getting categories", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error",
      errorCode: 500,
    };
  }
}

/**
 * Create a new category
 * @param props - API handler props
 * @returns Created category
 */
export async function createCategory(
  props: ApiHandlerProps<CategoryCreateType, UndefinedType>,
): Promise<ApiResponse<CategoryResponseType>> {
  try {
    const { data, user } = props;
    debugLogger("Creating category", { data, userId: user.id });

    // Validate input data
    if (!data?.name) {
      return {
        success: false,
        message: "Category name is required",
        errorCode: 400,
      };
    }

    // Create the category
    const newCategory = await categoryRepository.createCategory({
      name: data.name,
      description: data.description,
      imageUrl: data.imageUrl,
      parentCategoryId: data.parentCategoryId,
      published: data.published ?? true,
    });

    // Return success response with the created category
    return {
      success: true,
      data: {
        category: newCategory,
      },
    };
  } catch (error) {
    debugLogger("Error creating category", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error",
      errorCode: 500,
    };
  }
}

/**
 * Update a category
 * @param props - API handler props
 * @returns Updated category
 */
export async function updateCategory(
  props: ApiHandlerProps<CategoryUpdateType, { categoryId: string }>,
): Promise<ApiResponse<CategoryResponseType>> {
  try {
    const { data, urlVariables, user } = props;
    debugLogger("Updating category", {
      data,
      categoryId: urlVariables.categoryId,
      userId: user.id,
    });

    // Validate input data
    if (!urlVariables?.categoryId) {
      return {
        success: false,
        message: "Category ID is required",
        errorCode: 400,
      };
    }

    // Check if the category exists
    const existingCategory = await categoryRepository.findById(
      urlVariables.categoryId,
    );
    if (!existingCategory) {
      return {
        success: false,
        message: "Category not found",
        errorCode: 404,
      };
    }

    // Update the category
    const updatedCategory = await categoryRepository.updateCategory(
      urlVariables.categoryId,
      {
        name: data.name,
        description: data.description,
        imageUrl: data.imageUrl,
        parentCategoryId: data.parentCategoryId,
        published: data.published,
        updatedAt: new Date(),
      },
    );

    // Return success response with the updated category
    return {
      success: true,
      data: {
        category: updatedCategory,
      },
    };
  } catch (error) {
    debugLogger("Error updating category", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error",
      errorCode: 500,
    };
  }
}

/**
 * Delete a category
 * @param props - API handler props
 * @returns Success status
 */
export async function deleteCategory(
  props: ApiHandlerProps<UndefinedType, { categoryId: string }>,
): Promise<ApiResponse<{ success: boolean }>> {
  try {
    const { urlVariables, user } = props;
    debugLogger("Deleting category", {
      categoryId: urlVariables.categoryId,
      userId: user.id,
    });

    // Validate input data
    if (!urlVariables?.categoryId) {
      return {
        success: false,
        message: "Category ID is required",
        errorCode: 400,
      };
    }

    // Check if the category exists
    const existingCategory = await categoryRepository.findById(
      urlVariables.categoryId,
    );
    if (!existingCategory) {
      return {
        success: false,
        message: "Category not found",
        errorCode: 404,
      };
    }

    // Delete the category
    const deleted = await categoryRepository.deleteCategory(
      urlVariables.categoryId,
    );

    // Return success response
    return {
      success: deleted,
      data: {
        success: deleted,
      },
      message: deleted
        ? "Category deleted successfully"
        : "Failed to delete category",
    };
  } catch (error) {
    debugLogger("Error deleting category", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error",
      errorCode: 500,
    };
  }
}

/**
 * Toggle category published status
 * @param props - API handler props
 * @returns Updated category
 */
export async function toggleCategoryPublished(
  props: ApiHandlerProps<{ published: boolean }, { categoryId: string }>,
): Promise<ApiResponse<CategoryResponseType>> {
  try {
    const { data, urlVariables, user } = props;
    debugLogger("Toggling category published status", {
      categoryId: urlVariables.categoryId,
      published: data.published,
      userId: user.id,
    });

    // Validate input data
    if (!urlVariables?.categoryId) {
      return {
        success: false,
        message: "Category ID is required",
        errorCode: 400,
      };
    }

    if (data.published === undefined) {
      return {
        success: false,
        message: "Published status is required",
        errorCode: 400,
      };
    }

    // Check if the category exists
    const existingCategory = await categoryRepository.findById(
      urlVariables.categoryId,
    );
    if (!existingCategory) {
      return {
        success: false,
        message: "Category not found",
        errorCode: 404,
      };
    }

    // Toggle the published status
    const updatedCategory = await categoryRepository.togglePublished(
      urlVariables.categoryId,
      data.published,
    );

    // Return success response with the updated category
    return {
      success: true,
      data: {
        category: updatedCategory,
      },
    };
  } catch (error) {
    debugLogger("Error toggling category published status", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error",
      errorCode: 500,
    };
  }
}
