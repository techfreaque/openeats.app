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
    } as ApiHandlerResult<{
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
  interface RestaurantWithMenuItems {
    menuItems?: Array<{
      isAvailable?: boolean;
      currency?: string;
      [key: string]: unknown;
    }>;
    country?: Countries;
    countryId?: Countries;
    [key: string]: unknown;
  }

  const restaurantWithMenuItems = restaurant as RestaurantWithMenuItems;

  const processedRestaurant = {
    ...restaurant,
    menuItems: Array.isArray(restaurantWithMenuItems.menuItems)
      ? restaurantWithMenuItems.menuItems.map((item) => ({
          ...item,
          isAvailable: item.isAvailable ?? true,
          currency: item.currency ?? "EUR",
        }))
      : [],
    countryId: (restaurantWithMenuItems.country ??
      restaurantWithMenuItems.countryId) as Countries,
  };

  return {
    success: true,
    data: {
      restaurant: processedRestaurant as RestaurantResponseType,
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
export const createRestaurant = async ({
  user,
  data,
}: ApiHandlerProps<RestaurantCreateType, undefined>): Promise<
  ApiHandlerResult<RestaurantResponseType>
> => {
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
      } as ApiHandlerResult<RestaurantResponseType>;
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

    const restaurant = await restaurantRepository.createRestaurant(
      restaurantData as Parameters<
        typeof restaurantRepository.createRestaurant
      >[0],
    );

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
        data: restaurant as RestaurantResponseType,
        success: true,
        message:
          "Restaurant created, but location could not be determined. Please update the address, or get in touch with support.",
        errorCode: 400,
      } as ApiHandlerResult<RestaurantResponseType>;
    }

    // Process menu items to add required fields
    interface RestaurantWithMenuItems {
      menuItems?: Array<{
        isAvailable?: boolean;
        currency?: string;
        [key: string]: unknown;
      }>;
      country?: Countries;
      countryId?: Countries;
      [key: string]: unknown;
    }

    const restaurantWithMenuItems = restaurant as RestaurantWithMenuItems;

    const processedRestaurant = {
      ...restaurant,
      menuItems: Array.isArray(restaurantWithMenuItems.menuItems)
        ? restaurantWithMenuItems.menuItems.map((item) => ({
            ...item,
            isAvailable: item.isAvailable ?? true,
            currency: item.currency ?? "EUR",
          }))
        : [],
      countryId: (restaurantWithMenuItems.country ??
        restaurantWithMenuItems.countryId) as Countries,
    };

    return {
      data: processedRestaurant as RestaurantResponseType,
      success: true,
    };
  } catch (err) {
    const error = err as Error;
    errorLogger("Error creating restaurant", error);
    return {
      success: false,
      message: `Error creating restaurant: ${error instanceof Error ? error.message : "Unknown error"}`,
      errorCode: 500,
    } as ApiHandlerResult<RestaurantResponseType>;
  }
};

/**
 * Update an existing restaurant
 * @param props - API handler props
 * @returns Updated restaurant
 */
export const updateRestaurant = async ({
  user,
  data: requestData,
}: ApiHandlerProps<RestaurantUpdateType, undefined>): Promise<
  ApiHandlerResult<RestaurantResponseType>
