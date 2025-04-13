/**
 * Restaurant repository implementation
 * Provides database access for restaurant-related operations
 */

import { and, eq, ilike, or, sql } from "drizzle-orm";
import type { DbId } from "next-vibe/server/db";
import { db } from "next-vibe/server/db";
import { BaseRepositoryImpl } from "next-vibe/server/db/repository";

import type { NewPartner, Partner } from "./db";
import { partners, selectPartnerSchema } from "./db";

/**
 * Restaurant repository interface
 * Extends the base repository with restaurant-specific operations
 */
export interface RestaurantRepository {
  /**
   * Find all active restaurants
   */
  findAllActive(): Promise<Partner[]>;

  /**
   * Find a restaurant by ID
   * @param id - The restaurant ID
   */
  findById(id: DbId): Promise<Partner | undefined>;

  /**
   * Search restaurants
   * @param query - The search query
   * @param limit - The maximum number of results to return
   * @param offset - The number of results to skip
   */
  search(query: string, limit?: number, offset?: number): Promise<Partner[]>;

  /**
   * Find restaurants within a radius
   * @param latitude - The latitude
   * @param longitude - The longitude
   * @param radius - The radius in kilometers
   * @param limit - The maximum number of results to return
   * @param offset - The number of results to skip
   */
  findWithinRadius(
    latitude: number,
    longitude: number,
    radius: number,
    limit?: number,
    offset?: number,
  ): Promise<Partner[]>;

  /**
   * Create a new restaurant
   * @param data - The restaurant data
   */
  createRestaurant(data: NewPartner): Promise<Partner>;

  /**
   * Update a restaurant
   * @param id - The restaurant ID
   * @param data - The restaurant data
   */
  updateRestaurant(
    id: DbId,
    data: Partial<NewPartner>,
  ): Promise<Partner | undefined>;

  /**
   * Delete a restaurant
   * @param id - The restaurant ID
   */
  deleteRestaurant(id: DbId): Promise<boolean>;

  /**
   * Toggle restaurant active status
   * @param id - The restaurant ID
   * @param isActive - Whether the restaurant is active
   */
  toggleActive(id: DbId, isActive: boolean): Promise<Partner | undefined>;

  /**
   * Toggle restaurant open status
   * @param id - The restaurant ID
   * @param isOpen - Whether the restaurant is open
   */
  toggleOpen(id: DbId, isOpen: boolean): Promise<Partner | undefined>;

  /**
   * Update restaurant rating
   * @param id - The restaurant ID
   * @param rating - The new rating
   */
  updateRating(id: DbId, rating: number): Promise<Partner | undefined>;
}

/**
 * Restaurant repository implementation
 */
