import type {
  ApiHandlerCallBackFunctionType,
  SafeReturnType,
} from "next-vibe/server/endpoints/core/api-handler";
import type { UndefinedType } from "next-vibe/shared/types/common.schema";
import type { UserRoleResponseType } from "next-vibe/shared/types/user-roles.schema";
import { errorLogger } from "next-vibe/shared/utils/logger";

import { getCoordinatesFromAddress } from "@/lib/geo/distance";

import { db } from "../../db";

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
> {}

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
      data: updatedRestaurant,
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
  phone: true,
  city: true,
  zip: true,
  countryId: true,
  image: true,
  createdAt: true,
  menuItems: {
    select: {
      id: true,
      name: true,
      description: true,
      price: true,
      image: true,
      taxPercent: true,
      published: true,
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
      restaurantId: true,
    },
  },
};

export const getRestaurant: ApiHandlerCallBackFunctionType<
  UndefinedType,
  RestaurantResponseType,
  RestaurantGetType
> = async ({ user, urlVariables }) => {
  try {
    const { success, data, message, errorCode } = await fetchRestaurantById(
      urlVariables.restaurantId,
      user.id,
    );

    if (!success) {
      return {
        success: false,
        message: message,
        errorCode: errorCode,
      };
    }

    if (data.restaurant.published === false) {
      // Only the restaurant or admin can view unpublished restaurants
      return {
        success: false,
        message: "Unauthorized",
        errorCode: 403,
      };
    }

    // Apply filters for non-privileged users
    let filteredRestaurant = data.restaurant;
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