> => {
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
      } as ApiHandlerResult<RestaurantResponseType>;
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
      } as ApiHandlerResult<RestaurantResponseType>;
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
      restaurantData as Parameters<
        typeof restaurantRepository.updateRestaurant
      >[1],
    );

    debugLogger("Restaurant updated", {
      restaurantId: updatedRestaurant?.id ?? requestData.id,
    });

    if (hasLocationError) {
      return {
        data: updatedRestaurant as RestaurantResponseType,
        success: true,
        message:
          "Restaurant updated, but location could not be determined. Please update the address, or get in touch with support.",
        errorCode: 400,
      } as ApiHandlerResult<RestaurantResponseType>;
    }

    // Process menu items to add required fields
    interface RestaurantWithMenuItems {
      menuItems?: Array<{
        isAvailable?: boolean;
        currency?: string;
        [key: string]: unknown;
      }>;
      country?: Countries;
      countryId?: Countries;
      [key: string]: unknown;
    }

    const restaurantWithMenuItems =
      updatedRestaurant as RestaurantWithMenuItems;

    const processedRestaurant = {
      ...(updatedRestaurant ?? {}),
      menuItems:
        updatedRestaurant && Array.isArray(restaurantWithMenuItems.menuItems)
          ? restaurantWithMenuItems.menuItems.map((item) => ({
              ...item,
              isAvailable: item.isAvailable ?? true,
              currency: item.currency ?? "EUR",
            }))
          : [],
      countryId: updatedRestaurant
        ? ((updatedRestaurant.country ??
            restaurantWithMenuItems.countryId) as Countries)
        : ("DE" as Countries),
    };

    return {
      data: processedRestaurant as RestaurantResponseType,
      success: true,
    };
  } catch (err) {
    const error = err as Error;
    errorLogger("Error updating restaurant", error);
    return {
      success: false,
      message: `Error updating restaurant: ${error instanceof Error ? error.message : "Unknown error"}`,
      errorCode: 500,
    } as ApiHandlerResult<RestaurantResponseType>;
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
export const getRestaurant = async ({
  user,
  data,
}: ApiHandlerProps<{ restaurantId: string }, undefined>): Promise<
  ApiHandlerResult<RestaurantResponseType>
> => {
  try {
    // Check if user and data are defined
    if (!user?.id || !data?.restaurantId) {
      return {
        success: false,
        message: "Invalid request parameters",
        errorCode: 400,
        data: null as RestaurantResponseType,
      } as ApiHandlerResult<RestaurantResponseType>;
    }

    debugLogger("Getting restaurant", {
      userId: user.id,
      restaurantId: data.restaurantId,
    });

    const result = await fetchRestaurantById(data.restaurantId, user.id);

    if (!result.success || !result.data) {
      return {
        success: false,
        message: "Restaurant not found",
        errorCode: 404,
        data: null as RestaurantResponseType,
      } as ApiHandlerResult<RestaurantResponseType>;
    }

    const { data: restaurantData } = result;

    // Ensure restaurant data exists
    if (!restaurantData?.restaurant) {
      return {
        success: false,
        message: "Restaurant data is missing",
        errorCode: 500,
        data: null as RestaurantResponseType,
      } as ApiHandlerResult<RestaurantResponseType>;
    }

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
        data: null as RestaurantResponseType,
      } as ApiHandlerResult<RestaurantResponseType>;
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

    // Ensure menuItems and openingTimes are arrays
    const menuItems = Array.isArray(filteredRestaurant.menuItems)
      ? filteredRestaurant.menuItems
      : [];
    const openingTimes = Array.isArray(filteredRestaurant.openingTimes)
      ? filteredRestaurant.openingTimes
      : [];

    debugLogger("Restaurant retrieved successfully", {
      restaurantId: data.restaurantId,
      menuItemCount: menuItems.length,
      openingTimesCount: openingTimes.length,
    });

    // Process menu items to add required fields
    const processedRestaurant = {
      ...filteredRestaurant,
      menuItems: menuItems.map((item) => ({
        ...item,
        isAvailable: item?.isAvailable ?? true,
        currency: item?.currency ?? "EUR",
      })),
      openingTimes: openingTimes,
      countryId: filteredRestaurant.countryId as Countries,
    };

    return {
      data: processedRestaurant as RestaurantResponseType,
      success: true,
    };
  } catch (err) {
    const error = err as Error;
    errorLogger("Error getting restaurant", error);
    return {
      success: false,
      message: `Error getting restaurant: ${error instanceof Error ? error.message : "Unknown error"}`,
      errorCode: 500,
      data: null as RestaurantResponseType,
    } as ApiHandlerResult<RestaurantResponseType>;
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
  if (!restaurant) {
    return restaurant;
  }

  // Check if userRoles exists before destructuring
  if (restaurant.userRoles) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { userRoles, ...filteredRestaurant } = restaurant;
    return filteredRestaurant;
  }

  return restaurant;
}

