import "server-only";

import type { DbId } from "next-vibe/server/db/types";
import type {
  ApiHandlerProps,
  ApiHandlerResult,
} from "next-vibe/server/endpoints/core/api-handler";
import { hasRole } from "next-vibe/server/endpoints/data";
import type { UndefinedType } from "next-vibe/shared/types/common.schema";
import { UserRoleValue } from "next-vibe/shared/types/enums";
import type { UserRoleResponseType } from "next-vibe/shared/types/user-roles.schema";
import { debugLogger, errorLogger } from "next-vibe/shared/utils/logger";

import { getCoordinatesFromAddress } from "@/lib/geo/distance";
import type { Countries } from "@/translations";

import { userRolesRepository } from "../auth/repository";
import { restaurantRepository } from "./restaurant.repository";
import type {
  RestaurantCreateType,
  RestaurantResponseType,
  RestaurantSearchType,
  RestaurantUpdateType,
} from "./schema/restaurant.schema";

/**
 * Restaurant API route handlers
 * Provides restaurant management functionality
 */
/**
 * Helper function to fetch and process restaurant data
 * @param restaurantId - ID of the restaurant to fetch
 * @param userId - ID of the user making the request
 * @returns Restaurant data with access information
 */
async function fetchRestaurantById(
  restaurantId: DbId,
  userId: DbId,
): Promise<
  ApiHandlerResult<{
    restaurant: RestaurantResponseType;
    userRoles: UserRoleResponseType[];
    hasAccess: boolean;
  }>
> {
  debugLogger("Fetching restaurant by ID", { restaurantId, userId });

  // Get restaurant
  const restaurant = await restaurantRepository.findById(restaurantId);

  if (!restaurant) {
    debugLogger("Restaurant not found", { restaurantId });
    return {
      success: false,
      message: "Restaurant not found",
      errorCode: 404,
      data: {
        restaurant: {
          name: "",
          description: "",
          street: "",
          streetNumber: "",
          zip: "",
          city: "",
          phone: "",
          email: "",
          image: "",
          published: false,
          delivery: false,
          pickup: false,
          dineIn: false,
          priceLevel: "",
          countryId: "DE" as Countries,
          mainCategory: { id: "", name: "", image: "" },
          id: "",
          orderCount: 0,
          rating: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
          openingTimes: [],
          menuItems: [],
          verified: false,
          latitude: 0,
          longitude: 0,
        },
        userRoles: [],
        hasAccess: false,
      },
    } as unknown as ApiHandlerResult<{
      restaurant: RestaurantResponseType;
      userRoles: UserRoleResponseType[];
      hasAccess: boolean;
    }>;
  }

  // Get user roles
  const userRoles = await userRolesRepository.findByUserId(userId);

  const hasAccess =
    hasRole(userRoles, UserRoleValue.PARTNER_ADMIN, restaurant.id) ||
    hasRole(userRoles, UserRoleValue.PARTNER_EMPLOYEE, restaurant.id) ||
    hasRole(userRoles, UserRoleValue.ADMIN);

  debugLogger("Restaurant fetched successfully", {
    restaurantId,
    hasAccess,
    roleCount: userRoles.length,
  });

  // Process restaurant data to match expected type
  const processedRestaurant = {
    ...restaurant,
    menuItems: Array.isArray((restaurant as any).menuItems)
      ? (restaurant as any).menuItems.map((item: any) => ({
          ...item,
          isAvailable: item.isAvailable ?? true,
          currency: item.currency ?? "EUR",
        }))
      : [],
    countryId: ((restaurant as any).country ??
      (restaurant as any).countryId) as unknown as Countries,
  };

  return {
    success: true,
    data: {
      restaurant: processedRestaurant as unknown as RestaurantResponseType,
      userRoles,
      hasAccess,
    },
  };
}

/**
 * Create a new restaurant
 * @param props - API handler props
 * @returns Created restaurant
 */
