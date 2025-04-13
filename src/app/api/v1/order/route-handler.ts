import "server-only";

import type { ApiHandlerFunction } from "next-vibe/server/endpoints/core/api-handler";
import type { UndefinedType } from "next-vibe/shared/types/common.schema";
import { debugLogger, errorLogger } from "next-vibe/shared/utils/logger";

import { restaurantRepository } from "../restaurant/restaurant.repository";
import { orderRepository } from "./order.repository";
import type { OrderCreateType, OrderResponseType, OrderStatus } from "./schema";

/**
 * Order API route handlers
 * Provides order management functionality
 */

/**
 * Create a new order
 * @param props - API handler props
 * @returns Created order
 */
export const createOrder: ApiHandlerFunction<
  OrderCreateType,
  OrderResponseType,
  UndefinedType
> = async ({ data, user }, orderId?: string) => {
  debugLogger("Creating order", {
    userId: user.id,
    restaurantId: data.restaurantId,
    items: data.orderItems.length,
  });

  // Check if restaurant exists
  const restaurant = await restaurantRepository.findById(data.restaurantId);

  if (!restaurant) {
    debugLogger("Restaurant not found", { restaurantId: data.restaurantId });
    return {
      success: false,
      message: `Restaurant ${data.restaurantId} not found`,
      errorCode: 404,
    };
  }

  try {
    // Get menu item IDs from order items
    const menuItemIds = data.orderItems.map((item) => item.menuItemId);

    // Fetch menu items
    const menuItems = await orderRepository.getMenuItemsByIds(menuItemIds);

    // Check if all menu items were found
    if (menuItems.length !== data.orderItems.length) {
      debugLogger("Some menu items not found or not available", {
        requested: data.orderItems.length,
        found: menuItems.length,
      });
      return {
        success: false,
        message: "Some menu items not found or not available",
        errorCode: 404,
      };
    }

    let total = 0;
    let totalTax = 0;
    const orderItems = data.orderItems.map((item: any) => {
      const menuItem = menuItems.find((mi: any) => mi.id === item.menuItemId);
      if (!menuItem) {
        throw new Error(`Menu item ${item.menuItemId} not found`);
      }

      const itemPrice = menuItem.price * item.quantity;
      total += itemPrice;
      totalTax += (itemPrice * menuItem.taxPercent) / 100;

      return {
        quantity: item.quantity,
        message: item.message,
        price: menuItem.price,
        taxPercent: menuItem.taxPercent,
        menuItem: {
          connect: {
            id: item.menuItemId,
          },
        },
      };
    });

    debugLogger("Calculated order totals", {
      total,
      tax: totalTax,
      items: orderItems.length,
    });

    const createdOrder = await db.order.create({
      data: {
        ...(orderId ? { id: orderId } : {}),
        status: OrderStatus.NEW,
        message: data.message,
        total,
        tax: totalTax,
        customer: {
          connect: {
            id: user.id, // Use authenticated user ID instead of passed customerId
          },
        },
        orderItems: {
          create: orderItems,
        },
        deliveryFee: data.deliveryFee || 2.99, // Default delivery fee
        paymentMethod: data.paymentMethod,
        driverTip: data.driverTip,
        restaurantTip: data.restaurantTip,
        projectTip: data.projectTip,
        restaurant: {
          connect: {
            id: data.restaurantId,
          },
        },
        currency: "EUR", // Default currency
        delivery: {
          create: {
            type: data.delivery.type,
            status: data.delivery.status,
            distance: data.delivery.distance,
            estimatedPreparationTime: data.delivery.estimatedPreparationTime,
            estimatedDeliveryTime: data.delivery.estimatedDeliveryTime,
            street: data.delivery.street,
            streetNumber: data.delivery.streetNumber,
            zip: data.delivery.zip,
            city: data.delivery.city,
            phone: data.delivery.phone,
            latitude: data.delivery.latitude,
            longitude: data.delivery.longitude,
            countryId: data.delivery.countryId,
            driverId: data.delivery.driverId,
            message: data.delivery.message,
          },
        },
      },
      select: {
        id: true,
        message: true,
        status: true,
        total: true,
        deliveryFee: true,
        driverTip: true,
        restaurantTip: true,
        projectTip: true,
        createdAt: true,
        updatedAt: true,
        paymentMethod: true,
        tax: true,
        customerId: true,
        orderItems: {
          select: {
            id: true,
            menuItemId: true,
            message: true,
            quantity: true,
            price: true,
            taxPercent: true,
          },
        },
        delivery: {
          select: {
            id: true,
            orderId: true,
            type: true,
            status: true,
            message: true,
            updatedAt: true,
            estimatedDeliveryTime: true,
            estimatedPreparationTime: true,
            distance: true,
            street: true,
            streetNumber: true,
            zip: true,
            driver: {
              select: {
                id: true,
                vehicle: true,
                licensePlate: true,
                rating: true,
                ratingCount: true,
                phone: true,
                // imageUrl: true, // This field doesn't exist in the schema
              },
            },
            city: true,
            phone: true,
            latitude: true,
            longitude: true,
            countryId: true,
          },
        },
        restaurant: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        customer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            // imageUrl: true, // This field doesn't exist in the schema
          },
        },
      },
    });

    debugLogger("Order created successfully", { orderId: createdOrder.id });

    return {
      data: createdOrder,
      success: true,
    };
  } catch (err) {
    const error = err as Error;
    errorLogger("Error creating order", error);
    return {
      success: false,
      message: `Error creating order: ${error instanceof Error ? error.message : "Unknown error"}`,
      errorCode: 500,
    };
  }
};
