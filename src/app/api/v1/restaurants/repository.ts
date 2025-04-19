import type { JwtPayloadType } from "next-vibe/server/endpoints/auth/jwt";
import { debugLogger, errorLogger } from "next-vibe/shared/utils/logger";

import { categoryRepository } from "../category/category.repository";
import { restaurantRepository } from "../restaurant/restaurant.repository";
import type { RestaurantsResponseType, RestaurantsSearchType } from "./schema";

/**
 * Search restaurants based on criteria
 * @param params Search parameters
 * @param user Authenticated user (optional)
 * @returns Restaurants matching the search criteria
 */
export async function searchRestaurants(
  params: RestaurantsSearchType,
  user?: JwtPayloadType,
): Promise<RestaurantsResponseType> {
  try {
    debugLogger("Searching restaurants with params:", params);

    // Get all active restaurants from the repository
    const allRestaurants = await restaurantRepository.findAllActive();
    debugLogger(`Found ${allRestaurants.length} active restaurants`);

    // Transform the restaurants to match the expected response format
    const transformedRestaurants = await Promise.all(
      allRestaurants.map(async (restaurant) => {
        // Get the main category for the restaurant if it exists
        let mainCategory = null;
        if (restaurant.mainCategoryId) {
          try {
            const category = await categoryRepository.findById(
              restaurant.mainCategoryId,
            );
            if (category) {
              mainCategory = {
                id: category.id,
                name: category.name,
                image: category.image || "",
              };
            }
          } catch (error) {
            debugLogger(
              `Error fetching category for restaurant ${restaurant.id}:`,
              error,
            );
          }
        }

        return {
          id: restaurant.id,
          name: restaurant.name,
          description: restaurant.description || "",
          image: restaurant.imageUrl || "",
          rating: parseFloat(restaurant.rating) || 0,
          reviewCount: parseInt(restaurant.ratingCount) || 0,
          priceLevel: restaurant.priceLevel || 1,
          mainCategory: mainCategory || {
            id: "0",
            name: "Uncategorized",
            image: "",
          },
          delivery: restaurant.delivery || false,
          pickup: restaurant.pickup || false,
          dineIn: restaurant.dineIn || false,
          street: restaurant.street,
          streetNumber: restaurant.streetNumber,
          city: restaurant.city,
          zip: restaurant.zip,
          countryId: restaurant.country,
          latitude: parseFloat(restaurant.latitude) || 0,
          longitude: parseFloat(restaurant.longitude) || 0,
          createdAt: restaurant.createdAt,
          updatedAt: restaurant.updatedAt,
        };
      }),
    );

    // Apply filters based on search parameters
    let filteredRestaurants = [...transformedRestaurants];

    if (params.search) {
      const searchLower = params.search.toLowerCase();
      filteredRestaurants = filteredRestaurants.filter(
        (restaurant) =>
          restaurant.name.toLowerCase().includes(searchLower) ||
          (restaurant.description &&
            restaurant.description.toLowerCase().includes(searchLower)),
      );
      debugLogger(
        `Filtered by search term "${params.search}": ${filteredRestaurants.length} restaurants remaining`,
      );
    }

    if (params.countryCode) {
      filteredRestaurants = filteredRestaurants.filter(
        (restaurant) => restaurant.countryId === params.countryCode,
      );
      debugLogger(
        `Filtered by country code "${params.countryCode}": ${filteredRestaurants.length} restaurants remaining`,
      );
    }

    if (params.zip) {
      filteredRestaurants = filteredRestaurants.filter(
        (restaurant) => restaurant.zip === params.zip,
      );
      debugLogger(
        `Filtered by zip code "${params.zip}": ${filteredRestaurants.length} restaurants remaining`,
      );
    }

    if (params.rating) {
      filteredRestaurants = filteredRestaurants.filter(
        (restaurant) => restaurant.rating >= params.rating,
      );
      debugLogger(
        `Filtered by minimum rating ${params.rating}: ${filteredRestaurants.length} restaurants remaining`,
      );
    }

    if (params.category) {
      filteredRestaurants = filteredRestaurants.filter(
        (restaurant) =>
          restaurant.mainCategory &&
          restaurant.mainCategory.name === params.category,
      );
      debugLogger(
        `Filtered by category "${params.category}": ${filteredRestaurants.length} restaurants remaining`,
      );
    }

    if (params.deliveryType === "delivery") {
      filteredRestaurants = filteredRestaurants.filter(
        (restaurant) => restaurant.delivery === true,
      );
      debugLogger(
        `Filtered by delivery type "delivery": ${filteredRestaurants.length} restaurants remaining`,
      );
    } else if (params.deliveryType === "pickup") {
      filteredRestaurants = filteredRestaurants.filter(
        (restaurant) => restaurant.pickup === true,
      );
      debugLogger(
        `Filtered by delivery type "pickup": ${filteredRestaurants.length} restaurants remaining`,
      );
    } else if (params.deliveryType === "dine-in") {
      filteredRestaurants = filteredRestaurants.filter(
        (restaurant) => restaurant.dineIn === true,
      );
      debugLogger(
        `Filtered by delivery type "dine-in": ${filteredRestaurants.length} restaurants remaining`,
      );
    }

    if (params.priceRange && params.priceRange.length > 0) {
      const priceRanges = params.priceRange.map((range) => range.length);
      filteredRestaurants = filteredRestaurants.filter((restaurant) =>
        priceRanges.includes(restaurant.priceLevel),
      );
      debugLogger(
        `Filtered by price ranges ${JSON.stringify(priceRanges)}: ${filteredRestaurants.length} restaurants remaining`,
      );
    }

    // Apply pagination
    const page = params.page || 1;
    const limit = params.limit || 30;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedRestaurants = filteredRestaurants.slice(
      startIndex,
      endIndex,
    );

    debugLogger(
      `Returning ${paginatedRestaurants.length} restaurants (page ${page} of ${Math.ceil(filteredRestaurants.length / limit)})`,
    );

    return {
      restaurants: paginatedRestaurants,
      pagination: {
        total: filteredRestaurants.length,
        page,
        limit,
        pages: Math.ceil(filteredRestaurants.length / limit),
      },
    };
  } catch (error) {
    errorLogger("Error searching restaurants:", error);
    throw error;
  }
}
