import type { Prisma } from "@prisma/client";
import type { ApiHandlerCallBackFunctionType } from "next-vibe/server/endpoints/core/api-handler";
import { hasRole } from "next-vibe/server/endpoints/data";
import type { UndefinedType } from "next-vibe/shared/types/common.schema";
import { UserRoleValue } from "next-vibe/shared/types/enums";

import { db } from "../../db";
import type {
  OrdersGetRequestType,
  OrdersGetResponseOutputType,
} from "./schema";

/**
 * Gets orders based on search criteria with pagination and filtering
 */
export const getOrders: ApiHandlerCallBackFunctionType<
  OrdersGetRequestType,
  OrdersGetResponseOutputType,
  UndefinedType
> = async ({ user, data }) => {
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

  const userRoles = await db.userRole.findMany({
    where: { userId: user.id },
  });

  // Build the where clause based on filters with proper type
  const where: Prisma.OrderWhereInput = {};

  // Apply filters if provided
  if (restaurantId) {
    where.restaurantId = restaurantId;
  }
  if (customerId) {
    where.customerId = customerId;
  }
  if (paymentMethod) {
    where.paymentMethod = paymentMethod;
  }
  if (orderStatus) {
    where.status = orderStatus;
  }
  if (deliveryStatus) {
    where.delivery = {
      status: deliveryStatus,
    };
  }
  // Date range filters
  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) {
      where.createdAt = {
        ...where.createdAt,
        gte: new Date(startDate),
      };
    }
    if (endDate) {
      where.createdAt = {
        ...where.createdAt,
        lte: new Date(endDate),
      };
    }
  }
  // Calculate pagination
  const skip = (page - 1) * limit;

  // For admin users - can see all orders
  if (hasRole(userRoles, UserRoleValue.ADMIN)) {
    const orders = await db.order.findMany({
      where,
      select: ordersSelectBase,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    });
    return orders;
  }

  // For partner admins - can see their restaurant orders
  if (
    hasRole(userRoles, UserRoleValue.PARTNER_ADMIN) ||
    hasRole(userRoles, UserRoleValue.PARTNER_EMPLOYEE)
  ) {
    // Get restaurants associated with this partner admin
    const restaurantIdsWithAccess = userRoles
      .map((role) => {
        if (
          (
            [
              UserRoleValue.PARTNER_EMPLOYEE,
              UserRoleValue.PARTNER_ADMIN,
            ] as UserRoleValue[]
          ).includes(role.role) &&
          role.partnerId
        ) {
          return role.partnerId;
        }
        return undefined;
      })
      .filter((id) => id !== undefined);

    where.OR = [
      { customerId: user.id },
      { restaurantId: { in: restaurantIdsWithAccess } },
    ];

    const orders = await db.order.findMany({
      where,
      select: ordersSelectBase,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    });
    return orders;
  }

  // For couriers - can see orders assigned to them
  if (hasRole(userRoles, UserRoleValue.COURIER)) {
    const orders = await db.order.findMany({
      where: {
        delivery: {
          driver: {
            userId: user.id,
          },
        },
        ...where,
      },
      select: ordersSelectBase,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    });
    return orders;
  }

  // For customers - can see only their own orders
  where.customerId = user.id;
  const orders = await db.order.findMany({
    where,
    select: ordersSelectBase,
    skip,
    take: limit,
    orderBy: { createdAt: "desc" },
  });
  return orders;
};

const ordersSelectBase = {
  id: true,
  customerId: true,
  createdAt: true,
  updatedAt: true,
  message: true,
  status: true,
  tax: true,
  total: true,
  projectTip: true,
  paymentMethod: true,
  restaurantTip: true,
  driverTip: true,
  deliveryFee: true,
  delivery: {
    select: {
      id: true,
      zip: true,
      city: true,
      countryId: true,
      distance: true,
      latitude: true,
      longitude: true,
      street: true,
      type: true,
      updatedAt: true,
      phone: true,
      estimatedDeliveryTime: true,
      streetNumber: true,
      status: true,
      createdAt: true,
      estimatedPreparationTime: true,
      message: true,
      driver: {
        select: {
          id: true,
          vehicle: true,
          rating: true,
          ratingCount: true,
          phone: true,
          imageUrl: true,
          licensePlate: true,
        },
      },
    },
  },
  restaurant: {
    select: {
      id: true,
      name: true,
      image: true,
    },
  },
};
