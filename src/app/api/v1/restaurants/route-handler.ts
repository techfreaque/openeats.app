import type { ApiHandlerCallBackFunctionType } from "next-vibe/server/endpoints/core/api-handler";
import type { UndefinedType } from "next-vibe/shared/types/common.schema";

import {
  calculateDistance,
  getCoordinatesFromAddress,
} from "@/lib/geo/distance";

import { db } from "../../db";
import {
  filterMenuItems,
  filterOpeningTimes,
  filterPrivateData,
  restaurantQuery,
} from "../restaurant/route-handler";
import type { RestaurantResponseType } from "../restaurant/schema/restaurant.schema";
import type { RestaurantsResponseType, RestaurantsSearchType } from "./schema";

/**
 * Gets restaurants based on search criteria with pagination and filtering
 */
export const getRestaurants: ApiHandlerCallBackFunctionType<
  UndefinedType,
  RestaurantsResponseType,
  RestaurantsSearchType
> = async ({ user, urlVariables }) => {
  try {
    const {
      search,
      countryCode,
      zip,
      street,
      streetNumber,
      radius,
      rating,
      currentlyOpen,
      page,
      limit,
    } = urlVariables;

    // First, get coordinates for the search location
    const {
      success: locationSuccess,
      error,
      latitude,
      longitude,
    } = await getCoordinatesFromAddress({
      street: street || undefined,
      streetNumber: streetNumber || undefined,
      zip,
      country: countryCode,
    });

    if (!locationSuccess) {
      return {
        success: false,
        message: `Location not found, error: ${error}`,
        errorCode: 404,
      };
    }

    // Build base query conditions
    const where: {
      published: boolean;
      country: {
        code: string;
      };
      OR?: [
        {
          name: { contains: string; mode: "insensitive" };
        },
        {
          description: { contains: string; mode: "insensitive" };
        },
      ];
      AND?: [
        {
          openingTimes?: {
            some: {
              published: boolean;
              day: number;
              open: {
                lte: number;
              };
              close: {
                gte: number;
              };
              validFrom: {
                lte: Date;
              };
              validTo: {
                gte: Date;
              };
            };
          };
        },
      ];
    } = {
      published: true,
      country: {
        code: countryCode,
      },
    };

    // Add name/description search if provided
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    // Add rating filter if provided
    if (rating !== undefined && rating !== null) {
      where.rating = { gte: rating };
    }

    // Filter by current open status if requested
    // This is complex and requires checking current time against opening hours
    if (currentlyOpen === true) {
      const now = new Date();
      const dayOfWeek = now.getDay(); // 0 is Sunday, 1 is Monday, etc.
      const currentTime = now.getHours() * 60 + now.getMinutes(); // Convert to minutes since midnight

      const openingTimeCondition = {
        openingTimes: {
          some: {
            published: true,
            day: dayOfWeek,
            open: { lte: currentTime },
            close: { gte: currentTime },
            validFrom: {
              lte: now,
            },
            validTo: {
              gte: now,
            },
          },
        },
      };

      // Add this condition to the where clause
      where.AND = [openingTimeCondition];
    }

    // Get all restaurants that match the base criteria
    const allRestaurants = await db.partner.findMany({
      where,
      select: restaurantQuery,
      orderBy: { rating: "desc" },
    });

    // Calculate distance for each restaurant and filter by radius
    const restaurantsWithDistance: RestaurantResponseType[] = allRestaurants
      .map((restaurant) => {
        // Calculate distance in km between search location and restaurant
        const distance = calculateDistance(
          latitude,
          longitude,
          restaurant.latitude,
          restaurant.longitude,
        );
        return { ...restaurant, distance };
      })
      .filter((restaurant) => restaurant.distance <= radius)
      .sort((a, b) => a.distance - b.distance); // Sort by distance

    // Apply pagination
    const skip = (page - 1) * limit;
    const paginatedRestaurants = restaurantsWithDistance.slice(
      skip,
      skip + limit,
    );

    // Filter out private data, unpublished opening times, and unpublished menu items
    const filteredRestaurants = paginatedRestaurants.map((restaurant) => {
      let filtered = filterPrivateData(restaurant);
      filtered = filterOpeningTimes(filtered);
      filtered = filterMenuItems(filtered);
      return filtered;
    });

    return {
      success: true,
      data: {
        restaurants: filteredRestaurants,
        pagination: {
          total: restaurantsWithDistance.length,
          page,
          limit,
          pages: Math.ceil(restaurantsWithDistance.length / limit),
        },
      },
    };
  } catch (err) {
    const error = err as Error;
    return {
      success: false,
      message: `Error fetching restaurants: ${error.message}`,
      errorCode: 500,
    };
  }
};