/**
 * Helper function to filter out unpublished or invalid opening times
 * @param restaurant - Restaurant data to filter
 * @returns Filtered restaurant data with only valid opening times
 */
export function filterOpeningTimes(
  restaurant: RestaurantResponseType,
): RestaurantResponseType {
  if (!restaurant) {
    return restaurant;
  }

  if (!restaurant.openingTimes || !Array.isArray(restaurant.openingTimes)) {
    return { ...restaurant, openingTimes: [] };
  }

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
  if (!restaurant) {
    return restaurant;
  }

  if (!restaurant.menuItems || !Array.isArray(restaurant.menuItems)) {
    return { ...restaurant, menuItems: [] };
  }

  const filteredMenuItems = restaurant.menuItems.filter(
    (item) => item?.published,
  );

  return { ...restaurant, menuItems: filteredMenuItems };
}

/**
 * Get all restaurants
 * @param props - API handler props
 * @returns List of all restaurants
 */
export const getRestaurants = async ({
  user,
}: ApiHandlerProps<UndefinedType, undefined>): Promise<
  ApiHandlerResult<RestaurantResponseType[]>
> => {
  try {
    // Handle public user case (for restaurant page)
    const userId = user?.id || "public";
    debugLogger("Getting all restaurants", { userId });

    // Check if user can see unpublished restaurants
    let canGetUnpublished = false;
    if (userId !== "public") {
      const userRoles = await userRolesRepository.findByUserId(userId);
      canGetUnpublished =
        hasRole(userRoles, UserRoleValue.ADMIN) ||
        hasRole(userRoles, UserRoleValue.PARTNER_ADMIN);
    }

    // Build where clause
    const where: Record<string, unknown> = {};

    if (!canGetUnpublished) {
      where["published"] = true;
    }

    // Fetch restaurants using the repository
    const restaurants = await restaurantRepository.findAll();

    if (!restaurants || !Array.isArray(restaurants)) {
      return {
        success: true,
        data: [],
      };
    }

    debugLogger("Retrieved all restaurants", { count: restaurants.length });

    // Apply filters for non-privileged users
    const filteredRestaurants = restaurants
      .map((restaurant) => {
        if (!restaurant) {
          return null;
        }

        // Process restaurant data to match expected type
        interface RestaurantWithCountry {
          country?: Countries;
          countryId?: Countries;
          [key: string]: unknown;
        }

        const restaurantWithCountry = restaurant as RestaurantWithCountry;

        // Define a more comprehensive type for restaurant with all possible fields
        interface RestaurantWithAllFields extends Record<string, unknown> {
          country?: Countries;
          countryId?: Countries;
          delivery?: boolean;
          pickup?: boolean;
          dineIn?: boolean;
          priceLevel?: number | string;
          image?: string;
          imageUrl?: string;
          menuItems?: any[];
          openingTimes?: any[];
          rating?: string | number;
          latitude?: string | number;
          longitude?: string | number;
        }

        const restaurantWithAllFields = restaurant as RestaurantWithAllFields;

        // Ensure we have valid menu items and opening times arrays
        const menuItems = Array.isArray(restaurantWithAllFields.menuItems)
          ? restaurantWithAllFields.menuItems
          : [];

        const openingTimes = Array.isArray(restaurantWithAllFields.openingTimes)
          ? restaurantWithAllFields.openingTimes
          : [];

        // Process image URL to ensure it's valid
        const imageUrl =
          restaurantWithAllFields.image ||
          restaurantWithAllFields.imageUrl ||
          "";
        const validImageUrl = imageUrl.startsWith("http")
          ? imageUrl
          : "/placeholder.svg";

        // Parse numeric values safely
        const rating =
          typeof restaurantWithAllFields.rating === "string"
            ? parseFloat(restaurantWithAllFields.rating) || 0
            : restaurantWithAllFields.rating || 0;

        const latitude =
          typeof restaurantWithAllFields.latitude === "string"
            ? parseFloat(restaurantWithAllFields.latitude) || 0
            : restaurantWithAllFields.latitude || 0;

        const longitude =
          typeof restaurantWithAllFields.longitude === "string"
            ? parseFloat(restaurantWithAllFields.longitude) || 0
            : restaurantWithAllFields.longitude || 0;

        const processedRestaurant = {
          ...restaurant,
          menuItems,
          openingTimes,
          countryId: (restaurantWithCountry.country ??
            restaurantWithCountry.countryId) as Countries,
          // Add required fields that might be missing
          phone: restaurant.phone ?? "",
          email: restaurant.email ?? "",
          published: true, // Default to published
          orderCount: 0,
          rating,
          verified: true, // Default to verified
          latitude,
          longitude,
          // Add missing required fields
          delivery: restaurantWithAllFields.delivery ?? true,
          pickup: restaurantWithAllFields.pickup ?? true,
          dineIn: restaurantWithAllFields.dineIn ?? false,
          priceLevel:
            typeof restaurantWithAllFields.priceLevel === "number"
              ? restaurantWithAllFields.priceLevel
              : 2,
          image: validImageUrl,
          mainCategory: {
            id: "00000000-0000-0000-0000-000000000000", // Valid UUID format
            name: "General",
            image: "",
          },
        };

        // Apply filters for non-privileged users
        const withoutPrivateData = filterPrivateData(
          processedRestaurant as RestaurantResponseType,
        );
        return filterOpeningTimes(withoutPrivateData);
      })
      .filter(Boolean) as RestaurantResponseType[];

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
      data: [],
    } as ApiHandlerResult<RestaurantResponseType[]>;
  }
};