export const createRestaurant = async ({ user, data }: ApiHandlerProps<RestaurantCreateType, undefined>) => {
  try {
    debugLogger("Creating restaurant", {
      userId: user.id,
      restaurantName: data.name,
    });

    // Check if user has admin role
    const userRoles = await userRolesRepository.findByUserId(user.id);

    if (!hasRole(userRoles, UserRoleValue.CUSTOMER)) {
      debugLogger("Unauthorized to create restaurant", { userId: user.id });
      return {
        success: false,
        message: "Unauthorized to create restaurant",
        errorCode: 403,
      };
    }

    let hasLocationError = false;
    const { error, latitude, longitude } =
      await getCoordinatesFromAddress(data);
    if (error) {
      debugLogger("Error getting coordinates", error);
      hasLocationError = true;
    }

    // Create restaurant using the repository
    const restaurantData = {
      name: data.name,
      description: data.description,
      published: false,
      email: data.email,
      latitude: latitude ?? 0,
      longitude: longitude ?? 0,
      street: data.street,
      streetNumber: data.streetNumber,
      phone: data.phone,
      city: data.city,
      zip: data.zip,
      countryId: data.countryId,
      priceLevel: Number(data.priceLevel),
      verified: false,
      delivery: data.delivery,
      dineIn: data.dineIn,
      pickup: data.pickup,
      orderCount: 0,
      rating: 0,
      image: data.image,
      mainCategoryId: data.mainCategoryId,
    };

    const restaurant =
      await restaurantRepository.createRestaurant(restaurantData as any);

    debugLogger("Restaurant created", { restaurantId: restaurant.id });

    // Create user role for creator
    await userRolesRepository.create({
      userId: user.id,
      partnerId: restaurant.id,
      role: UserRoleValue.PARTNER_ADMIN,
    });

    debugLogger("User role created for restaurant creator", {
      userId: user.id,
      restaurantId: restaurant.id,
      role: UserRoleValue.PARTNER_ADMIN,
    });

    if (hasLocationError) {
      return {
        data: restaurant,
        success: true,
        message:
          "Restaurant created, but location could not be determined. Please update the address, or get in touch with support.",
        errorCode: 400,
      };
    }

    // Process menu items to add required fields
    const processedRestaurant = {
      ...restaurant,
      menuItems: Array.isArray((restaurant as any).menuItems)
        ? (restaurant as any).menuItems.map((item: any) => ({
            ...item,
            isAvailable: item.isAvailable ?? true,
            currency: item.currency ?? "EUR",
          }))
        : [],
      countryId: ((restaurant as any).country ??
        (restaurant as any).countryId) as unknown as Countries,
    };

    return {
      data: processedRestaurant as unknown as RestaurantResponseType,
      success: true,
    };
  } catch (err) {
    const error = err as Error;
    errorLogger("Error creating restaurant", error);
    return {
      success: false,
      message: `Error creating restaurant: ${error instanceof Error ? error.message : "Unknown error"}`,
      errorCode: 500,
    };
  }
};

/**
 * Update an existing restaurant
 * @param props - API handler props
 * @returns Updated restaurant
 */
