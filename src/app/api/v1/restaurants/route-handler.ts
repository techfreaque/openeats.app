import "server-only";

import { dayEnum } from "@/app/api/v1/restaurant/opening-times/db";
import type { ApiHandlerFunction } from "next-vibe/server/endpoints/core/api-handler";
import type { UndefinedType } from "next-vibe/shared/types/common.schema";
import { debugLogger } from "next-vibe/shared/utils/logger";
import { getDayEnumFromDate } from "next-vibe/shared/utils/time";

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
import type {
  RestaurantsResponseType,
  RestaurantsSearchOutputType,
} from "./schema";

/**
 * Gets restaurants based on search criteria with pagination and filtering
 * @param props - API handler props
 * @returns List of restaurants matching search criteria with pagination
 */
export const getRestaurants: ApiHandlerFunction<
  RestaurantsSearchOutputType,
  RestaurantsResponseType,
  UndefinedType
> = async ({ data }) => {
  try {
    debugLogger("Getting restaurants with search criteria", { data });

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
      // Add new filter parameters
      category,
      deliveryType,
      priceRange,
      dietary,
      sortBy,
    } = data;

    // Variables to hold coordinates if we do location-based filtering
    let latitude: number | undefined;
    let longitude: number | undefined;
    let doLocationFiltering = false;

    // Only attempt geocoding if zip is provided
    if (zip) {
      const {
        success: locationSuccess,
        error,
        latitude: lat,
        longitude: lng,
      } = await getCoordinatesFromAddress({
        street: street ?? undefined,
        streetNumber: streetNumber ?? undefined,
        zip,
        country: countryCode,
      });

      if (locationSuccess) {
        latitude = lat;
        longitude = lng;
        doLocationFiltering = true;
      } else {
        // Location lookup failed but we had a zip - return the error
        return {
          success: false,
          message: `Location not found, error: ${error}`,
          errorCode: 404,
        };
      }
    }

    // Build base query conditions with the exact type structure requested
    const where: {
      published: boolean;
      countryId: string;
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
          delivery?: boolean;
          pickup?: boolean;
          mainCategory?: {
            equals: string;
            mode: "insensitive";
          };
          categories?: {
            has: string;
          };
        },
      ];
      rating?: {
        gte: number;
      };
    } = {
      published: true,
      countryId: countryCode,
    };

    // Add name/description search if provided
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    // Add rating filter if provided
    if (rating !== null && rating !== undefined) {
      where.rating = { gte: rating };
    }

    // Build AND conditions while keeping the exact structure
    const andCondition: {
      openingTimes?: {
        some: {
          published: boolean;
          day: Day;
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
      delivery?: boolean;
      pickup?: boolean;
      OR?: Array<Record<string, unknown>>;
    } = {};

    // Filter by current open status if requested
    if (currentlyOpen === true) {
      const now = new Date();
      const dayOfWeek = getDayEnumFromDate(now);
      const currentTime = now.getHours() * 60 + now.getMinutes(); // Convert to minutes since midnight

      andCondition.openingTimes = {
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
      };
    }

    // Add delivery type filter
    if (deliveryType) {
      // Use type-safe comparison
      const deliveryTypeStr = String(deliveryType);
      if (deliveryTypeStr === "delivery") {
        andCondition.delivery = true;
      } else if (deliveryTypeStr === "pickup") {
        andCondition.pickup = true;
      }
    }

    // Add category filter if provided
    if (category) {
      andCondition.OR = [
        { mainCategory: { equals: category, mode: "insensitive" } },
        { categories: { has: category } },
      ];
    }

    // Only set AND if we have conditions to apply
    if (
      Object.keys(andCondition).length > 0 ||
      currentlyOpen === true ||
      deliveryType ||
      category
    ) {
      where.AND = [andCondition];
    }

    // Get all restaurants that match the base criteria
    const allRestaurants = await db.partner.findMany({
      where,
      select: restaurantQuery,
      orderBy:
        sortBy === "rating"
          ? { rating: "desc" }
          : sortBy === "price-low"
            ? { priceLevel: "asc" }
            : sortBy === "price-high"
              ? { priceLevel: "desc" }
              : { rating: "desc" }, // Default to rating for relevance
    });

    debugLogger("Retrieved restaurants from database", {
      count: allRestaurants.length,
    });

    // Apply distance filtering only if we have coordinates
    let restaurantsWithDistanceAndFilters =
      doLocationFiltering && latitude !== undefined && longitude !== undefined
        ? allRestaurants
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
            .filter((restaurant) => restaurant.distance <= (radius ?? 10))
            .sort((a, b) => a.distance - b.distance) // Sort by distance
        : allRestaurants.map((restaurant) => ({
            ...restaurant,
            distance: 0, // Set a default distance
          }));

    // Additional filtering based on dietary preferences
    if (dietary && dietary.length > 0) {
      restaurantsWithDistanceAndFilters =
        restaurantsWithDistanceAndFilters.filter((restaurant) => {
          // Type-safe check for dietaryOptions
          // @ts-expect-error - dietaryOptions might not be defined in the type but exists in the database
          const dietaryOpts = restaurant.dietaryOptions;
          if (!dietaryOpts) {
            return false;
          }

          // Ensure dietaryOptions is an array
          const dietaryOptions = Array.isArray(dietaryOpts) ? dietaryOpts : [];

          // Check if any of the dietary preferences match
          return dietary.some((diet) => {
            const dietStr = String(diet);
            return dietaryOptions.includes(dietStr);
          });
        });
    }

    // Additional filtering based on price range
    if (priceRange && priceRange.length > 0) {
      restaurantsWithDistanceAndFilters =
        restaurantsWithDistanceAndFilters.filter((restaurant) => {
          if (!restaurant.priceLevel) {
            return false;
          }
          const priceLevelStr = String(restaurant.priceLevel);
          return priceRange.includes(priceLevelStr);
        });
    }

    // Apply pagination
    const skip = (page - 1) * limit;
    const paginatedRestaurants = restaurantsWithDistanceAndFilters.slice(
      skip,
      skip + limit,
    );

    // Filter out private data, unpublished opening times, and unpublished menu items
    const filteredRestaurants = paginatedRestaurants.map((restaurant) => {
      // Cast to RestaurantResponseType to ensure type safety
      const typedRestaurant = restaurant as unknown as RestaurantResponseType;
      return filterMenuItems(
        filterOpeningTimes(filterPrivateData(typedRestaurant)),
      );
    });

    debugLogger("Returning filtered restaurants", {
      count: filteredRestaurants.length,
      totalCount: restaurantsWithDistanceAndFilters.length,
      page,
      limit,
    });

    return {
      success: true,
      data: {
        restaurants: filteredRestaurants,
        pagination: {
          total: restaurantsWithDistanceAndFilters.length,
          page,
          limit,
          pages: Math.ceil(restaurantsWithDistanceAndFilters.length / limit),
        },
      },
    };
  } catch (err) {
    const error = err as Error;
    debugLogger("Error fetching restaurants", { error: error.message });
    return {
      success: false,
      message: `Error fetching restaurants: ${error.message}`,
      errorCode: 500,
    };
  }
};
