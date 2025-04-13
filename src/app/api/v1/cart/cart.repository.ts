/**
 * Cart repository implementation
 * Provides database access for cart-related operations
 */

import { and, eq } from "drizzle-orm";
import type { DbId } from "next-vibe/server/db/types";

import { db } from "@/app/api/db";
import { ApiRepositoryImpl } from "@/app/api/db/repository";
import { categories } from "@/app/api/v1/category/db";
import { menuItems } from "@/app/api/v1/menu/db";
import { partners } from "@/app/api/v1/restaurant/db";

import type { CartItem, NewCartItem, selectCartItemSchema } from "./db";
import { cartItems, insertCartItemSchema } from "./db";

/**
 * Cart repository interface
 * Extends the base repository with cart-specific operations
 */
export interface CartRepository {
  /**
   * Find all cart items for a user
   * @param userId - The user ID
   */
  findByUserId(userId: DbId): Promise<CartItem[]>;

  /**
   * Find all cart items for a user with menu item and restaurant details
   * @param userId - The user ID
   */
  findByUserIdWithDetails(userId: DbId): Promise<
    Array<
      CartItem & {
        menuItem: {
          id: string;
          name: string;
          description: string | null;
          price: string;
          currency: string;
          imageUrl: string | null;
          categoryId: string;
          category: {
            id: string;
            name: string;
            description: string | null;
          };
        };
        restaurant: {
          id: string;
          name: string;
          imageUrl: string | null;
          deliveryFee: string;
          minimumOrderAmount: string;
        };
      }
    >
  >;

  /**
   * Find a cart item by ID and user ID
   * @param id - The cart item ID
   * @param userId - The user ID
   */
  findByIdAndUserId(id: DbId, userId: DbId): Promise<CartItem | undefined>;

  /**
   * Find a cart item by menu item ID, restaurant ID, and user ID
   * @param menuItemId - The menu item ID
   * @param restaurantId - The restaurant ID
   * @param userId - The user ID
   */
  findByMenuItemAndRestaurantAndUserId(
    menuItemId: DbId,
    restaurantId: DbId,
    userId: DbId,
  ): Promise<CartItem | undefined>;

  /**
   * Add or update a cart item
   * @param userId - The user ID
   * @param menuItemId - The menu item ID
   * @param restaurantId - The restaurant ID
   * @param quantity - The quantity
   */
  upsertCartItem(
    userId: DbId,
    menuItemId: DbId,
    restaurantId: DbId,
    quantity: number,
  ): Promise<CartItem>;

  /**
   * Update a cart item quantity
   * @param id - The cart item ID
   * @param quantity - The new quantity
   */
  updateQuantity(id: DbId, quantity: number): Promise<CartItem | undefined>;

  /**
   * Clear all cart items for a user
   * @param userId - The user ID
   */
  clearCart(userId: DbId): Promise<boolean>;
}

/**
 * Cart repository implementation
 */
