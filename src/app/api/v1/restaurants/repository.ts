import { db } from "next-vibe/server/db";
import { errorLogger } from "next-vibe/shared/utils/logger";
import type { JwtPayloadType } from "next-vibe/server/endpoints/auth/jwt";

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
    const mockRestaurants = [
      {
        id: "1",
        name: "Pizza Palace",
        description: "Best pizza in town!",
        image: "/images/restaurants/pizza-palace.jpg",
        rating: 4.8,
        reviewCount: 120,
        priceLevel: 2,
        mainCategory: {
          id: "1",
          name: "Pizza",
          image: "/images/categories/pizza.jpg",
        },
        delivery: true,
        pickup: true,
        dineIn: true,
        street: "Main Street",
        streetNumber: "123",
        city: "New York",
        zip: "10001",
        countryId: "US",
        latitude: 40.7128,
        longitude: -74.006,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "2",
        name: "Burger Joint",
        description: "Juicy burgers and great fries!",
        image: "/images/restaurants/burger-joint.jpg",
        rating: 4.5,
        reviewCount: 95,
        priceLevel: 2,
        mainCategory: {
          id: "2",
          name: "Burgers",
          image: "/images/categories/burgers.jpg",
        },
        delivery: true,
        pickup: true,
        dineIn: false,
        street: "Broadway",
        streetNumber: "456",
        city: "New York",
        zip: "10002",
        countryId: "US",
        latitude: 40.7112,
        longitude: -74.015,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "3",
        name: "Sushi Express",
        description: "Fresh sushi delivered fast!",
        image: "/images/restaurants/sushi-express.jpg",
        rating: 4.9,
        reviewCount: 78,
        priceLevel: 3,
        mainCategory: {
          id: "3",
          name: "Sushi",
          image: "/images/categories/sushi.jpg",
        },
        delivery: true,
        pickup: false,
        dineIn: true,
        street: "5th Avenue",
        streetNumber: "789",
        city: "New York",
        zip: "10003",
        countryId: "US",
        latitude: 40.7306,
        longitude: -73.9352,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    let filteredRestaurants = [...mockRestaurants];

    if (params.search) {
      const searchLower = params.search.toLowerCase();
      filteredRestaurants = filteredRestaurants.filter(
        (restaurant) =>
          restaurant.name.toLowerCase().includes(searchLower) ||
          restaurant.description.toLowerCase().includes(searchLower)
      );
    }

    if (params.countryCode) {
      filteredRestaurants = filteredRestaurants.filter(
        (restaurant) => restaurant.countryId === params.countryCode
      );
    }

    if (params.zip) {
      filteredRestaurants = filteredRestaurants.filter(
        (restaurant) => restaurant.zip === params.zip
      );
    }

    if (params.rating) {
      filteredRestaurants = filteredRestaurants.filter(
        (restaurant) => restaurant.rating >= params.rating
      );
    }

    if (params.category) {
      filteredRestaurants = filteredRestaurants.filter(
        (restaurant) => restaurant.mainCategory.name === params.category
      );
    }

    if (params.deliveryType === "delivery") {
      filteredRestaurants = filteredRestaurants.filter(
        (restaurant) => restaurant.delivery === true
      );
    } else if (params.deliveryType === "pickup") {
      filteredRestaurants = filteredRestaurants.filter(
        (restaurant) => restaurant.pickup === true
      );
    } else if (params.deliveryType === "dine-in") {
      filteredRestaurants = filteredRestaurants.filter(
        (restaurant) => restaurant.dineIn === true
      );
    }

    if (params.priceRange && params.priceRange.length > 0) {
      const priceRanges = params.priceRange.map((range) => range.length);
      filteredRestaurants = filteredRestaurants.filter((restaurant) =>
        priceRanges.includes(restaurant.priceLevel)
      );
    }

    const page = params.page || 1;
    const limit = params.limit || 30;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedRestaurants = filteredRestaurants.slice(startIndex, endIndex);

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
