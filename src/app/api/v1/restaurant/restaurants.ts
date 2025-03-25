import type {
  RestaurantsResponseType,
  RestaurantsSearchType,
} from "@/client-package/schema/api/v1/restaurant/restaurants.schema";
import {
  calculateDistance,
  getCoordinatesFromAddress,
} from "@/lib/geo/distance";
import type {
  ApiHandlerCallBackProps,
  SafeReturnType,
} from "@/next-portal/api/api-handler";
import { prisma } from "@/next-portal/db";
import type { UndefinedType } from "@/next-portal/types/common.schema";

import {
  filterMenuItems,
  filterOpeningTimes,
  filterPrivateData,
  restaurantQuery,
} from "./restaurant";

/**
 * Gets restaurants based on search criteria with pagination and filtering
 */
export async function getRestaurants({
  user,
  data,
}: ApiHandlerCallBackProps<RestaurantsSearchType, UndefinedType>): Promise<
  SafeReturnType<RestaurantsResponseType>
> {
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
    } = data;

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
    const allRestaurants = await prisma.restaurant.findMany({
      where,
      select: restaurantQuery,
      orderBy: { rating: "desc" },
    });

    // Calculate distance for each restaurant and filter by radius
    const restaurantsWithDistance = allRestaurants
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
}

// /**
//  * Calculates the distance between two points in km using the Haversine formula
//  */
// function calculateDistance(
//   lat1: number,
//   lon1: number,
//   lat2: number,
//   lon2: number,
// ): number {
//   const R = 6371; // Radius of the earth in km
//   const dLat = deg2rad(lat2 - lat1);
//   const dLon = deg2rad(lon1 - lon2);
//   const a =
//     Math.sin(dLat / 2) * Math.sin(dLat / 2) +
//     Math.cos(deg2rad(lat1)) *
//       Math.cos(deg2rad(lat2)) *
//       Math.sin(dLon / 2) *
//       Math.sin(dLon / 2);
//   const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
//   const distance = R * c; // Distance in km
//   return distance;
// }

// function deg2rad(deg: number): number {
//   return deg * (Math.PI / 180);
// }
