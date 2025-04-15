import "server-only";

import type { ApiHandlerFunction } from "next-vibe/server/endpoints/core/api-handler";
import type { UndefinedType } from "next-vibe/shared/types/common.schema";
import { ErrorResponseTypes } from "next-vibe/shared/types/response.schema";
import { debugLogger, errorLogger } from "next-vibe/shared/utils/logger";

import { restaurantRepository } from "../restaurant/restaurant.repository";
import { OrderStatus } from "./order.db";
import { orderRepository } from "./order.repository";
import type { OrderCreateType, OrderResponseType } from "./schema";

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
      errorType: ErrorResponseTypes.HTTP_ERROR,
    };
  }

  try {
    // Get menu item IDs from order items
    const menuItemIds = data.orderItems.map((item) => item.menuItemId);

    // Fetch menu items
    const menuItems = await orderRepository.getMenuItemsByIds(menuItemIds);

    // Check if all menu items were found
    if (!menuItems || menuItems.length !== data.orderItems.length) {
      debugLogger("Some menu items not found or not available", {
        requested: data.orderItems.length,
        found: menuItems?.length ?? 0,
      });
      return {
        success: false,
        message: "Some menu items not found or not available",
        errorCode: 404,
        errorType: ErrorResponseTypes.HTTP_ERROR,
      };
    }

    let total = 0;
    let totalTax = 0;
    const orderItems = data.orderItems
      .map((item) => {
        const menuItem = menuItems.find((mi) => mi.id === item.menuItemId);
        if (!menuItem) {
          errorLogger("Menu item not found in order processing", {
            menuItemId: item.menuItemId,
          });
          return null; // We'll filter these out below
        }

        // Convert price and taxPercent to numbers if they're not already
        const price =
          typeof menuItem.price === "string"
            ? parseFloat(menuItem.price)
            : Number(menuItem.price);

        const taxPercent =
          typeof menuItem.taxPercent === "string"
            ? parseFloat(menuItem.taxPercent)
            : Number(menuItem.taxPercent);

        const itemPrice = price * item.quantity;
        total += itemPrice;
        totalTax += (itemPrice * taxPercent) / 100;

        return {
          quantity: item.quantity,
          message: item.message,
          price: price.toString(),
          taxPercent: taxPercent.toString(),
          menuItemId: item.menuItemId,
        };
      })
      .filter(Boolean); // Remove any null items

    // Double-check that we have all items after the mapping process
    if (orderItems.length !== data.orderItems.length) {
      return {
        success: false,
        message: "Some menu items could not be processed",
        errorCode: 400,
        errorType: ErrorResponseTypes.HTTP_ERROR,
      };
    }

    debugLogger("Calculated order totals", {
      total,
      tax: totalTax,
      items: orderItems.length,
    });

    // Create the order
    const orderData = {
      status: OrderStatus.NEW,
      message: data.message,
      total: total.toString(),
      tax: totalTax.toString(),
      customerId: user.id, // Use authenticated user ID instead of passed customerId
      restaurantId: data.restaurantId,
      deliveryFee: (data.deliveryFee ?? 2.99).toString(),
      paymentMethod: data.paymentMethod,
      driverTip: data.driverTip ? data.driverTip.toString() : null,
      restaurantTip: data.restaurantTip ? data.restaurantTip.toString() : null,
      projectTip: data.projectTip ? data.projectTip.toString() : null,
    };

    if (orderId) {
      orderData.id = orderId;
    }

    const createdOrder = await orderRepository.createOrder(orderData);

    // Create order items for the order
    for (const item of orderItems) {
      await orderRepository.createOrderItem({
        orderId: createdOrder.id,
        menuItemId: item.menuItemId,
        quantity: item.quantity,
        price: item.price,
        taxPercent: item.taxPercent,
        message: item.message,
      });
    }

    // Create delivery record if delivery information is provided
    if (data.delivery) {
      await orderRepository.createDelivery({
        orderId: createdOrder.id,
        status: "PENDING",
        type: data.delivery.type,
        distance: data.delivery.distance?.toString(),
        estimatedPreparationTime: data.delivery.estimatedPreparationTime,
        estimatedDeliveryTime: data.delivery.estimatedDeliveryTime,
        street: data.delivery.street,
        streetNumber: data.delivery.streetNumber,
        zip: data.delivery.zip,
        city: data.delivery.city,
        phone: data.delivery.phone,
        latitude: data.delivery.latitude?.toString(),
        longitude: data.delivery.longitude?.toString(),
        countryId: data.delivery.countryId,
        driverId: data.delivery.driverId,
        message: data.delivery.message,
      });
    }

    // Get the complete order with all related data
    const completeOrder = await orderRepository.findByIdWithDetails(
      createdOrder.id,
    );

    if (!completeOrder) {
      throw new Error(
        `Failed to retrieve created order with ID ${createdOrder.id}`,
      );
    }

    debugLogger("Order created successfully", { orderId: createdOrder.id });

    return {
      data: completeOrder,
      success: true,
    };
  } catch (err) {
    const error = err as Error;
    errorLogger("Error creating order", error);
    return {
      success: false,
      message: `Error creating order: ${error instanceof Error ? error.message : "Unknown error"}`,
      errorCode: 500,
      errorType: ErrorResponseTypes.HTTP_ERROR,
    };
  }
};
