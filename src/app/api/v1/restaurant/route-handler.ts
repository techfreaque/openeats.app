import type {
  ApiHandlerCallBackFunctionType,
  SafeReturnType,
} from "next-vibe/server/endpoints/core/api-handler";
import { hasRole } from "next-vibe/server/endpoints/data";
import type { UndefinedType } from "next-vibe/shared/types/common.schema";
import { UserRoleValue } from "next-vibe/shared/types/enums";
import type { UserRoleResponseType } from "next-vibe/shared/types/user-roles.schema";
import { errorLogger } from "next-vibe/shared/utils/logger";

import { getCoordinatesFromAddress } from "@/lib/geo/distance";

import { db } from "../../db";
import type {
  RestaurantCreateType,
  RestaurantGetType,
  RestaurantResponseType,
  RestaurantUpdateType,
} from "./schema/restaurant.schema";

// Helper function to fetch and process restaurant data
async function fetchRestaurantById(
  restaurantId: string,
  userId: string,
): Promise<
  SafeReturnType<{
    restaurant: RestaurantResponseType;
    userRoles: UserRoleResponseType[];
    hasAccess: boolean;
  }>
> {
  const restaurant = await db.partner.findUnique({
    where: { id: restaurantId },
    select: restaurantQuery,
  });

  if (!restaurant) {
    return {
      success: false,
      message: "Restaurant not found",
      errorCode: 404,
    };
  }

  const userRoles = (await db.userRole.findMany({
    where: { userId },
  })) as UserRoleResponseType[];

  const hasAccess =
    hasRole(userRoles, UserRoleValue.PARTNER_ADMIN, restaurant.id) ||
    hasRole(userRoles, UserRoleValue.PARTNER_EMPLOYEE, restaurant.id) ||
    hasRole(userRoles, UserRoleValue.ADMIN);

  return {
    success: true,
    data: { restaurant, userRoles, hasAccess },
  };
}

export const createRestaurant: ApiHandlerCallBackFunctionType<
  RestaurantCreateType,
  RestaurantResponseType,
  UndefinedType
> = async ({ user, data }) => {
  try {
    // Check if user has admin role
    const userRoles = (await db.userRole.findMany({
      where: { userId: user.id },
    })) as UserRoleResponseType[];

    if (!hasRole(userRoles, UserRoleValue.CUSTOMER)) {
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
      errorLogger("Error getting coordinates", error);
      hasLocationError = true;
    }

    // Create the restaurant
    const restaurant = await db.partner.create({
      data: {
        name: data.name,
        description: data.description,
        published: false,
        email: data.email,
        latitude: latitude || 0,
        longitude: longitude || 0,
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
      },
      select: restaurantQuery,
    });

    // Create user role for creator
    await db.userRole.create({
      data: {
        userId: user.id,
        partnerId: restaurant.id,
        role: UserRoleValue.PARTNER_ADMIN,
      },
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
    return {
      data: restaurant,
      success: true,
    };
  } catch (err) {
    const error = err as Error;
    return {
      success: false,
      message: `Error creating restaurant: ${error.message}`,
      errorCode: 500,
    };
  }
};

export const updateRestaurant: ApiHandlerCallBackFunctionType<
  RestaurantUpdateType,
  RestaurantResponseType,
  UndefinedType
> = async ({ user, data: requestData }) => {
  try {
    const { success, message, errorCode, data } = await fetchRestaurantById(
      requestData.id,
      user.id,
    );
    if (!success) {
      return {
        success: false,
        message,
        errorCode,
      };
    }
    if (!data.hasAccess) {
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
      errorLogger("Error getting coordinates", error);
      hasLocationError = true;
    }

    // Update the restaurant
    const updatedRestaurant = await db.partner.update({
      where: { id: requestData.id },
      data: {
        name: requestData.name,
        description: requestData.description,
        published: requestData.published,
        email: requestData.email,
        latitude: latitude || 0,
        longitude: longitude || 0,
        street: requestData.street,
        streetNumber: requestData.streetNumber,
        phone: requestData.phone,
        city: requestData.city,
        zip: requestData.zip,
        countryId: requestData.countryId,
        image: requestData.image,
        mainCategoryId: requestData.mainCategoryId,
      },
      select: restaurantQuery,
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
    return {
      data: updatedRestaurant as RestaurantResponseType,
      success: true,
    };
  } catch (err) {
    const error = err as Error;
    return {
      success: false,
      message: `Error updating restaurant: ${error.message}`,
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
      category: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
    },
  },
  mainCategory: {
    select: {
      id: true,
      name: true,
      image: true,
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

export const getRestaurant: ApiHandlerCallBackFunctionType<
  RestaurantGetType,
  RestaurantResponseType,
  UndefinedType
> = async ({ user, data }) => {
  try {
    const {
      success,
      data: restaurantData,
      message,
      errorCode,
    } = await fetchRestaurantById(data.restaurantId, user.id);

    if (!success) {
      return {
        success: false,
        message: message,
        errorCode: errorCode,
      };
    }

    if (restaurantData.restaurant.published === false) {
      // Only the restaurant or admin can view unpublished restaurants
      return {
        success: false,
        message: "Unauthorized",
        errorCode: 403,
      };
    }

    // Apply filters for non-privileged users
    let filteredRestaurant = restaurantData.restaurant;
    filteredRestaurant = filterPrivateData(filteredRestaurant);
    filteredRestaurant = filterOpeningTimes(filteredRestaurant);
    filteredRestaurant = filterMenuItems(filteredRestaurant);

    return {
      data: filteredRestaurant,
      success: true,
    };
  } catch (err) {
    const error = err as Error;
    return {
      success: false,
      message: `Error getting restaurant: ${error.message}`,
      errorCode: 500,
    };
  }
};

// Helper function to remove userRoles from restaurant data
export function filterPrivateData(
  restaurant: RestaurantResponseType,
): RestaurantResponseType {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { userRoles, ...filteredRestaurant } = restaurant;
  return filteredRestaurant;
}

// Helper function to filter out unpublished or invalid opening times
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

// Helper function to filter out unpublished menu items
export function filterMenuItems(
  restaurant: RestaurantResponseType,
): RestaurantResponseType {
  const filteredMenuItems = restaurant.menuItems.filter(
    (item) => item.published,
  );

  return { ...restaurant, menuItems: filteredMenuItems };
}