export const updateRestaurant = async ({ user, data: requestData }: ApiHandlerProps<RestaurantUpdateType, undefined>) => {
  try {
    debugLogger("Updating restaurant", {
      userId: user.id,
      restaurantId: requestData.id,
    });

    const result = await fetchRestaurantById(requestData.id, user.id);

    if (!result.success) {
      return {
        success: false,
        message: "Restaurant not found",
        errorCode: 404,
      };
    }

    const { data } = result;

    if (!data.hasAccess) {
      debugLogger("Unauthorized to update restaurant", {
        userId: user.id,
        restaurantId: requestData.id,
      });
      return {
        success: false,
        message: "Unauthorized to update restaurant",
        errorCode: 403,
      };
    }

    let hasLocationError = false;
    const {
      success: locationSuccess,
      error,
      latitude,
      longitude,
    } = await getCoordinatesFromAddress(requestData);

    if (!locationSuccess) {
      debugLogger("Error getting coordinates", error);
      hasLocationError = true;
    }

    // Update the restaurant using the repository
    const restaurantData = {
      name: requestData.name,
      description: requestData.description,
      published: requestData.published,
      email: requestData.email,
      latitude: latitude ?? 0,
      longitude: longitude ?? 0,
      street: requestData.street,
      streetNumber: requestData.streetNumber,
      phone: requestData.phone,
      city: requestData.city,
      zip: requestData.zip,
      countryId: requestData.countryId,
      image: requestData.image,
      mainCategoryId: requestData.mainCategoryId,
    };

    const updatedRestaurant = await restaurantRepository.updateRestaurant(
      requestData.id,
      restaurantData as any,
    );

    debugLogger("Restaurant updated", {
      restaurantId: updatedRestaurant?.id || requestData.id,
    });

    if (hasLocationError) {
      return {
        data: updatedRestaurant,
        success: true,
        message:
          "Restaurant updated, but location could not be determined. Please update the address, or get in touch with support.",
        errorCode: 400,
      };
    }

    // Process menu items to add required fields
    const processedRestaurant = {
      ...(updatedRestaurant || {}),
      menuItems:
        updatedRestaurant && Array.isArray((updatedRestaurant as any).menuItems)
          ? (updatedRestaurant as any).menuItems.map((item: any) => ({
              ...item,
              isAvailable: item.isAvailable ?? true,
              currency: item.currency ?? "EUR",
            }))
          : [],
      countryId: updatedRestaurant
        ? ((updatedRestaurant.country ||
            (updatedRestaurant as any).countryId) as unknown as Countries)
        : ("DE" as Countries),
    };

    return {
      data: processedRestaurant as unknown as RestaurantResponseType,
      success: true,
    };
  } catch (err) {
    const error = err as Error;
    errorLogger("Error updating restaurant", error);
    return {
      success: false,
      message: `Error updating restaurant: ${error instanceof Error ? error.message : "Unknown error"}`,
      errorCode: 500,
    };
  }
};

export const restaurantQuery = {
  id: true,
  name: true,
  description: true,
  published: true,
  email: true,
  latitude: true,
  longitude: true,
  street: true,
  streetNumber: true,
  rating: true,
  delivery: true,
  pickup: true,
  dineIn: true,
  verified: true,
  priceLevel: true,
  updatedAt: true,
  phone: true,
  city: true,
  zip: true,
  countryId: true,
  image: true,
  createdAt: true,
  orderCount: true,
  menuItems: {
    select: {
      id: true,
      name: true,
      description: true,
      price: true,
      image: true,
      taxPercent: true,
      published: true,
      availableFrom: true,
      availableTo: true,
      createdAt: true,
      updatedAt: true,
      isAvailable: true,
      currency: true,
      category: {
        select: {
          id: true,
          name: true,
          image: true,
          published: true,
        },
      },
    },
  },
  mainCategory: {
    select: {
      id: true,
      name: true,
      image: true,
      published: true,
      parentCategoryId: true,
      createdAt: true,
      updatedAt: true,
    },
  },
  openingTimes: {
    select: {
      id: true,
      published: true,
      day: true,
      open: true,
      close: true,
      validFrom: true,
      validTo: true,
      restaurantId: true,
    },
  },
  userRoles: {
    select: {
      role: true,
      userId: true,
      partnerId: true,
    },
  },
};

/**
 * Get a restaurant by ID
 * @param props - API handler props
 * @returns Restaurant data
 */
