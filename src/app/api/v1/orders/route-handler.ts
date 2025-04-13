import "server-only";

import { hasRole } from "next-vibe/server/endpoints/data";
import { UserRoleValue } from "next-vibe/shared/types/enums";
import { debugLogger } from "next-vibe/shared/utils/logger";

import type { User } from "@/app/api/v1/auth/me/db";
import { userRolesRepository } from "@/app/api/v1/auth/roles/roles.repository";
import type { Delivery } from "@/app/api/v1/order/delivery.db";
import type { Order } from "@/app/api/v1/order/order.db";
import { orderRepository } from "@/app/api/v1/order/order.repository";
import type { OrderItem } from "@/app/api/v1/order/order-item.db";

/**
 * Orders API route handlers
 * Provides order listing functionality
 */

interface OrdersRequestData {
  restaurantId?: string;
  customerId?: string;
  paymentMethod?: string;
  orderStatus?: string;
  deliveryStatus?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

interface OrdersResponse {
  success: boolean;
  data?: unknown[];
  message?: string;
  errorCode?: number;
}

/**
 * Get orders based on filters
 * Supports filtering by restaurant, customer, payment method, order status, delivery status, and date range
 * @param props - API handler props
 * @returns List of orders matching criteria
 */
export const getOrders = async ({
  user,
  data,
}: {
  user: User;
  data: OrdersRequestData;
}): Promise<OrdersResponse> => {
  try {
    const {
      restaurantId,
      customerId,
      paymentMethod,
      orderStatus,
      deliveryStatus,
      startDate,
      endDate,
      page = 1,
      limit = 10,
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

    // Pagination is handled by the repository

    // For admin users - can see all orders
    if (hasRole(userRoles, UserRoleValue.ADMIN)) {
      debugLogger("User is admin, fetching all orders");

      // Use the repository to get orders with all details
      const orders = await orderRepository.findAll({
        restaurantId: restaurantId ? restaurantId : undefined,
        customerId: customerId ? customerId : undefined,
        paymentMethod,
        orderStatus,
        deliveryStatus,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        page,
        limit,
      });

      debugLogger("Retrieved orders", { count: orders.length });

      return {
        success: true,
        data: orders,
      };
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

      // Use the repository to get orders with all details
      // If we have multiple restaurant IDs, we need to make multiple queries
      // and combine the results
      let orders: Array<
        Order & {
          restaurant: { id: string; name: string; imageUrl: string | null };
          customer: {
            id: string;
            firstName: string;
            lastName: string;
            email: string;
            imageUrl: string | null;
          };
          delivery: Delivery | null;
          orderItems: OrderItem[];
        }
      > = [];

      if (restaurantIdsWithAccess.length > 0) {
        // Query for each restaurant ID
        const restaurantPromises = restaurantIdsWithAccess.map((id) =>
          orderRepository.findAll({
            restaurantId: id,
            customerId: customerId ? customerId : undefined,
            paymentMethod,
            orderStatus,
            deliveryStatus,
            startDate: startDate ? new Date(startDate) : undefined,
            endDate: endDate ? new Date(endDate) : undefined,
            page,
            limit,
          }),
        );

        // Combine results
        const restaurantResults = await Promise.all(restaurantPromises);
        orders = restaurantResults.flat();
      } else {
        // No restaurant access
        orders = [];
      }

      debugLogger("Retrieved orders", { count: orders.length });

      return {
        success: true,
        data: orders,
      };
    }
    // For couriers - can see orders assigned to them
    else if (hasRole(userRoles, UserRoleValue.COURIER)) {
      debugLogger("User is courier, fetching assigned orders");

      // Use the repository to get orders with all details
      // The repository doesn't support driverId filtering directly
      // We need to get all orders and filter by delivery driver
      const allOrders = await orderRepository.findAll({
        restaurantId: restaurantId ? restaurantId : undefined,
        customerId: customerId ? customerId : undefined,
        paymentMethod,
        orderStatus,
        deliveryStatus,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        page,
        limit,
      });

      // Filter orders where the user is the driver
      const orders = allOrders.filter(
        (order) => order.delivery && order.delivery.driverId === user.id,
      );

      debugLogger("Retrieved orders", { count: orders.length });

      return {
        success: true,
        data: orders,
      };
    }
    // For customers - can see only their own orders
    else {
      debugLogger("User is customer, fetching their orders");

      // Use the repository to get orders with all details
      const orders = await orderRepository.findAll({
        restaurantId: restaurantId ? restaurantId : undefined,
        customerId: user.id, // Only show orders for this customer
        paymentMethod,
        orderStatus,
        deliveryStatus,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        page,
        limit,
      });

      debugLogger("Retrieved orders", { count: orders.length });

      return {
        success: true,
        data: orders,
      };
    }
  } catch (error) {
    debugLogger("Error getting orders", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Unknown error getting orders",
      errorCode: 500,
    };
  }
};
