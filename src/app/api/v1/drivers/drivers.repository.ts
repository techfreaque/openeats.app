/**
 * Driver repository implementation
 * Provides database access for driver-related operations
 */

import { eq } from "drizzle-orm";

import { db } from "@/app/api/db";
import { BaseRepositoryImpl } from "@/app/api/db/repository";
import type { DbId } from "@/app/api/db/types";
import { users } from "@/app/api/v1/auth/me/users.db";

import type { Driver, NewDriver, selectDriverSchema } from "./drivers.db";
import { drivers, insertDriverSchema } from "./drivers.db";

/**
 * Driver repository interface
 * Extends the base repository with driver-specific operations
 */
export interface DriverRepository {
  /**
   * Find a driver by user ID
   * @param userId - The user ID
   */
  findByUserId(userId: DbId): Promise<Driver | undefined>;

  /**
   * Find all drivers with their user information
   */
  findAllWithUsers(): Promise<
    Array<
      Driver & {
        user: {
          id: string;
          firstName: string;
          lastName: string;
          email: string;
          imageUrl?: string;
        };
      }
    >
  >;

  /**
   * Find a driver with user information
   * @param driverId - The driver ID
   */
  findWithUser(driverId: DbId): Promise<
    | (Driver & {
        user: {
          id: string;
          firstName: string;
          lastName: string;
          email: string;
          imageUrl?: string;
        };
      })
    | undefined
  >;

  /**
   * Check if a driver exists for a user
   * @param userId - The user ID
   */
  existsByUserId(userId: DbId): Promise<boolean>;

  /**
   * Update a driver's location
   * @param driverId - The driver ID
   * @param latitude - The latitude
   * @param longitude - The longitude
   */
  updateLocation(
    driverId: DbId,
    latitude: number,
    longitude: number,
  ): Promise<Driver | undefined>;

  /**
   * Update a driver's rating
   * @param driverId - The driver ID
   * @param rating - The new rating
   */
  updateRating(driverId: DbId, rating: number): Promise<Driver | undefined>;

  /**
   * Find drivers within a radius
   * @param latitude - The latitude
   * @param longitude - The longitude
   * @param radius - The radius in kilometers
   */
  findWithinRadius(
    latitude: number,
    longitude: number,
    radius: number,
  ): Promise<Driver[]>;
}

/**
 * Driver repository implementation
 */
