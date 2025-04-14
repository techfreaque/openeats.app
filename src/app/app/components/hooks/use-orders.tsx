"use client";

import type { ReactNode } from "react";
import type { JSX } from "react";
import { useOrders as useApiOrders } from "@/app/api/v1/order/hooks";
import type { OrderResponseType, OrderStatus } from "@/app/api/v1/order/schema";

/**
 * Re-export the order types from the API schema
 */
export { OrderStatus } from "@/app/api/v1/order/schema";

/**
 * Legacy OrderItem interface for backward compatibility
 */
export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

/**
 * Legacy Order interface for backward compatibility
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
  deliveryAddress?: string;
  deliveryInstructions?: string;
  isDelivery: boolean;
  driverId?: string;
  driverName?: string;
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
    const items: OrderItem[] = apiOrder.orderItems.map(item => {
      return {
        id: item.id,
        name: item.menuItemId || "Unknown Item", // Provide default for type safety
        price: item.price,
        quantity: item.quantity,
        image: undefined, // This would need to be fetched from menu item
      };
    });

    const subtotal = apiOrder.total - 
      (apiOrder.deliveryFee || 0) - 
      (apiOrder.driverTip || 0) - 
      (apiOrder.restaurantTip || 0) - 
      (apiOrder.projectTip || 0);

    const deliveryAddress = apiOrder.delivery ? 
      `${apiOrder.delivery.street || ''} ${apiOrder.delivery.streetNumber || ''}, ${apiOrder.delivery.city || ''}, ${apiOrder.delivery.zip || ''}` : 
      undefined;

    const deliveryInstructions = apiOrder.delivery?.message || undefined;

    const isDelivery = apiOrder.delivery?.type === "DELIVERY";

    const driverId = apiOrder.delivery?.driver?.id;
    const driverName = apiOrder.delivery?.driver?.user?.firstName;

    const createdAt = typeof apiOrder.createdAt === 'string' ? 
      apiOrder.createdAt : 
      apiOrder.createdAt.toISOString();

    const estimatedDeliveryTime = new Date(
      new Date(createdAt).getTime() + 
      (apiOrder.delivery?.estimatedDeliveryTime || 30) * 60 * 1000
    ).toISOString();

    const order: Order = {
      id: apiOrder.id,
      userId: apiOrder.customerId,
      restaurantId: apiOrder.restaurant.id,
      restaurantName: apiOrder.restaurant.name,
      items,
      status: apiOrder.status as unknown as OrderStatus, // Type conversion for backward compatibility
      total: apiOrder.total,
      subtotal,
      deliveryFee: apiOrder.deliveryFee || 0,
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

    return order;
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
