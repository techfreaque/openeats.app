/**
 * Favorites repository
 * This file contains the database operations for favorites
 */

import { and, eq } from "drizzle-orm";
import { randomUUID } from "crypto";

import { db } from "next-vibe/server/db";
import { ApiRepositoryImpl } from "next-vibe/server/db/repository-postgres";
import { debugLogger } from "next-vibe/shared/utils/logger";

import { favorites, insertFavoriteSchema, Favorite, NewFavorite } from "./db";

/**
 * Favorites repository interface
 * Defines the operations for managing user favorites
 */
export interface FavoritesRepository {
  /**
   * Get user favorites
   * @param userId User ID
   * @returns Array of restaurant IDs
   */
  getUserFavorites(userId: string): Promise<string[]>;

  /**
   * Add restaurant to favorites
   * @param userId User ID
   * @param restaurantId Restaurant ID
   */
  addFavorite(userId: string, restaurantId: string): Promise<void>;

  /**
   * Remove restaurant from favorites
   * @param userId User ID
   * @param restaurantId Restaurant ID
   */
  removeFavorite(userId: string, restaurantId: string): Promise<void>;

  /**
   * Check if restaurant is in user favorites
   * @param userId User ID
   * @param restaurantId Restaurant ID
   * @returns Boolean indicating if restaurant is in favorites
   */
  isFavorite(userId: string, restaurantId: string): Promise<boolean>;
}

/**
 * Favorites repository implementation
 * Handles database operations for user favorites
 */
export class FavoritesRepositoryImpl
  extends ApiRepositoryImpl<
    typeof favorites,
    Favorite,
    NewFavorite,
    typeof insertFavoriteSchema
  >
  implements FavoritesRepository
{
  /**
   * Constructor
   */
  constructor() {
    super(favorites, insertFavoriteSchema, "id");
  }

  /**
   * Get user favorites
   * @param userId User ID
   * @returns Array of restaurant IDs
   */
  async getUserFavorites(userId: string): Promise<string[]> {
    try {
      const results = await db
        .select({ restaurantId: favorites.restaurantId })
        .from(favorites)
        .where(eq(favorites.userId, userId));
      
      return results.map((row) => row.restaurantId);
    } catch (error) {
      debugLogger("Error getting user favorites", error);
      return [];
    }
  }

  /**
   * Add restaurant to favorites
   * @param userId User ID
   * @param restaurantId Restaurant ID
   */
  async addFavorite(userId: string, restaurantId: string): Promise<void> {
    try {
      const existingFavorite = await this.isFavorite(userId, restaurantId);
      
      if (!existingFavorite) {
        await this.create({
          id: randomUUID(),
          userId,
          restaurantId,
          createdAt: new Date(),
        });
      }
    } catch (error) {
      debugLogger("Error adding favorite", error);
      throw error;
    }
  }

  /**
   * Remove restaurant from favorites
   * @param userId User ID
   * @param restaurantId Restaurant ID
   */
  async removeFavorite(userId: string, restaurantId: string): Promise<void> {
    try {
      await db
        .delete(favorites)
        .where(
          and(
            eq(favorites.userId, userId),
            eq(favorites.restaurantId, restaurantId)
          )
        );
    } catch (error) {
      debugLogger("Error removing favorite", error);
      throw error;
    }
  }

  /**
   * Check if restaurant is in user favorites
   * @param userId User ID
   * @param restaurantId Restaurant ID
   * @returns Boolean indicating if restaurant is in favorites
   */
  async isFavorite(userId: string, restaurantId: string): Promise<boolean> {
    try {
      const results = await db
        .select({ id: favorites.id })
        .from(favorites)
        .where(
          and(
            eq(favorites.userId, userId),
            eq(favorites.restaurantId, restaurantId)
          )
        );
      
      return results.length > 0;
    } catch (error) {
      debugLogger("Error checking if restaurant is favorite", error);
      return false;
    }
  }
}

/**
 * Export favorites repository instance
 */
export const favoritesRepository = new FavoritesRepositoryImpl();