export class CartRepositoryImpl
  extends ApiRepositoryImpl<
    typeof cartItems,
    CartItem,
    NewCartItem,
    typeof selectCartItemSchema
  >
  implements CartRepository
{
  /**
   * Constructor
   */
  constructor() {
    super(cartItems, insertCartItemSchema);
  }

  /**
   * Find all cart items for a user
   * @param userId - The user ID
   */
  async findByUserId(userId: DbId): Promise<CartItem[]> {
    return await db
      .select()
      .from(cartItems)
      .where(eq(cartItems.userId, userId));
  }

  /**
   * Find all cart items for a user with menu item and restaurant details
   * @param userId - The user ID
   */
  async findByUserIdWithDetails(userId: DbId): Promise<
    Array<
      CartItem & {
        menuItem: {
          id: string;
          name: string;
          description: string | null;
          price: string;
          currency: string;
          imageUrl: string | null;
          categoryId: string;
          category: {
            id: string;
            name: string;
            description: string | null;
          };
        };
        restaurant: {
          id: string;
          name: string;
          imageUrl: string | null;
          deliveryFee: string;
          minimumOrderAmount: string;
        };
      }
    >
  > {
    // Define types for the category and database columns
    interface CategoryType {
      id: string;
      name: string;
      description: string;
    }

    // Type assertion for the database columns
    const categoriesTyped = categories as unknown as CategoryType;

    const results = await db
      .select({
        id: cartItems.id,
        userId: cartItems.userId,
        menuItemId: cartItems.menuItemId,
        partnerId: cartItems.partnerId,
        quantity: cartItems.quantity,
        notes: cartItems.notes,
        createdAt: cartItems.createdAt,
        updatedAt: cartItems.updatedAt,
        menuItem: {
          id: menuItems.id,
          name: menuItems.name,
          description: menuItems.description,
          price: menuItems.price,
          currency: menuItems.currency,
          imageUrl: menuItems.imageUrl,
          categoryId: menuItems.categoryId,
          category: {
            id: categoriesTyped.id,
            name: categoriesTyped.name,
            description: categoriesTyped.description,
          },
        },
        restaurant: {
          id: partners.id,
          name: partners.name,
          imageUrl: partners.imageUrl,
          deliveryFee: partners.deliveryFee,
          minimumOrderAmount: partners.minimumOrderAmount,
        },
      })
      .from(cartItems)
      .leftJoin(menuItems, eq(cartItems.menuItemId, menuItems.id))
      .leftJoin(categories, eq(menuItems.categoryId, categoriesTyped.id))
      .leftJoin(partners, eq(cartItems.partnerId, partners.id))
      .where(eq(cartItems.userId, userId as string));

    return results;
  }

  /**
   * Find a cart item by ID and user ID
   * @param id - The cart item ID
   * @param userId - The user ID
   */
  async findByIdAndUserId(
    id: DbId,
    userId: DbId,
  ): Promise<CartItem | undefined> {
    const results = await db
      .select()
      .from(cartItems)
      .where(and(eq(cartItems.id, id), eq(cartItems.userId, userId)));

    return results.length > 0 ? results[0] : undefined;
  }

  /**
   * Find a cart item by menu item ID, restaurant ID, and user ID
   * @param menuItemId - The menu item ID
   * @param restaurantId - The restaurant ID
   * @param userId - The user ID
   */
  async findByMenuItemAndRestaurantAndUserId(
    menuItemId: DbId,
    restaurantId: DbId,
    userId: DbId,
  ): Promise<CartItem | undefined> {
    const results = await db
      .select()
      .from(cartItems)
      .where(
        and(
          eq(cartItems.menuItemId, menuItemId),
          eq(cartItems.partnerId, restaurantId),
          eq(cartItems.userId, userId),
        ),
      );

    return results.length > 0 ? results[0] : undefined;
  }

  /**
   * Add or update a cart item
   * @param userId - The user ID
   * @param menuItemId - The menu item ID
   * @param restaurantId - The restaurant ID
   * @param quantity - The quantity
   */
  async upsertCartItem(
    userId: DbId,
    menuItemId: DbId,
    restaurantId: DbId,
    quantity: number,
  ): Promise<CartItem> {
    // Check if the cart item already exists
    const existingCartItem = await this.findByMenuItemAndRestaurantAndUserId(
      menuItemId,
      restaurantId,
      userId,
    );

    if (existingCartItem) {
      // Update the existing cart item
      const updatedCartItem = await this.update(existingCartItem.id, {
        quantity,
        updatedAt: new Date(),
      });

      if (!updatedCartItem) {
        throw new Error("Failed to update cart item");
      }

      return updatedCartItem;
    } else {
      // Create a new cart item
      return await this.create({
        userId,
        menuItemId,
        partnerId: restaurantId,
        quantity,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
  }

  /**
   * Update a cart item quantity
   * @param id - The cart item ID
   * @param quantity - The new quantity
   */
  async updateQuantity(
    id: DbId,
    quantity: number,
  ): Promise<CartItem | undefined> {
    return await this.update(id, {
      quantity,
      updatedAt: new Date(),
    });
  }

  /**
   * Clear all cart items for a user
   * @param userId - The user ID
   */
  async clearCart(userId: DbId): Promise<boolean> {
    const results = await db
      .delete(cartItems)
      .where(eq(cartItems.userId, userId))
      .returning({ id: cartItems.id });

    return results.length > 0;
  }
}

/**
 * Cart repository singleton instance
 */
export const cartRepository = new CartRepositoryImpl();