export class RestaurantRepositoryImpl 
  extends BaseRepositoryImpl<
    typeof partners,
    Partner,
    NewPartner,
    typeof selectPartnerSchema
  >
  implements RestaurantRepository
{
  /**
   * Constructor
   */
  constructor() {
    super(db, partners, selectPartnerSchema, "id");
  }

  /**
   * Find all active restaurants
   */
  async findAllActive(): Promise<Partner[]> {
    return await db.select().from(partners).where(eq(partners.isActive, true));
  }

  /**
   * Search restaurants
   * @param query - The search query
   * @param limit - The maximum number of results to return
   * @param offset - The number of results to skip
   */
  async search(query: string, limit = 10, offset = 0): Promise<Partner[]> {
    return await db
      .select()
      .from(partners)
      .where(
        and(
          or(
            ilike(partners.name, `%${query}%`),
            sql`CASE WHEN ${partners.description} IS NOT NULL THEN ${ilike(partners.description, `%${query}%`)} ELSE FALSE END`,
            ilike(partners.city, `%${query}%`),
          ),
          eq(partners.isActive, true),
        ),
      )
      .limit(limit)
      .offset(offset);
  }

  /**
   * Find restaurants within a radius
   * @param latitude - The latitude
   * @param longitude - The longitude
   * @param radius - The radius in kilometers
   * @param limit - The maximum number of results to return
   * @param offset - The number of results to skip
   */
  async findWithinRadius(
    latitude: number,
    longitude: number,
    radius: number,
    limit = 10,
    offset = 0,
  ): Promise<Partner[]> {
    // This is a simplified implementation that doesn't use geospatial queries
    // In a real-world application, you would use a geospatial database or extension
    const allRestaurants = await this.findAllActive();

    // Filter restaurants within the radius
    const restaurantsWithinRadius = allRestaurants.filter((restaurant) => {
      // Calculate the distance using the Haversine formula
      const distance = this.calculateDistance(
        latitude,
        longitude,
        Number(restaurant.latitude),
        Number(restaurant.longitude),
      );

      // Check if the restaurant is within the radius
      return distance <= radius;
    });

    // Apply limit and offset
    return restaurantsWithinRadius.slice(offset, offset + limit);
  }

  /**
   * Create a new restaurant
   * @param data - The restaurant data
   */
  /**
   * Validate data against the schema
   * @param data - The data to validate
   */
  override validate(data: unknown): Partner {
    return this.schema.parse(data) as Partner;
  }

  /**
   * Find a record by ID
   * @param id - The record ID
   */
  override async findById(id: DbId): Promise<Partner | undefined> {
    return await super.findById(id);
  }

  /**
   * Create a new record
   * @param data - The record data
   */
  override async create(data: NewPartner): Promise<Partner> {
    return await super.create(data);
  }

  /**
   * Update a record
   * @param id - The record ID
   * @param data - The record data
   */
  override async update(id: DbId, data: Partial<NewPartner>): Promise<Partner | undefined> {
    return await super.update(id, data);
  }

  /**
   * Delete a record
   * @param id - The record ID
   */
  override async delete(id: DbId): Promise<boolean> {
    return await super.delete(id);
  }

  async createRestaurant(data: NewPartner): Promise<Partner> {
    return await this.create(data);
  }

  /**
   * Update a restaurant
   * @param id - The restaurant ID
   * @param data - The restaurant data
   */
  async updateRestaurant(
    id: DbId,
    data: Partial<NewPartner>,
  ): Promise<Partner | undefined> {
    return await this.update(id, data);
  }

  /**
   * Delete a restaurant
   * @param id - The restaurant ID
   */
  async deleteRestaurant(id: DbId): Promise<boolean> {
    return await this.delete(id);
  }

  /**
   * Toggle restaurant active status
   * @param id - The restaurant ID
   * @param isActive - Whether the restaurant is active
   */
  async toggleActive(
    id: DbId,
    isActive: boolean,
  ): Promise<Partner | undefined> {
    return await this.update(id, {
      isActive,
      updatedAt: new Date(),
    });
  }

  /**
   * Toggle restaurant open status
   * @param id - The restaurant ID
   * @param isOpen - Whether the restaurant is open
   */
  async toggleOpen(id: DbId, isOpen: boolean): Promise<Partner | undefined> {
    return await this.update(id, {
      isOpen,
      updatedAt: new Date(),
    });
  }

  /**
   * Update restaurant rating
   * @param id - The restaurant ID
   * @param rating - The new rating
   */
  async updateRating(id: DbId, rating: number): Promise<Partner | undefined> {
    // Get the current restaurant
    const restaurant = await this.findById(id);
    if (!restaurant) {
      return undefined;
    }

    // Calculate the new rating
    const newRatingCount = Number(restaurant.ratingCount) + 1;
    const newRating =
      (Number(restaurant.rating) * Number(restaurant.ratingCount) + rating) /
      newRatingCount;

    // Update the restaurant
    return await this.update(id, {
      rating: newRating.toString(),
      ratingCount: newRatingCount.toString(),
      updatedAt: new Date(),
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
 * Restaurant repository singleton instance
 */
export const restaurantRepository = new RestaurantRepositoryImpl();
