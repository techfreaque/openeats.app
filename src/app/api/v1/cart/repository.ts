/**
 * Cart repository implementation
 * Provides database access for cart-related operations
 */

import { and, eq } from "drizzle-orm";
import { db } from "next-vibe/server/db";
import { ApiRepositoryImpl } from "next-vibe/server/db/repository-postgres";
import type { DbId } from "next-vibe/server/db/types";

import type { CartItem, NewCartItem } from "./db";
import { cartItems, selectCartItemSchema } from "./db";

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
   * @param notes - Optional notes for the cart item
   */
  upsertCartItem(
    userId: DbId,
    menuItemId: DbId,
    restaurantId: DbId,
    quantity: number,
    notes?: string,
  ): Promise<CartItem>;

  /**
   * Update a cart item quantity
   * @param id - The cart item ID
   * @param quantity - The new quantity
   * @param notes - Optional notes for the cart item
   */
  updateQuantity(
    id: DbId,
    quantity: number,
    notes?: string,
  ): Promise<CartItem | undefined>;

  /**
   * Clear all cart items for a user
   * @param userId - The user ID
   */
  clearCart(userId: DbId): Promise<boolean>;

  /**
   * Get restaurant ID for a user's cart
   * @param userId - The user ID
   * @returns Restaurant ID or null if cart is empty
   */
  getCartRestaurantId(userId: DbId): Promise<string | null>;
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
    super(cartItems, selectCartItemSchema);
  }

  /**
   * Find all cart items for a user
   * @param userId - The user ID
   */
  async findByUserId(userId: DbId): Promise<CartItem[]> {
    const results = await db
      .select()
      .from(cartItems)
      .where(eq(cartItems.userId, userId));

    return results.map((item) => ({
      ...item,
      createdAt: new Date(item.createdAt),
      updatedAt: new Date(item.updatedAt),
    }));
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
    const items = await this.findByUserId(userId);

    return items.map((item) => ({
      ...item,
      menuItem: {
        id: item.menuItemId,
        name: "Loading...",
        description: null,
        price: "0",
        currency: "USD",
        imageUrl: null,
        categoryId: "",
        category: {
          id: "",
          name: "",
          description: null,
        },
      },
      restaurant: {
        id: item.partnerId,
        name: "Loading...",
        imageUrl: null,
        deliveryFee: "0",
        minimumOrderAmount: "0",
      },
    }));
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
   * @param notes - Optional notes for the cart item
   */
  async upsertCartItem(
    userId: DbId,
    menuItemId: DbId,
    restaurantId: DbId,
    quantity: number,
    notes?: string,
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
        notes,
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
        notes,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
  }

  /**
   * Update a cart item quantity
   * @param id - The cart item ID
   * @param quantity - The new quantity
   * @param notes - Optional notes for the cart item
   */
  async updateQuantity(
    id: DbId,
    quantity: number,
    notes?: string,
  ): Promise<CartItem | undefined> {
    return await this.update(id, {
      quantity,
      notes,
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

  /**
   * Get restaurant ID for a user's cart
   * @param userId - The user ID
   * @returns Restaurant ID or null if cart is empty
   */
  async getCartRestaurantId(userId: DbId): Promise<string | null> {
    const result = await db
      .select({ partnerId: cartItems.partnerId })
      .from(cartItems)
      .where(eq(cartItems.userId, userId))
      .limit(1);

    return result.length > 0 && result[0] ? result[0].partnerId : null;
  }
}

/**
 * Cart repository singleton instance
 */
export const cartRepository = new CartRepositoryImpl();