export const getRestaurant = async ({ user, data }: ApiHandlerProps<{ restaurantId: string }, undefined>) => {
  try {
    debugLogger("Getting restaurant", {
      userId: user.id,
      restaurantId: data.restaurantId,
    });

    const result = await fetchRestaurantById(data.restaurantId, user.id);

    if (!result.success) {
      return {
        success: false,
        message: "Restaurant not found",
        errorCode: 404,
      };
    }

    const { data: restaurantData } = result;

    if (
      restaurantData.restaurant.published === false &&
      !restaurantData.hasAccess
    ) {
      // Only the restaurant owner or admin can view unpublished restaurants
      debugLogger("Unauthorized to view unpublished restaurant", {
        userId: user.id,
        restaurantId: data.restaurantId,
      });
      return {
        success: false,
        message: "Unauthorized",
        errorCode: 403,
      };
    }

    // Apply filters for non-privileged users
    let filteredRestaurant = restaurantData.restaurant;

    if (!restaurantData.hasAccess) {
      debugLogger("Applying filters for non-privileged user", {
        userId: user.id,
      });
      filteredRestaurant = filterPrivateData(filteredRestaurant);
      filteredRestaurant = filterOpeningTimes(filteredRestaurant);
      filteredRestaurant = filterMenuItems(filteredRestaurant);
    }

    debugLogger("Restaurant retrieved successfully", {
      restaurantId: data.restaurantId,
      menuItemCount: filteredRestaurant.menuItems.length,
      openingTimesCount: filteredRestaurant.openingTimes.length,
    });

    // Process menu items to add required fields
    const processedRestaurant = {
      ...filteredRestaurant,
      menuItems: filteredRestaurant.menuItems.map((item) => ({
        ...item,
        isAvailable: item.isAvailable ?? true,
        currency: item.currency ?? "EUR",
      })),
      countryId: filteredRestaurant.countryId as unknown as Countries,
    };

    return {
      data: processedRestaurant as unknown as RestaurantResponseType,
      success: true,
    };
  } catch (err) {
    const error = err as Error;
    errorLogger("Error getting restaurant", error);
    return {
      success: false,
      message: `Error getting restaurant: ${error instanceof Error ? error.message : "Unknown error"}`,
      errorCode: 500,
    };
  }
};

/**
 * Helper function to remove userRoles from restaurant data
 * @param restaurant - Restaurant data to filter
 * @returns Filtered restaurant data without private information
 */
export function filterPrivateData(
  restaurant: RestaurantResponseType,
): RestaurantResponseType {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { userRoles, ...filteredRestaurant } = restaurant;
  return filteredRestaurant;
}

/**
 * Helper function to filter out unpublished or invalid opening times
 * @param restaurant - Restaurant data to filter
 * @returns Filtered restaurant data with only valid opening times
 */
export function filterOpeningTimes(
  restaurant: RestaurantResponseType,
): RestaurantResponseType {
  const currentDate = new Date();
  const filteredOpeningTimes = restaurant.openingTimes.filter((time) => {
    // Keep only published times
    if (!time.published) {
      return false;
    }

    // Check if within valid date range
    if (time.validFrom && new Date(time.validFrom) > currentDate) {
      return false;
    }
    if (time.validTo && new Date(time.validTo) < currentDate) {
      return false;
    }

    return true;
  });

  return { ...restaurant, openingTimes: filteredOpeningTimes };
}

/**
 * Helper function to filter out unpublished menu items
 * @param restaurant - Restaurant data to filter
 * @returns Filtered restaurant data with only published menu items
 */
export function filterMenuItems(
  restaurant: RestaurantResponseType,
): RestaurantResponseType {
  const filteredMenuItems = restaurant.menuItems.filter(
    (item) => item.published,
  );

  return { ...restaurant, menuItems: filteredMenuItems };
}

/**
 * Get all restaurants
 * @param props - API handler props
 * @returns List of all restaurants
 */
