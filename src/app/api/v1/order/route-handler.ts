import type { ApiHandlerCallBackFunctionType } from "next-vibe/server/endpoints/core/api-handler";
import type { UndefinedType } from "next-vibe/shared/types/common.schema";

import { db } from "../../db";
import {
  type OrderCreateType,
  type OrderResponseType,
  OrderStatus,
} from "./order.schema";

export const createOrder: ApiHandlerCallBackFunctionType<
  OrderCreateType,
  OrderResponseType,
  UndefinedType
> = async ({ data }, orderId?: string) => {
  // Check if restaurant exists
  const restaurant = await db.partner.findUnique({
    where: { id: data.restaurantId },
  });
  if (!restaurant) {
    return {
      success: false,
      message: `Restaurant ${data.restaurantId} not found`,
      errorCode: 404,
    };
  }

  try {
    // Create order with delivery
    const menuItems = await db.menuItem.findMany({
      where: {
        id: { in: data.orderItems.map((item) => item.menuItemId) },
      },
    });
    let total = 0;
    let totalTax = 0;
    const orderItems = data.orderItems.map((item) => {
      const menuItem = Object.values(menuItems).find(
        (mi) => mi.id === item.menuItemId,
      );
      if (!menuItem) {
        throw new Error(`Menu item ${item.menuItemId} not found`);
      }
      total += menuItem.price * item.quantity;
      totalTax += (menuItem.price * item.quantity * menuItem.taxPercent) / 100;
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
    const order: OrderResponseType = (await db.order.create({
      data: {
        ...(orderId ? { id: orderId } : {}),
        status: OrderStatus.NEW,
        message: data.message,
        total,
        tax: totalTax,
        customer: {
          connect: {
            id: data.customerId,
          },
        },
        orderItems: {
          create: orderItems,
        },
        deliveryFee: data.deliveryFee,
        paymentMethod: data.paymentMethod,
        driverTip: data.driverTip,
        restaurantTip: data.restaurantTip,
        projectTip: data.projectTip,
        restaurant: {
          connect: {
            id: data.restaurantId,
          },
        },
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
                createdAt: true,
                user: {
                  select: {
                    firstName: true,
                  },
                },
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
            lastName: true,
            firstName: true,
          },
        },
      },
    })) as OrderResponseType;
    return {
      data: order,
      success: true,
    };
  } catch (err) {
    const error = err as Error;
    return {
      success: false,
      message: `Error creating order: ${error.message}`,
      errorCode: 500,
    };
  }
};
