import { and, eq } from "drizzle-orm";
import { nanoid } from "nanoid";

import { db } from "@/app/api/db";
import { Repository } from "next-vibe/server/db/repository";

import { cartItems, insertCartItemSchema, selectCartItemSchema } from "./db";
import { menuItems } from "../menu/db";

/**
 * Repository for cart operations
 */
export class CartRepository extends Repository<
  typeof cartItems,
  typeof selectCartItemSchema,
  typeof insertCartItemSchema
> {
  constructor() {
    super(db, cartItems, selectCartItemSchema, insertCartItemSchema);
  }

  /**
   * Get cart items for a user
   * @param userId User ID
   * @returns Cart items with menu item details
   */
  async getCartItems(userId: string) {
    const result = await db
      .select({
        cartItem: cartItems,
        menuItem: menuItems,
      })
      .from(cartItems)
      .leftJoin(menuItems, eq(cartItems.menuItemId, menuItems.id))
      .where(eq(cartItems.userId, userId));

    return result.map((item) => ({
      ...item.cartItem,
      menuItem: item.menuItem,
    }));
  }

  /**
   * Add an item to the cart
   * @param userId User ID
   * @param menuItemId Menu item ID
   * @param partnerId Restaurant ID
   * @param quantity Quantity
   * @param notes Special instructions
   * @returns Created cart item
   */
  async addCartItem(
    userId: string,
    menuItemId: string,
    partnerId: string,
    quantity: number,
    notes?: string
  ) {
    const existingItem = await db
      .select()
      .from(cartItems)
      .where(
        and(
          eq(cartItems.userId, userId),
          eq(cartItems.menuItemId, menuItemId)
        )
      )
      .limit(1);

    if (existingItem.length > 0) {
      const updatedItem = await db
        .update(cartItems)
        .set({
          quantity: existingItem[0].quantity + quantity,
          notes: notes || existingItem[0].notes,
          updatedAt: new Date(),
        })
        .where(eq(cartItems.id, existingItem[0].id))
        .returning();

      return updatedItem[0];
    }

    const newItem = await db
      .insert(cartItems)
      .values({
        id: nanoid(),
        userId,
        menuItemId,
        partnerId,
        quantity,
        notes,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    return newItem[0];
  }

  /**
   * Update a cart item
   * @param userId User ID
   * @param itemId Cart item ID
   * @param quantity New quantity
   * @param notes New special instructions
   * @returns Updated cart item
   */
  async updateCartItem(
    userId: string,
    itemId: string,
    quantity: number,
    notes?: string
  ) {
    const updatedItem = await db
      .update(cartItems)
      .set({
        quantity,
        notes,
        updatedAt: new Date(),
      })
      .where(and(eq(cartItems.id, itemId), eq(cartItems.userId, userId)))
      .returning();

    return updatedItem[0];
  }

  /**
   * Remove a cart item
   * @param userId User ID
   * @param itemId Cart item ID
   * @returns Deleted cart item
   */
  async removeCartItem(userId: string, itemId: string) {
    const deletedItem = await db
      .delete(cartItems)
      .where(and(eq(cartItems.id, itemId), eq(cartItems.userId, userId)))
      .returning();

    return deletedItem[0];
  }

  /**
   * Clear all cart items for a user
   * @param userId User ID
   * @returns Deleted cart items
   */
  async clearCart(userId: string) {
    const deletedItems = await db
      .delete(cartItems)
      .where(eq(cartItems.userId, userId))
      .returning();

    return deletedItems;
  }

  /**
   * Get restaurant ID for a user's cart
   * @param userId User ID
   * @returns Restaurant ID or null if cart is empty
   */
  async getCartRestaurantId(userId: string) {
    const result = await db
      .select({ partnerId: cartItems.partnerId })
      .from(cartItems)
      .where(eq(cartItems.userId, userId))
      .limit(1);

    return result.length > 0 ? result[0].partnerId : null;
  }
}

export const cartRepository = new CartRepository();