export const getRestaurants = async ({ user }: ApiHandlerProps<UndefinedType, undefined>) => {
  try {
    debugLogger("Getting all restaurants", { userId: user.id });

    // Check if user can see unpublished restaurants
    const userRoles = await userRolesRepository.findByUserId(user.id);
    const canGetUnpublished =
      hasRole(userRoles, UserRoleValue.ADMIN) ||
      hasRole(userRoles, UserRoleValue.PARTNER_ADMIN);

    // Build where clause
    const where: Record<string, unknown> = {};

    if (!canGetUnpublished) {
      where["published"] = true;
    }

    // Fetch restaurants using the repository
    const restaurants = await restaurantRepository.findAll();

    debugLogger("Retrieved all restaurants", { count: restaurants.length });

    // Apply filters for non-privileged users
    const filteredRestaurants = restaurants.map((restaurant) => {
      // Process restaurant data to match expected type
      const processedRestaurant = {
        ...restaurant,
        menuItems: [],
        countryId: (restaurant.country ||
          (restaurant as any).countryId) as unknown as Countries,
      };

      // Apply filters for non-privileged users
      const withoutPrivateData = filterPrivateData(
        processedRestaurant as unknown as RestaurantResponseType,
      );
      return filterOpeningTimes(withoutPrivateData);
    });

    return {
      success: true,
      data: filteredRestaurants,
    };
  } catch (error) {
    errorLogger("Error getting all restaurants", error);
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Unknown error getting restaurants",
      errorCode: 500,
    };
  }
};

/**
 * Search restaurants
 * @param props - API handler props
 * @returns List of restaurants matching search criteria
 */
export const searchRestaurants = async ({ data, user }: ApiHandlerProps<RestaurantSearchType, undefined>) => {
  try {
    debugLogger("Searching restaurants", {
      userId: user.id,
      searchCriteria: data,
    });

    // Check if user can see unpublished restaurants
    const userRoles = await userRolesRepository.findByUserId(user.id);
    const canGetUnpublished =
      hasRole(userRoles, UserRoleValue.ADMIN) ||
      hasRole(userRoles, UserRoleValue.PARTNER_ADMIN);

    // Build where clause based on search criteria
    const where: Record<string, unknown> = {};

    if (data.name) {
      where["name"] = {
        contains: data.name,
        mode: "insensitive",
      };
    }

    if (data.city) {
      where["city"] = {
        contains: data.city,
        mode: "insensitive",
      };
    }

    if (data.countryId) {
      where["countryId"] = data.countryId;
    }

    if (!canGetUnpublished) {
      where["published"] = true;
    } else if (data.published !== null && data.published !== undefined) {
      where["published"] = data.published;
    }

    // Fetch restaurants using the repository
    // For now, we'll get all restaurants and filter them in memory
    // In a production environment, we would implement proper filtering in the repository
    const allRestaurants = await restaurantRepository.findAll();

    // Filter restaurants based on search criteria
    const restaurants = allRestaurants.filter((restaurant) => {
      // Apply name filter
      if (
        data.name &&
        !restaurant.name.toLowerCase().includes(data.name.toLowerCase())
      ) {
        return false;
      }

      // Apply city filter
      if (
        data.city &&
        !restaurant.city.toLowerCase().includes(data.city.toLowerCase())
      ) {
        return false;
      }

      // Apply country filter
      if (
        data.countryId &&
        (restaurant.country || (restaurant as any).countryId) !== data.countryId
      ) {
        return false;
      }

      // Apply published filter
      if (!canGetUnpublished && !(restaurant as any).published) {
        return false;
      } else if (
        data.published !== null &&
        (restaurant as any).published !== data.published
      ) {
        return false;
      }

      return true;
    });

    debugLogger("Retrieved restaurants", { count: restaurants.length });

    // Apply filters for non-privileged users
    const filteredRestaurants = restaurants.map((restaurant) => {
      // Process restaurant data to match expected type
      const processedRestaurant = {
        ...restaurant,
        menuItems: [],
        countryId: (restaurant.country ||
          (restaurant as any).countryId) as unknown as Countries,
      };

      // Apply filters for non-privileged users
      const withoutPrivateData = filterPrivateData(
        processedRestaurant as unknown as RestaurantResponseType,
      );
      return filterOpeningTimes(withoutPrivateData);
    });

    return {
      success: true,
      data: filteredRestaurants,
    };
  } catch (error) {
    errorLogger("Error searching restaurants", error);
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Unknown error searching restaurants",
      errorCode: 500,
    };
  }
};
