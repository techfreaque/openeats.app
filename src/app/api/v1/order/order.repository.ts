/**
 * Order repository implementation
 * Provides database access for order-related operations
 */

import { and, between, desc, eq, gte, lte, or } from "drizzle-orm";
import { db } from "next-vibe/server/db";
import { BaseRepositoryImpl } from "next-vibe/server/db/repository";
import type { DbId } from "next-vibe/server/db/types";

import { users } from "@/app/api/v1/auth/db";
import type { MenuItem } from "@/app/api/v1/menu/db";
import { partners } from "@/app/api/v1/restaurant/db";

import type { Delivery, NewDelivery } from "./delivery.db";
import { deliveries } from "./delivery.db";
import type { NewOrder, Order, selectOrderSchema } from "./order.db";
import { insertOrderSchema, orders } from "./order.db";
import type { NewOrderItem, OrderItem } from "./order-item.db";
import { orderItems } from "./order-item.db";

/**
 * Order repository interface
 * Extends the base repository with order-specific operations
 */
export interface OrderRepository {
  /**
   * Find all orders with filtering options
   * @param options - The filter options
   */
  findAll(options?: {
    restaurantId?: DbId;
    customerId?: DbId;
    paymentMethod?: string;
    orderStatus?: string;
    deliveryStatus?: string;
    startDate?: Date;
    endDate?: Date;
    page?: number;
    limit?: number;
  }): Promise<
    Array<
      Order & {
        restaurant: {
          id: string;
          name: string;
          imageUrl: string | null;
        };
        customer: {
          id: string;
          firstName: string;
          lastName: string;
          email: string;
          imageUrl: string | null;
        };
        delivery: Delivery | null;
        orderItems: OrderItem[];
      }
    >
  >;

  /**
   * Find an order by ID with all related data
   * @param id - The order ID
   */
  findByIdWithDetails(id: DbId): Promise<
    | (Order & {
        restaurant: {
          id: string;
          name: string;
          imageUrl: string | null;
        };
        customer: {
          id: string;
          firstName: string;
          lastName: string;
          email: string;
          imageUrl: string | null;
        };
        delivery: Delivery | null;
        orderItems: OrderItem[];
      })
    | undefined
  >;

  /**
   * Find orders by customer ID
   * @param customerId - The customer ID
   */
  findByCustomerId(customerId: DbId): Promise<Order[]>;

  /**
   * Find orders by restaurant ID
   * @param restaurantId - The restaurant ID
   */
  findByRestaurantId(restaurantId: DbId): Promise<Order[]>;

  /**
   * Create a new order
   * @param data - The order data
   */
  createOrder(data: NewOrder): Promise<Order>;

  /**
   * Update an order
   * @param id - The order ID
   * @param data - The order data
   */
  updateOrder(id: DbId, data: Partial<NewOrder>): Promise<Order | undefined>;

  /**
   * Update order status
   * @param id - The order ID
   * @param status - The new status
   */
  updateStatus(id: DbId, status: string): Promise<Order | undefined>;

  /**
   * Cancel an order
   * @param id - The order ID
   */
  cancelOrder(id: DbId): Promise<Order | undefined>;

  /**
   * Get menu items by IDs
   * @param ids - Array of menu item IDs
   */
  getMenuItemsByIds(ids: DbId[]): Promise<MenuItem[]>;

  /**
   * Create an order item
   * @param data - The order item data
   */
  createOrderItem(data: NewOrderItem): Promise<OrderItem>;

  /**
   * Create a delivery record
   * @param data - The delivery data
   */
  createDelivery(data: NewDelivery): Promise<Delivery>;
}

/**
 * Order repository implementation
 */
