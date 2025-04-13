/**
 * Menu repository implementation
 * Provides database access for menu-related operations
 */

import { and, eq, ilike, or } from "drizzle-orm";

import { db } from "@/app/api/db";
import { BaseRepositoryImpl } from "@/app/api/db/repository";
import type { DbId } from "@/app/api/db/types";
import { categories } from "@/app/api/v1/category/db";

import type { MenuItem, NewMenuItem, selectMenuItemSchema } from "./db";
import { insertMenuItemSchema, menuItems } from "./db";

/**
 * Menu repository interface
 * Extends the base repository with menu-specific operations
 */
export interface MenuRepository {
  /**
   * Find all menu items for a restaurant
   * @param restaurantId - The restaurant ID
   */
  findByRestaurantId(restaurantId: DbId): Promise<MenuItem[]>;

  /**
   * Find all menu items for a restaurant with category details
   * @param restaurantId - The restaurant ID
   */
  findByRestaurantIdWithCategories(restaurantId: DbId): Promise<
    Array<
      MenuItem & {
        category: {
          id: string;
          name: string;
          description: string | null;
        };
      }
    >
  >;

  /**
   * Find a menu item by ID
   * @param id - The menu item ID
   * @param restaurantId - The restaurant ID
   */
  findByIdAndRestaurantId(
    id: DbId,
    restaurantId: DbId,
  ): Promise<MenuItem | undefined>;

  /**
   * Find a menu item by ID with category details
   * @param id - The menu item ID
   */
  findByIdWithCategory(id: DbId): Promise<
    | (MenuItem & {
        category: {
          id: string;
          name: string;
          description: string | null;
        };
      })
    | undefined
  >;

  /**
   * Search menu items
   * @param query - The search query
   * @param restaurantId - The restaurant ID (optional)
   * @param categoryId - The category ID (optional)
   * @param limit - The maximum number of results to return
   * @param offset - The number of results to skip
   */
  search(
    query: string,
    restaurantId?: DbId,
    categoryId?: DbId,
    limit?: number,
    offset?: number,
  ): Promise<MenuItem[]>;

  /**
   * Search menu items with category details
   * @param query - The search query
   * @param restaurantId - The restaurant ID (optional)
   * @param categoryId - The category ID (optional)
   * @param limit - The maximum number of results to return
   * @param offset - The number of results to skip
   */
  searchWithCategories(
    query: string,
    restaurantId?: DbId,
    categoryId?: DbId,
    limit?: number,
    offset?: number,
  ): Promise<
    Array<
      MenuItem & {
        category: {
          id: string;
          name: string;
          description: string | null;
        };
      }
    >
  >;

  /**
   * Create a new menu item
   * @param data - The menu item data
   */
  createMenuItem(data: NewMenuItem): Promise<MenuItem>;

  /**
   * Update a menu item
   * @param id - The menu item ID
   * @param data - The menu item data
   */
  updateMenuItem(
    id: DbId,
    data: Partial<NewMenuItem>,
  ): Promise<MenuItem | undefined>;

  /**
   * Delete a menu item
   * @param id - The menu item ID
   */
  deleteMenuItem(id: DbId): Promise<boolean>;

  /**
   * Toggle menu item availability
   * @param id - The menu item ID
   * @param isAvailable - Whether the menu item is available
   */
  toggleAvailability(
    id: DbId,
    isAvailable: boolean,
  ): Promise<MenuItem | undefined>;

  /**
   * Toggle menu item published status
   * @param id - The menu item ID
   * @param published - Whether the menu item is published
   */
  togglePublished(id: DbId, published: boolean): Promise<MenuItem | undefined>;
}

/**
 * Menu repository implementation
 */
