/**
 * Category repository implementation
 * Provides database access for category-related operations
 */

import { eq, isNull } from "drizzle-orm";

import { db } from "@/app/api/db";
import { BaseRepositoryImpl } from "@/app/api/db/repository";
import type { DbId } from "@/app/api/db/types";

import type { Category, NewCategory, selectCategorySchema } from "./db";
import { categories, insertCategorySchema } from "./db";

/**
 * Category repository interface
 * Extends the base repository with category-specific operations
 */
export interface CategoryRepository {
  /**
   * Find all root categories (categories without a parent)
   */
  findRootCategories(): Promise<Category[]>;

  /**
   * Find all child categories for a parent category
   * @param parentCategoryId - The parent category ID
   */
  findChildCategories(parentCategoryId: DbId): Promise<Category[]>;

  /**
   * Find a category by ID with its parent category
   * @param id - The category ID
   */
  findByIdWithParent(id: DbId): Promise<
    | (Category & {
        parentCategory: Category | null;
      })
    | undefined
  >;

  /**
   * Create a new category
   * @param data - The category data
   */
  createCategory(data: NewCategory): Promise<Category>;

  /**
   * Update a category
   * @param id - The category ID
   * @param data - The category data
   */
  updateCategory(
    id: DbId,
    data: Partial<NewCategory>,
  ): Promise<Category | undefined>;

  /**
   * Delete a category
   * @param id - The category ID
   */
  deleteCategory(id: DbId): Promise<boolean>;

  /**
   * Toggle category published status
   * @param id - The category ID
   * @param published - Whether the category is published
   */
  togglePublished(id: DbId, published: boolean): Promise<Category | undefined>;
}

/**
 * Category repository implementation
 */
export class CategoryRepositoryImpl
  extends BaseRepositoryImpl<
    typeof categories,
    Category,
    NewCategory,
    typeof selectCategorySchema
  >
  implements CategoryRepository
{
  /**
   * Constructor
   */
  constructor() {
    super(categories, insertCategorySchema);
  }

  /**
   * Find all root categories (categories without a parent)
   */
  async findRootCategories(): Promise<Category[]> {
    return await db
      .select()
      .from(categories)
      .where(isNull(categories.parentCategoryId));
  }

  /**
   * Find all child categories for a parent category
   * @param parentCategoryId - The parent category ID
   */
  async findChildCategories(parentCategoryId: DbId): Promise<Category[]> {
    return await db
      .select()
      .from(categories)
      .where(eq(categories.parentCategoryId, parentCategoryId));
  }

  /**
   * Find a category by ID with its parent category
   * @param id - The category ID
   */
  async findByIdWithParent(id: DbId): Promise<
    | (Category & {
        parentCategory: Category | null;
      })
    | undefined
  > {
    const category = await this.findById(id);
    if (!category) {
      return undefined;
    }

    let parentCategory: Category | null = null;
    if (category.parentCategoryId) {
      const parent = await this.findById(category.parentCategoryId);
      if (parent) {
        parentCategory = parent;
      }
    }

    return {
      ...category,
      parentCategory,
    };
  }

  /**
   * Create a new category
   * @param data - The category data
   */
  async createCategory(data: NewCategory): Promise<Category> {
    return await this.create(data);
  }

  /**
   * Update a category
   * @param id - The category ID
   * @param data - The category data
   */
  async updateCategory(
    id: DbId,
    data: Partial<NewCategory>,
  ): Promise<Category | undefined> {
    return await this.update(id, data);
  }

  /**
   * Delete a category
   * @param id - The category ID
   */
  async deleteCategory(id: DbId): Promise<boolean> {
    return await this.delete(id);
  }

  /**
   * Toggle category published status
   * @param id - The category ID
   * @param published - Whether the category is published
   */
  async togglePublished(
    id: DbId,
    published: boolean,
  ): Promise<Category | undefined> {
    return await this.update(id, {
      published,
      updatedAt: new Date(),
    });
  }
}

/**
 * Category repository singleton instance
 */
export const categoryRepository = new CategoryRepositoryImpl();