/**
 * Search restaurants
 * @param props - API handler props
 * @returns List of restaurants matching search criteria
 */
export const searchRestaurants = async ({
  data,
  user,
}: ApiHandlerProps<RestaurantSearchType, undefined>): Promise<
  ApiHandlerResult<RestaurantResponseType[]>
> => {
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
      interface RestaurantWithCountry {
        country?: Countries;
        countryId?: Countries;
        published?: boolean;
        [key: string]: unknown;
      }

      const restaurantWithCountry = restaurant as RestaurantWithCountry;

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
        (restaurantWithCountry.country ?? restaurantWithCountry.countryId) !==
          data.countryId
      ) {
        return false;
      }

      // Apply published filter
      if (
        !canGetUnpublished &&
        !(restaurantWithCountry as { published?: boolean }).published
      ) {
        return false;
      } else if (
        data.published !== null &&
        (restaurantWithCountry as { published?: boolean }).published !==
          data.published
      ) {
        return false;
      }

      return true;
    });

    debugLogger("Retrieved restaurants", { count: restaurants.length });

    // Apply filters for non-privileged users
    const filteredRestaurants = restaurants.map((restaurant) => {
      // Process restaurant data to match expected type
      interface RestaurantWithCountry {
        country?: Countries;
        countryId?: Countries;
        [key: string]: unknown;
      }

      const restaurantWithCountry = restaurant as RestaurantWithCountry;

      const processedRestaurant = {
        ...restaurant,
        menuItems: [],
        openingTimes: [],
        countryId: (restaurantWithCountry.country ??
          restaurantWithCountry.countryId) as Countries,
        // Add required fields that might be missing
        phone: restaurant.phone ?? "",
        email: restaurant.email ?? "",
        published: true, // Default to published
        orderCount: 0,
        rating: parseFloat(restaurant.rating) ?? 0,
        verified: true, // Default to verified
        latitude: parseFloat(restaurant.latitude) ?? 0,
        longitude: parseFloat(restaurant.longitude) ?? 0,
        mainCategory: {
          id: "00000000-0000-0000-0000-000000000000",
          name: "General",
          image: "",
        },
      };

      // Apply filters for non-privileged users
      const withoutPrivateData = filterPrivateData(
        processedRestaurant as RestaurantResponseType,
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
    } as ApiHandlerResult<RestaurantResponseType[]>;
  }
};
