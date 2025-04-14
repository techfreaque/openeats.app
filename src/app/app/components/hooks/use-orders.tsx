"use client";

import type { ReactNode } from "react";
import type { JSX } from "react";
import { useOrders as useApiOrders } from "../../../api/v1/order/hooks";
import type { OrderResponseType, OrderStatus } from "../../../api/v1/order/schema";

/**
 * Re-export the order types from the API schema
 */
export { OrderStatus } from "../../../api/v1/order/schema";

/**
 * Legacy OrderItem interface for backward compatibility
 */
/**
 * Legacy OrderItem interface for backward compatibility
 * With strict typing for exactOptionalPropertyTypes
 */
export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string | undefined;
}

/**
 * Legacy Order interface for backward compatibility
 * With strict typing for exactOptionalPropertyTypes
 */
export interface Order {
  id: string;
  userId: string;
  restaurantId: string;
  restaurantName: string;
  items: OrderItem[];
  status: OrderStatus;
  total: number;
  subtotal: number;
  deliveryFee: number;
  serviceFee: number;
  tax: number;
  deliveryAddress?: string | undefined;
  deliveryInstructions?: string | undefined;
  isDelivery: boolean;
  driverId?: string | undefined;
  driverName?: string | undefined;
  createdAt: string;
  estimatedDeliveryTime: string;
}

/**
 * Hook for using orders
 * This is a wrapper around the API orders hook to maintain backward compatibility
 */
export function useOrders() {
  const {
    orders: apiOrders,
    currentOrder: apiCurrentOrder,
    isLoading,
    error: apiError,
    placeOrder,
    getOrderById: apiGetOrderById,
    cancelOrder,
  } = useApiOrders();

  const convertApiOrderToLegacyOrder = (apiOrder: OrderResponseType): Order => {
    const typedOrder = apiOrder as unknown as {
      id: string;
      customerId: string;
      total: number;
      deliveryFee: number;
      driverTip: number | null;
      restaurantTip: number | null;
      projectTip: number | null;
      createdAt: string | Date;
      restaurant: { id: string; name: string };
      delivery?: {
        street?: string;
        streetNumber?: string;
        city?: string;
        zip?: string;
        message?: string;
        type?: string;
        estimatedDeliveryTime?: number;
        driver?: { id?: string; user?: { firstName?: string } };
      };
      orderItems: Array<{
        id: string;
        menuItemId: string;
        price: number;
        quantity: number;
      }>;
      status: string;
    };
    
    const mappedItems: OrderItem[] = typedOrder.orderItems.map(item => {
      const orderItem: OrderItem = {
        id: item.id,
        name: item.menuItemId || "Unknown Item", // Provide default for type safety
        price: item.price,
        quantity: item.quantity,
        image: undefined, // This would need to be fetched from menu item
      };
      return orderItem;
    });

    const subtotal = typedOrder.total - 
      (typedOrder.deliveryFee || 0) - 
      (typedOrder.driverTip || 0) - 
      (typedOrder.restaurantTip || 0) - 
      (typedOrder.projectTip || 0);

    const deliveryAddress = typedOrder.delivery ? 
      `${typedOrder.delivery.street || ''} ${typedOrder.delivery.streetNumber || ''}, ${typedOrder.delivery.city || ''}, ${typedOrder.delivery.zip || ''}` : 
      undefined;

    const deliveryInstructions = typedOrder.delivery?.message || undefined;

    const isDelivery = typedOrder.delivery?.type === "DELIVERY";

    const driverId = typedOrder.delivery?.driver?.id;
    const driverName = typedOrder.delivery?.driver?.user?.firstName;

    const createdAt = typeof typedOrder.createdAt === 'string' ? 
      typedOrder.createdAt : 
      typedOrder.createdAt.toISOString();

    const estimatedDeliveryTime = new Date(
      new Date(createdAt).getTime() + 
      (typedOrder.delivery?.estimatedDeliveryTime || 30) * 60 * 1000
    ).toISOString();

    const result: Order = {
      id: typedOrder.id,
      userId: typedOrder.customerId,
      restaurantId: typedOrder.restaurant.id,
      restaurantName: typedOrder.restaurant.name,
      items: mappedItems,
      status: typedOrder.status as OrderStatus, // Type conversion for backward compatibility
      total: typedOrder.total,
      subtotal,
      deliveryFee: typedOrder.deliveryFee || 0,
      serviceFee: 0, // Not in new API
      tax: 0, // Not directly in new API
      deliveryAddress,
      deliveryInstructions,
      isDelivery,
      driverId,
      driverName,
      createdAt,
      estimatedDeliveryTime,
    };

    return result;
  };

  const orders = apiOrders.map(convertApiOrderToLegacyOrder);
  
  const currentOrder = apiCurrentOrder ? convertApiOrderToLegacyOrder(apiCurrentOrder) : null;
  
  const error = apiError ? apiError.message : null;
  
  const getOrderById = (id: string): Order | null => {
    const apiOrder = apiGetOrderById(id);
    return apiOrder ? convertApiOrderToLegacyOrder(apiOrder) : null;
  };

  return {
    orders,
    currentOrder,
    isLoading,
    error,
    placeOrder,
    getOrderById,
    cancelOrder,
  };
}

/**
 * OrderProvider is no longer needed as we're using zustand store hooks
 * This is kept as a no-op component for backward compatibility
 */
export function OrderProvider({ children }: { children: ReactNode }): JSX.Element {
  return <>{children}</>;
}
