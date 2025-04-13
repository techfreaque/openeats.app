/**
 * Delivery repository implementation
 * Provides database access for delivery-related operations
 */

import { eq } from "drizzle-orm";
import type { DbId } from "next-vibe/server/db/types";

import { db } from "@/app/api/db";
import { ApiRepositoryImpl } from "@/app/api/db/repository";
import { drivers } from "@/app/api/v1/drivers/drivers.db";

import type {
  Delivery,
  NewDelivery,
  selectDeliverySchema,
} from "./delivery.db";
import { deliveries, insertDeliverySchema } from "./delivery.db";

/**
 * Delivery repository interface
 * Extends the base repository with delivery-specific operations
 */
export interface DeliveryRepository {
  /**
   * Find a delivery by order ID
   * @param orderId - The order ID
   */
  findByOrderId(orderId: DbId): Promise<Delivery | undefined>;

  /**
   * Find a delivery by order ID with driver details
   * @param orderId - The order ID
   */
  findByOrderIdWithDriver(orderId: DbId): Promise<
    | (Delivery & {
        driver: {
          id: string;
          userId: string;
          vehicle: string;
          licensePlate: string;
          phone: string;
          rating: string;
        } | null;
      })
    | undefined
  >;

  /**
   * Find deliveries by driver ID
   * @param driverId - The driver ID
   */
  findByDriverId(driverId: DbId): Promise<Delivery[]>;

  /**
   * Create a new delivery
   * @param data - The delivery data
   */
  createDelivery(data: NewDelivery): Promise<Delivery>;

  /**
   * Update a delivery
   * @param id - The delivery ID
   * @param data - The delivery data
   */
  updateDelivery(
    id: DbId,
    data: Partial<NewDelivery>,
  ): Promise<Delivery | undefined>;

  /**
   * Update delivery status
   * @param id - The delivery ID
   * @param status - The new status
   */
  updateStatus(id: DbId, status: string): Promise<Delivery | undefined>;

  /**
   * Assign a driver to a delivery
   * @param id - The delivery ID
   * @param driverId - The driver ID
   */
  assignDriver(id: DbId, driverId: DbId): Promise<Delivery | undefined>;

  /**
   * Mark a delivery as delivered
   * @param id - The delivery ID
   */
  markAsDelivered(id: DbId): Promise<Delivery | undefined>;
}

/**
 * Delivery repository implementation
 */
export class DeliveryRepositoryImpl
  extends ApiRepositoryImpl<
    typeof deliveries,
    Delivery,
    NewDelivery,
    typeof selectDeliverySchema
  >
  implements DeliveryRepository
{
  /**
   * Constructor
   */
  constructor() {
    super(deliveries, insertDeliverySchema);
  }

  /**
   * Find a delivery by order ID
   * @param orderId - The order ID
   */
  async findByOrderId(orderId: DbId): Promise<Delivery | undefined> {
    const results = await db
      .select()
      .from(deliveries)
      .where(eq(deliveries.orderId, orderId));
    return results.length > 0 ? results[0] : undefined;
  }

  /**
   * Find a delivery by order ID with driver details
   * @param orderId - The order ID
   */
  async findByOrderIdWithDriver(orderId: DbId): Promise<
    | (Delivery & {
        driver: {
          id: string;
          userId: string;
          vehicle: string;
          licensePlate: string;
          phone: string;
          rating: string;
        } | null;
      })
    | undefined
  > {
    const results = await db
      .select({
        id: deliveries.id,
        orderId: deliveries.orderId,
        driverId: deliveries.driverId,
        type: deliveries.type,
        status: deliveries.status,
        message: deliveries.message,
        estimatedDeliveryTime: deliveries.estimatedDeliveryTime,
        estimatedPreparationTime: deliveries.estimatedPreparationTime,
        distance: deliveries.distance,
        street: deliveries.street,
        streetNumber: deliveries.streetNumber,
        zip: deliveries.zip,
        city: deliveries.city,
        phone: deliveries.phone,
        latitude: deliveries.latitude,
        longitude: deliveries.longitude,
        countryId: deliveries.countryId,
        estimatedDelivery: deliveries.estimatedDelivery,
        deliveredAt: deliveries.deliveredAt,
        createdAt: deliveries.createdAt,
        updatedAt: deliveries.updatedAt,
        driver: {
          id: drivers.id,
          userId: drivers.userId,
          vehicle: drivers.vehicle,
          licensePlate: drivers.licensePlate,
          phone: drivers.phone,
          rating: drivers.rating,
        },
      })
      .from(deliveries)
      .leftJoin(drivers, eq(deliveries.driverId, drivers.id))
      .where(eq(deliveries.orderId, orderId));

    if (results.length === 0) {
      return undefined;
    }

    const result = results[0];
    return {
      ...result,
      driver: result.driver.id ? result.driver : null,
    };
  }

  /**
   * Find deliveries by driver ID
   * @param driverId - The driver ID
   */
  async findByDriverId(driverId: DbId): Promise<Delivery[]> {
    return await db
      .select()
      .from(deliveries)
      .where(eq(deliveries.driverId, driverId));
  }

  /**
   * Create a new delivery
   * @param data - The delivery data
   */
  async createDelivery(data: NewDelivery): Promise<Delivery> {
    return await this.create(data);
  }

  /**
   * Update a delivery
   * @param id - The delivery ID
   * @param data - The delivery data
   */
  async updateDelivery(
    id: DbId,
    data: Partial<NewDelivery>,
  ): Promise<Delivery | undefined> {
    return await this.update(id, data);
  }

  /**
   * Update delivery status
   * @param id - The delivery ID
   * @param status - The new status
   */
  async updateStatus(id: DbId, status: string): Promise<Delivery | undefined> {
    return await this.update(id, {
      status: status as "ASSIGNED" | "PICKED_UP" | "DELIVERED",
      updatedAt: new Date(),
    });
  }

  /**
   * Assign a driver to a delivery
   * @param id - The delivery ID
   * @param driverId - The driver ID
   */
  async assignDriver(id: DbId, driverId: DbId): Promise<Delivery | undefined> {
    return await this.update(id, {
      driverId,
      status: "ASSIGNED",
      updatedAt: new Date(),
    });
  }

  /**
   * Mark a delivery as delivered
   * @param id - The delivery ID
   */
  async markAsDelivered(id: DbId): Promise<Delivery | undefined> {
    return await this.update(id, {
      status: "DELIVERED",
      deliveredAt: new Date(),
      updatedAt: new Date(),
    });
  }
}

/**
 * Delivery repository singleton instance
 */
export const deliveryRepository = new DeliveryRepositoryImpl();