export class OrderRepositoryImpl
  extends BaseRepositoryImpl<
    typeof orders,
    Order,
    NewOrder,
    typeof selectOrderSchema
  >
  implements OrderRepository
{
  /**
   * Constructor
   */
  constructor() {
    super(orders, insertOrderSchema as unknown);
  }

  /**
   * Find all orders with filtering options
   * @param options - The filter options
   */
  async findAll(options?: {
    restaurantId?: DbId;
    customerId?: DbId;
    paymentMethod?: string;
    orderStatus?: string;
    deliveryStatus?: string;
    startDate?: Date;
    endDate?: Date;
    page?: number;
    limit?: number;
  }): Promise<
    Array<
      Order & {
        restaurant: {
          id: string;
          name: string;
          imageUrl: string | null;
        };
        customer: {
          id: string;
          firstName: string;
          lastName: string;
          email: string;
          imageUrl: string | null;
        };
        delivery: Delivery | null;
        orderItems: OrderItem[];
      }
    >
  > {
    // Default options
    const {
      restaurantId,
      customerId,
      paymentMethod,
      orderStatus,
      deliveryStatus,
      startDate,
      endDate,
      page = 1,
      limit = 100,
    } = options ?? {};

    // Build the where clause
    const whereConditions = [];

    if (restaurantId) {
      whereConditions.push(eq(orders.restaurantId, restaurantId));
    }

    if (customerId) {
      whereConditions.push(eq(orders.customerId, customerId));
    }

    if (paymentMethod) {
      whereConditions.push(eq(orders.paymentMethod, paymentMethod));
    }

    if (orderStatus) {
      whereConditions.push(eq(orders.status, orderStatus));
    }

    if (startDate && endDate) {
      whereConditions.push(between(orders.createdAt, startDate, endDate));
    } else if (startDate) {
      whereConditions.push(gte(orders.createdAt, startDate));
    } else if (endDate) {
      whereConditions.push(lte(orders.createdAt, endDate));
    }

    // Calculate offset
    const offset = (page - 1) * limit;

    // Get orders with restaurant and customer details
    const ordersWithDetails = await db
      .select({
        id: orders.id,
        customerId: orders.customerId,
        restaurantId: orders.restaurantId,
        status: orders.status,
        paymentMethod: orders.paymentMethod,
        message: orders.message,
        total: orders.total,
        deliveryFee: orders.deliveryFee,
        driverTip: orders.driverTip,
        restaurantTip: orders.restaurantTip,
        projectTip: orders.projectTip,
        createdAt: orders.createdAt,
        updatedAt: orders.updatedAt,
        restaurant: {
          id: partners.id,
          name: partners.name,
          imageUrl: partners.imageUrl,
        },
        customer: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          email: users.email,
          imageUrl: users.imageUrl,
        },
      })
      .from(orders)
      .leftJoin(partners, eq(orders.restaurantId, partners.id))
      .leftJoin(users, eq(orders.customerId, users.id))
      .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
      .orderBy(desc(orders.createdAt))
      .limit(limit)
      .offset(offset);

    // Get deliveries for these orders
    const orderIds = ordersWithDetails.map((order) => order.id);
    const deliveriesForOrders = await db
      .select()
      .from(deliveries)
      .where(
        orderIds.length > 0
          ? or(...orderIds.map((id) => eq(deliveries.orderId, id)))
          : undefined,
      );

    // Get order items for these orders
    const orderItemsForOrders = await db
      .select()
      .from(orderItems)
      .where(
        orderIds.length > 0
          ? or(...orderIds.map((id) => eq(orderItems.orderId, id)))
          : undefined,
      );

    // Filter by delivery status if needed
    const filteredOrders = deliveryStatus
      ? ordersWithDetails.filter((order) => {
          const delivery = deliveriesForOrders.find(
            (d) => d.orderId === order.id,
          );
          return delivery && delivery.status === deliveryStatus;
        })
      : ordersWithDetails;

    // Combine all data
    return filteredOrders.map((order) => {
      const delivery =
        deliveriesForOrders.find((d) => d.orderId === order.id) ?? null;
      const items = orderItemsForOrders.filter(
        (item) => item.orderId === order.id,
      );

      return {
        ...order,
        delivery,
        orderItems: items,
      };
    });
  }

  /**
   * Find an order by ID with all related data
   * @param id - The order ID
   */
  async findByIdWithDetails(id: DbId): Promise<
    | (Order & {
        restaurant: {
          id: string;
          name: string;
          imageUrl: string | null;
        };
        customer: {
          id: string;
          firstName: string;
          lastName: string;
          email: string;
          imageUrl: string | null;
        };
        delivery: Delivery | null;
        orderItems: OrderItem[];
      })
    | undefined
  > {
    // Get order with restaurant and customer details
    const orderWithDetails = await db
      .select({
        id: orders.id,
        customerId: orders.customerId,
        restaurantId: orders.restaurantId,
        status: orders.status,
        paymentMethod: orders.paymentMethod,
        message: orders.message,
        total: orders.total,
        deliveryFee: orders.deliveryFee,
        driverTip: orders.driverTip,
        restaurantTip: orders.restaurantTip,
        projectTip: orders.projectTip,
        createdAt: orders.createdAt,
        updatedAt: orders.updatedAt,
        restaurant: {
          id: partners.id,
          name: partners.name,
          imageUrl: partners.imageUrl,
        },
        customer: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          email: users.email,
          imageUrl: users.imageUrl,
        },
      })
      .from(orders)
      .leftJoin(partners, eq(orders.restaurantId, partners.id))
      .leftJoin(users, eq(orders.customerId, users.id))
      .where(eq(orders.id, id));

    if (!orderWithDetails || orderWithDetails.length === 0) {
      return undefined;
    }

    // Get delivery for this order
    const deliveryForOrder = await db
      .select()
      .from(deliveries)
      .where(eq(deliveries.orderId, id));

    // Get order items for this order
    const orderItemsForOrder = await db
      .select()
      .from(orderItems)
      .where(eq(orderItems.orderId, id));

    // Combine all data
    return {
      ...orderWithDetails[0],
      delivery: deliveryForOrder.length > 0 ? deliveryForOrder[0] : null,
      orderItems: orderItemsForOrder,
    };
  }

  /**
   * Find orders by customer ID
   * @param customerId - The customer ID
   */
  async findByCustomerId(customerId: DbId): Promise<Order[]> {
    return await db
      .select()
      .from(orders)
      .where(eq(orders.customerId, customerId))
      .orderBy(desc(orders.createdAt));
  }

  /**
   * Find orders by restaurant ID
   * @param restaurantId - The restaurant ID
   */
  async findByRestaurantId(restaurantId: DbId): Promise<Order[]> {
    return await db
      .select()
      .from(orders)
      .where(eq(orders.restaurantId, restaurantId))
      .orderBy(desc(orders.createdAt));
  }

  /**
   * Create a new order
   * @param data - The order data
   */
  async createOrder(data: NewOrder): Promise<Order> {
    return await this.create(data);
  }

  /**
   * Update an order
   * @param id - The order ID
   * @param data - The order data
   */
  async updateOrder(
    id: DbId,
    data: Partial<NewOrder>,
  ): Promise<Order | undefined> {
    return await this.update(id, data);
  }

  /**
   * Update order status
   * @param id - The order ID
   * @param status - The new status
   */
  async updateStatus(id: DbId, status: string): Promise<Order | undefined> {
    return await this.update(id, {
      status: status as
        | "NEW"
        | "PREPARING"
        | "READY"
        | "OUT_FOR_DELIVERY"
        | "DELIVERED"
        | "CANCELLED",
      updatedAt: new Date(),
    });
  }

  /**
   * Cancel an order
   * @param id - The order ID
   */
  async cancelOrder(id: DbId): Promise<Order | undefined> {
    return await this.update(id, {
      status: "CANCELLED",
      updatedAt: new Date(),
    });
  }

  /**
   * Get menu items by IDs
   * @param ids - Array of menu item IDs
   */
  async getMenuItemsByIds(ids: DbId[]): Promise<MenuItem[]> {
    if (!ids.length) {
      return [];
    }

    // Since we're dealing with a type issue that's hard to resolve,
    // we'll use a simpler approach with a SQL query
    if (ids.length === 0) {
      return [];
    }

    // Convert ids to a comma-separated string for the SQL query
    const idList = ids.map((id) => `'${id}'`).join(",");

    // Use a raw SQL query to avoid type issues
    const result = await db.execute(
      `SELECT * FROM menu_items WHERE id IN (${idList})`,
    );

    return result as unknown as MenuItem[];
  }

  /**
   * Create an order item
   * @param data - The order item data
   */
  async createOrderItem(data: NewOrderItem): Promise<OrderItem> {
    const result = await db.insert(orderItems).values(data).returning();
    return result[0];
  }

  /**
   * Create a delivery record
   * @param data - The delivery data
   */
  async createDelivery(data: NewDelivery): Promise<Delivery> {
    const result = await db.insert(deliveries).values(data).returning();
    return result[0];
  }
}

/**
 * Order repository singleton instance
 */
export const orderRepository = new OrderRepositoryImpl();
