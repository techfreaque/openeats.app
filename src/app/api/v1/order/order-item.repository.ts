/**
 * Order item repository implementation
 * Provides database access for order item-related operations
 */

import { eq } from "drizzle-orm";
import type { DbId } from "next-vibe/server/db/types";

import { db } from "@/app/api/db";
import { ApiRepositoryImpl } from "@/app/api/db/repository";
import { menuItems } from "@/app/api/v1/menu/db";

import type {
  NewOrderItem,
  OrderItem,
  selectOrderItemSchema,
} from "./order-item.db";
import { insertOrderItemSchema, orderItems } from "./order-item.db";

/**
 * Order item repository interface
 * Extends the base repository with order item-specific operations
 */
export interface OrderItemRepository {
  /**
   * Find all order items for an order
   * @param orderId - The order ID
   */
  findByOrderId(orderId: DbId): Promise<OrderItem[]>;

  /**
   * Find all order items for an order with menu item details
   * @param orderId - The order ID
   */
  findByOrderIdWithMenuItems(orderId: DbId): Promise<
    Array<
      OrderItem & {
        menuItem: {
          id: string;
          name: string;
          description: string | null;
          imageUrl: string | null;
        };
      }
    >
  >;

  /**
   * Create a new order item
   * @param data - The order item data
   */
  createOrderItem(data: NewOrderItem): Promise<OrderItem>;

  /**
   * Create multiple order items
   * @param data - The order items data
   */
  createOrderItems(data: NewOrderItem[]): Promise<OrderItem[]>;

  /**
   * Update an order item
   * @param id - The order item ID
   * @param data - The order item data
   */
  updateOrderItem(
    id: DbId,
    data: Partial<NewOrderItem>,
  ): Promise<OrderItem | undefined>;

  /**
   * Delete an order item
   * @param id - The order item ID
   */
  deleteOrderItem(id: DbId): Promise<boolean>;

  /**
   * Delete all order items for an order
   * @param orderId - The order ID
   */
  deleteByOrderId(orderId: DbId): Promise<boolean>;
}

/**
 * Order item repository implementation
 */
export class OrderItemRepositoryImpl
  extends ApiRepositoryImpl<
    typeof orderItems,
    OrderItem,
    NewOrderItem,
    typeof selectOrderItemSchema
  >
  implements OrderItemRepository
{
  /**
   * Constructor
   */
  constructor() {
    super(orderItems, insertOrderItemSchema);
  }

  /**
   * Find all order items for an order
   * @param orderId - The order ID
   */
  async findByOrderId(orderId: DbId): Promise<OrderItem[]> {
    return await db
      .select()
      .from(orderItems)
      .where(eq(orderItems.orderId, orderId));
  }

  /**
   * Find all order items for an order with menu item details
   * @param orderId - The order ID
   */
  async findByOrderIdWithMenuItems(orderId: DbId): Promise<
    Array<
      OrderItem & {
        menuItem: {
          id: string;
          name: string;
          description: string | null;
          imageUrl: string | null;
        };
      }
    >
  > {
    const results = await db
      .select({
        id: orderItems.id,
        orderId: orderItems.orderId,
        menuItemId: orderItems.menuItemId,
        quantity: orderItems.quantity,
        price: orderItems.price,
        taxPercent: orderItems.taxPercent,
        message: orderItems.message,
        createdAt: orderItems.createdAt,
        updatedAt: orderItems.updatedAt,
        menuItem: {
          id: menuItems.id,
          name: menuItems.name,
          description: menuItems.description,
          imageUrl: menuItems.imageUrl,
        },
      })
      .from(orderItems)
      .leftJoin(menuItems, eq(orderItems.menuItemId, menuItems.id))
      .where(eq(orderItems.orderId, orderId));

    return results;
  }

  /**
   * Create a new order item
   * @param data - The order item data
   */
  async createOrderItem(data: NewOrderItem): Promise<OrderItem> {
    return await this.create(data);
  }

  /**
   * Create multiple order items
   * @param data - The order items data
   */
  async createOrderItems(data: NewOrderItem[]): Promise<OrderItem[]> {
    const results = await db.insert(orderItems).values(data).returning();
    return results;
  }

  /**
   * Update an order item
   * @param id - The order item ID
   * @param data - The order item data
   */
  async updateOrderItem(
    id: DbId,
    data: Partial<NewOrderItem>,
  ): Promise<OrderItem | undefined> {
    return await this.update(id, data);
  }

  /**
   * Delete an order item
   * @param id - The order item ID
   */
  async deleteOrderItem(id: DbId): Promise<boolean> {
    return await this.delete(id);
  }

  /**
   * Delete all order items for an order
   * @param orderId - The order ID
   */
  async deleteByOrderId(orderId: DbId): Promise<boolean> {
    const results = await db
      .delete(orderItems)
      .where(eq(orderItems.orderId, orderId))
      .returning({ id: orderItems.id });

    return results.length > 0;
  }
}

/**
 * Order item repository singleton instance
 */
export const orderItemRepository = new OrderItemRepositoryImpl();