export class DriverRepositoryImpl
  extends BaseRepositoryImpl<
    typeof drivers,
    Driver,
    NewDriver,
    typeof selectDriverSchema
  >
  implements DriverRepository
{
  /**
   * Constructor
   */
  constructor() {
    super(drivers, insertDriverSchema);
  }

  /**
   * Find a driver by user ID
   * @param userId - The user ID
   */
  async findByUserId(userId: DbId): Promise<Driver | undefined> {
    const results = await db
      .select()
      .from(drivers)
      .where(eq(drivers.userId, userId));

    return results.length > 0 ? results[0] : undefined;
  }

  /**
   * Find all drivers with their user information
   */
  async findAllWithUsers(): Promise<
    Array<
      Driver & {
        user: {
          id: string;
          firstName: string;
          lastName: string;
          email: string;
          imageUrl?: string;
        };
      }
    >
  > {
    const results = await db
      .select({
        id: drivers.id,
        userId: drivers.userId,
        isActive: drivers.isActive,
        vehicle: drivers.vehicle,
        licensePlate: drivers.licensePlate,
        radius: drivers.radius,
        latitude: drivers.latitude,
        longitude: drivers.longitude,
        phone: drivers.phone,
        street: drivers.street,
        streetNumber: drivers.streetNumber,
        zip: drivers.zip,
        city: drivers.city,
        countryId: drivers.countryId,
        rating: drivers.rating,
        ratingRecent: drivers.ratingRecent,
        ratingCount: drivers.ratingCount,
        createdAt: drivers.createdAt,
        updatedAt: drivers.updatedAt,
        user: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          email: users.email,
          imageUrl: users.imageUrl,
        },
      })
      .from(drivers)
      .leftJoin(users, eq(drivers.userId, users.id));

    return results;
  }

  /**
   * Find a driver with user information
   * @param driverId - The driver ID
   */
  async findWithUser(driverId: DbId): Promise<
    | (Driver & {
        user: {
          id: string;
          firstName: string;
          lastName: string;
          email: string;
          imageUrl?: string;
        };
      })
    | undefined
  > {
    const results = await db
      .select({
        id: drivers.id,
        userId: drivers.userId,
        isActive: drivers.isActive,
        vehicle: drivers.vehicle,
        licensePlate: drivers.licensePlate,
        radius: drivers.radius,
        latitude: drivers.latitude,
        longitude: drivers.longitude,
        phone: drivers.phone,
        street: drivers.street,
        streetNumber: drivers.streetNumber,
        zip: drivers.zip,
        city: drivers.city,
        countryId: drivers.countryId,
        rating: drivers.rating,
        ratingRecent: drivers.ratingRecent,
        ratingCount: drivers.ratingCount,
        createdAt: drivers.createdAt,
        updatedAt: drivers.updatedAt,
        user: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          email: users.email,
          imageUrl: users.imageUrl,
        },
      })
      .from(drivers)
      .leftJoin(users, eq(drivers.userId, users.id))
      .where(eq(drivers.id, driverId));

    return results.length > 0 ? results[0] : undefined;
  }

  /**
   * Check if a driver exists for a user
   * @param userId - The user ID
   */
  async existsByUserId(userId: DbId): Promise<boolean> {
    const driver = await this.findByUserId(userId);
    return !!driver;
  }

  /**
   * Update a driver's location
   * @param driverId - The driver ID
   * @param latitude - The latitude
   * @param longitude - The longitude
   */
  async updateLocation(
    driverId: DbId,
    latitude: number,
    longitude: number,
  ): Promise<Driver | undefined> {
    return await this.update(driverId, {
      latitude,
      longitude,
      updatedAt: new Date(),
    });
  }

  /**
   * Update a driver's rating
   * @param driverId - The driver ID
   * @param rating - The new rating
   */
  async updateRating(
    driverId: DbId,
    rating: number,
  ): Promise<Driver | undefined> {
    // Get the current driver
    const driver = await this.findById(driverId);
    if (!driver) {
      return undefined;
    }

    // Calculate the new rating
    const newRatingCount = driver.ratingCount + 1;
    const newRating =
      (driver.rating * driver.ratingCount + rating) / newRatingCount;

    // Update the driver
    return await this.update(driverId, {
      rating: newRating,
      ratingCount: newRatingCount,
      updatedAt: new Date(),
    });
  }

  /**
   * Find drivers within a radius
   * @param latitude - The latitude
   * @param longitude - The longitude
   * @param radius - The radius in kilometers
   */
  async findWithinRadius(
    latitude: number,
    longitude: number,
    radius: number,
  ): Promise<Driver[]> {
    // This is a simplified implementation that doesn't use geospatial queries
    // In a real-world application, you would use a geospatial database or extension
    const allDrivers = await this.findAll();

    // Filter drivers within the radius
    return allDrivers.filter((driver) => {
      // Calculate the distance using the Haversine formula
      const distance = this.calculateDistance(
        latitude,
        longitude,
        Number(driver.latitude),
        Number(driver.longitude),
      );

      // Check if the driver is within the radius
      return distance <= radius;
    });
  }

  /**
   * Calculate the distance between two points using the Haversine formula
   * @param lat1 - The latitude of the first point
   * @param lon1 - The longitude of the first point
   * @param lat2 - The latitude of the second point
   * @param lon2 - The longitude of the second point
   * @returns The distance in kilometers
   */
  private calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) *
        Math.cos(this.deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in kilometers
    return distance;
  }

  /**
   * Convert degrees to radians
   * @param deg - The degrees
   * @returns The radians
   */
  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }
}

/**
 * Driver repository singleton instance
 */
export const driverRepository = new DriverRepositoryImpl();