export class MenuRepositoryImpl
  extends BaseRepositoryImpl<
    typeof menuItems,
    MenuItem,
    NewMenuItem,
    typeof selectMenuItemSchema
  >
  implements MenuRepository
{
  /**
   * Constructor
   */
  constructor() {
    super(menuItems, insertMenuItemSchema);
  }

  /**
   * Find all menu items for a restaurant
   * @param restaurantId - The restaurant ID
   */
  async findByRestaurantId(restaurantId: DbId): Promise<MenuItem[]> {
    return await db
      .select()
      .from(menuItems)
      .where(eq(menuItems.partnerId, restaurantId));
  }

  /**
   * Find all menu items for a restaurant with category details
   * @param restaurantId - The restaurant ID
   */
  async findByRestaurantIdWithCategories(restaurantId: DbId): Promise<
    Array<
      MenuItem & {
        category: {
          id: string;
          name: string;
          description: string | null;
        };
      }
    >
  > {
    const results = await db
      .select({
        id: menuItems.id,
        name: menuItems.name,
        description: menuItems.description,
        price: menuItems.price,
        currency: menuItems.currency,
        imageUrl: menuItems.imageUrl,
        isAvailable: menuItems.isAvailable,
        published: menuItems.published,
        taxPercent: menuItems.taxPercent,
        availableFrom: menuItems.availableFrom,
        availableTo: menuItems.availableTo,
        partnerId: menuItems.partnerId,
        categoryId: menuItems.categoryId,
        createdAt: menuItems.createdAt,
        updatedAt: menuItems.updatedAt,
        category: {
          id: categories.id,
          name: categories.name,
          description: categories.description,
        },
      })
      .from(menuItems)
      .leftJoin(categories, eq(menuItems.categoryId, categories.id))
      .where(eq(menuItems.partnerId, restaurantId));

    return results;
  }

  /**
   * Find a menu item by ID and restaurant ID
   * @param id - The menu item ID
   * @param restaurantId - The restaurant ID
   */
  async findByIdAndRestaurantId(
    id: DbId,
    restaurantId: DbId,
  ): Promise<MenuItem | undefined> {
    const results = await db
      .select()
      .from(menuItems)
      .where(and(eq(menuItems.id, id), eq(menuItems.partnerId, restaurantId)));

    return results.length > 0 ? results[0] : undefined;
  }

  /**
   * Find a menu item by ID with category details
   * @param id - The menu item ID
   */
  async findByIdWithCategory(id: DbId): Promise<
    | (MenuItem & {
        category: {
          id: string;
          name: string;
          description: string | null;
        };
      })
    | undefined
  > {
    const results = await db
      .select({
        id: menuItems.id,
        name: menuItems.name,
        description: menuItems.description,
        price: menuItems.price,
        currency: menuItems.currency,
        imageUrl: menuItems.imageUrl,
        isAvailable: menuItems.isAvailable,
        published: menuItems.published,
        taxPercent: menuItems.taxPercent,
        availableFrom: menuItems.availableFrom,
        availableTo: menuItems.availableTo,
        partnerId: menuItems.partnerId,
        categoryId: menuItems.categoryId,
        createdAt: menuItems.createdAt,
        updatedAt: menuItems.updatedAt,
        category: {
          id: categories.id,
          name: categories.name,
          description: categories.description,
        },
      })
      .from(menuItems)
      .leftJoin(categories, eq(menuItems.categoryId, categories.id))
      .where(eq(menuItems.id, id));

    return results.length > 0 ? results[0] : undefined;
  }

  /**
   * Search menu items
   * @param query - The search query
   * @param restaurantId - The restaurant ID (optional)
   * @param categoryId - The category ID (optional)
   * @param limit - The maximum number of results to return
   * @param offset - The number of results to skip
   */
  async search(
    query: string,
    restaurantId?: DbId,
    categoryId?: DbId,
    limit = 10,
    offset = 0,
  ): Promise<MenuItem[]> {
    let queryBuilder = db
      .select()
      .from(menuItems)
      .where(
        and(
          or(
            ilike(menuItems.name, `%${query}%`),
            ilike(menuItems.description || "", `%${query}%`),
          ),
          eq(menuItems.published, true),
          eq(menuItems.isAvailable, true),
        ),
      );

    if (restaurantId) {
      queryBuilder = queryBuilder.where(eq(menuItems.partnerId, restaurantId));
    }

    if (categoryId) {
      queryBuilder = queryBuilder.where(eq(menuItems.categoryId, categoryId));
    }

    return await queryBuilder.limit(limit).offset(offset);
  }

  /**
   * Search menu items with category details
   * @param query - The search query
   * @param restaurantId - The restaurant ID (optional)
   * @param categoryId - The category ID (optional)
   * @param limit - The maximum number of results to return
   * @param offset - The number of results to skip
   */
  async searchWithCategories(
    query: string,
    restaurantId?: DbId,
    categoryId?: DbId,
    limit = 10,
    offset = 0,
  ): Promise<
    Array<
      MenuItem & {
        category: {
          id: string;
          name: string;
          description: string | null;
        };
      }
    >
  > {
    let queryBuilder = db
      .select({
        id: menuItems.id,
        name: menuItems.name,
        description: menuItems.description,
        price: menuItems.price,
        currency: menuItems.currency,
        imageUrl: menuItems.imageUrl,
        isAvailable: menuItems.isAvailable,
        published: menuItems.published,
        taxPercent: menuItems.taxPercent,
        availableFrom: menuItems.availableFrom,
        availableTo: menuItems.availableTo,
        partnerId: menuItems.partnerId,
        categoryId: menuItems.categoryId,
        createdAt: menuItems.createdAt,
        updatedAt: menuItems.updatedAt,
        category: {
          id: categories.id,
          name: categories.name,
          description: categories.description,
        },
      })
      .from(menuItems)
      .leftJoin(categories, eq(menuItems.categoryId, categories.id))
      .where(
        and(
          or(
            ilike(menuItems.name, `%${query}%`),
            ilike(menuItems.description || "", `%${query}%`),
          ),
          eq(menuItems.published, true),
          eq(menuItems.isAvailable, true),
        ),
      );

    if (restaurantId) {
      queryBuilder = queryBuilder.where(eq(menuItems.partnerId, restaurantId));
    }

    if (categoryId) {
      queryBuilder = queryBuilder.where(eq(menuItems.categoryId, categoryId));
    }

    return await queryBuilder.limit(limit).offset(offset);
  }

  /**
   * Create a new menu item
   * @param data - The menu item data
   */
  async createMenuItem(data: NewMenuItem): Promise<MenuItem> {
    return await this.create(data);
  }

  /**
   * Update a menu item
   * @param id - The menu item ID
   * @param data - The menu item data
   */
  async updateMenuItem(
    id: DbId,
    data: Partial<NewMenuItem>,
  ): Promise<MenuItem | undefined> {
    return await this.update(id, data);
  }

  /**
   * Delete a menu item
   * @param id - The menu item ID
   */
  async deleteMenuItem(id: DbId): Promise<boolean> {
    return await this.delete(id);
  }

  /**
   * Toggle menu item availability
   * @param id - The menu item ID
   * @param isAvailable - Whether the menu item is available
   */
  async toggleAvailability(
    id: DbId,
    isAvailable: boolean,
  ): Promise<MenuItem | undefined> {
    return await this.update(id, {
      isAvailable,
      updatedAt: new Date(),
    });
  }

  /**
   * Toggle menu item published status
   * @param id - The menu item ID
   * @param published - Whether the menu item is published
   */
  async togglePublished(
    id: DbId,
    published: boolean,
  ): Promise<MenuItem | undefined> {
    return await this.update(id, {
      published,
      updatedAt: new Date(),
    });
  }
}

/**
 * Menu repository singleton instance
 */
export const menuRepository = new MenuRepositoryImpl();
