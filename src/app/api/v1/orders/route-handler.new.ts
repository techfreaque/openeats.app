/**
 * Orders API route handlers
 * Provides order listing functionality
 */

import "server-only";

import type { ApiHandlerFunction } from "next-vibe/server/endpoints/core/api-handler";
import { formatResponse } from "next-vibe/server/endpoints/core/api-response";
import { hasRole } from "next-vibe/server/endpoints/data";
import { UserRoleValue } from "next-vibe/shared/types/enums";
import { debugLogger, errorLogger } from "next-vibe/shared/utils/logger";

import { userRolesRepository } from "@/app/api/v1/auth/repository";
import { deliveryRepository } from "@/app/api/v1/order/delivery.repository";
import { orderRepository } from "@/app/api/v1/order/order.repository";

import type {
  OrdersGetRequestType,
  OrdersGetResponseOutputType,
} from "./schema";

/**
 * Gets orders based on search criteria with pagination and filtering
 * @param props - API handler props
 * @returns List of orders matching criteria
 */
export const getOrders: ApiHandlerFunction<
  OrdersGetRequestType,
  OrdersGetResponseOutputType,
  undefined
> = async ({ user, data }) => {
  try {
    const {
      restaurantId,
      customerId,
      paymentMethod,
      orderStatus,
      deliveryStatus,
      startDate,
      endDate,
      page,
      limit,
    } = data;

    debugLogger("Getting orders", {
      userId: user.id,
      filters: {
        restaurantId,
        customerId,
        paymentMethod,
        orderStatus,
        deliveryStatus,
        startDate,
        endDate,
      },
      pagination: { page, limit },
    });

    // Get user roles
    const userRoles = await userRolesRepository.findByUserId(user.id);

    // Prepare filter options
    const filterOptions = {
      restaurantId,
      customerId,
      paymentMethod,
      orderStatus,
      deliveryStatus,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      page,
      limit,
    };

    let orders;

    // For admin users - can see all orders
    if (hasRole(userRoles, UserRoleValue.ADMIN)) {
      debugLogger("User is admin, fetching all orders");
      orders = await orderRepository.findAll(filterOptions);
    }
    // For partner admins - can see their restaurant orders
    else if (
      hasRole(userRoles, UserRoleValue.PARTNER_ADMIN) ||
      hasRole(userRoles, UserRoleValue.PARTNER_EMPLOYEE)
    ) {
      // Get restaurants associated with this partner admin
      const restaurantIdsWithAccess = userRoles
        .filter(
          (role) =>
            (role.role === UserRoleValue.PARTNER_ADMIN ||
              role.role === UserRoleValue.PARTNER_EMPLOYEE) &&
            role.partnerId,
        )
        .map((role) => role.partnerId as string);

      debugLogger(
        "User is partner admin/employee, fetching restaurant orders",
        {
          restaurantIds: restaurantIdsWithAccess,
        },
      );

      // If restaurantId is provided in the filter, check if the user has access to it
      if (restaurantId && !restaurantIdsWithAccess.includes(restaurantId)) {
        return {
          success: false,
          message: "You don't have access to this restaurant's orders",
          errorCode: 403,
        };
      }

      // If restaurantId is not provided, use all restaurants the user has access to
      const restaurantIdToUse = restaurantId || restaurantIdsWithAccess[0];

      // Get orders for the restaurant
      orders = await orderRepository.findAll({
        ...filterOptions,
        restaurantId: restaurantIdToUse,
      });
    }
    // For couriers - can see orders assigned to them
    else if (hasRole(userRoles, UserRoleValue.COURIER)) {
      debugLogger("User is courier, fetching assigned orders");

      // Get the driver record for this user
      const driver = await deliveryRepository.findByDriverId(user.id);

      if (!driver) {
        return {
          success: false,
          message: "Driver profile not found",
          errorCode: 404,
        };
      }

      // Get orders assigned to this driver
      orders = await orderRepository.findAll({
        ...filterOptions,
        // We'll filter for orders with deliveries assigned to this driver
      });

      // Filter orders to only include those assigned to this driver
      orders = orders.filter((order) => order.delivery?.driverId === driver.id);
    }
    // For customers - can see only their own orders
    else {
      debugLogger("User is customer, fetching their orders");
      orders = await orderRepository.findAll({
        ...filterOptions,
        customerId: user.id,
      });
    }

    debugLogger("Retrieved orders", { count: orders.length });

    // Format the response
    const formattedOrders = orders.map((order) => ({
      id: order.id,
      customerId: order.customerId,
      status: order.status,
      paymentMethod: order.paymentMethod,
      message: order.message,
      total: order.total,
      deliveryFee: order.deliveryFee,
      driverTip: order.driverTip,
      restaurantTip: order.restaurantTip,
      projectTip: order.projectTip,
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
      restaurant: {
        id: order.restaurant.id,
        name: order.restaurant.name,
        image: order.restaurant.imageUrl,
      },
      customer: {
        firstName: order.customer.firstName,
        lastName: order.customer.lastName,
        email: order.customer.email,
        imageUrl: order.customer.imageUrl,
      },
      delivery: order.delivery
        ? {
            id: order.delivery.id,
            type: order.delivery.type,
            status: order.delivery.status,
            message: order.delivery.message,
            estimatedDeliveryTime: order.delivery.estimatedDeliveryTime,
            estimatedPreparationTime: order.delivery.estimatedPreparationTime,
            distance: order.delivery.distance,
            street: order.delivery.street,
            streetNumber: order.delivery.streetNumber,
            zip: order.delivery.zip,
            city: order.delivery.city,
            phone: order.delivery.phone,
            latitude: order.delivery.latitude,
            longitude: order.delivery.longitude,
            countryId: order.delivery.countryId,
            updatedAt: order.delivery.updatedAt.toISOString(),
            orderId: order.delivery.orderId,
            driver: null, // We'll need to fetch driver details separately
          }
        : null,
      orderItems: order.orderItems.map((item) => ({
        id: item.id,
        menuItemId: item.menuItemId,
        message: item.message,
        quantity: item.quantity,
        price: item.price,
        taxPercent: item.taxPercent,
      })),
    }));

    return formatResponse(formattedOrders);
  } catch (error) {
    errorLogger("Error getting orders", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Unknown error getting orders",
      errorCode: 500,
    };
  }
};
