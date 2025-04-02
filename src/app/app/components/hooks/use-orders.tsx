"use client";

import type React from "react";
import { createContext, useContext, useEffect, useState } from "react";

import { useAuth } from "@/app/api/v1/auth/hooks/useAuth";

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "preparing"
  | "ready_for_pickup"
  | "out_for_delivery"
  | "delivered"
  | "cancelled";

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

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

interface OrderContextType {
  orders: Order[];
  currentOrder: Order | null;
  isLoading: boolean;
  error: string | null;
  placeOrder: (
    order: Omit<Order, "id" | "status" | "createdAt" | "estimatedDeliveryTime">,
  ) => Promise<Order>;
  getOrderById: (id: string) => Order | null;
  cancelOrder: (id: string) => Promise<boolean>;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

// Mock orders data
const mockOrders: Order[] = [
  {
    id: "order-1",
    userId: "1",
    restaurantId: "1",
    restaurantName: "Burger Joint",
    items: [
      {
        id: "101",
        name: "Classic Cheeseburger",
        price: 8.99,
        quantity: 2,
        image: "/placeholder.svg?height=80&width=80",
      },
      {
        id: "104",
        name: "French Fries",
        price: 3.99,
        quantity: 1,
        image: "/placeholder.svg?height=80&width=80",
      },
    ],
    status: "delivered",
    total: 28.76,
    subtotal: 21.97,
    deliveryFee: 2.99,
    serviceFee: 1.99,
    tax: 1.81,
    deliveryAddress: "123 Main St, Anytown, USA",
    isDelivery: true,
    driverId: "driver-1",
    driverName: "John D.",
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    estimatedDeliveryTime: new Date(
      Date.now() - 2 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000,
    ).toISOString(),
  },
  {
    id: "order-2",
    userId: "1",
    restaurantId: "3",
    restaurantName: "Sushi World",
    items: [
      {
        id: "301",
        name: "California Roll",
        price: 7.99,
        quantity: 2,
        image: "/placeholder.svg?height=80&width=80",
      },
      {
        id: "305",
        name: "Miso Soup",
        price: 3.99,
        quantity: 1,
        image: "/placeholder.svg?height=80&width=80",
      },
    ],
    status: "out_for_delivery",
    total: 24.56,
    subtotal: 19.97,
    deliveryFee: 2.99,
    serviceFee: 1.99,
    tax: 1.65,
    deliveryAddress: "123 Main St, Anytown, USA",
    isDelivery: true,
    driverId: "driver-2",
    driverName: "Sarah L.",
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    estimatedDeliveryTime: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
  },
];

export function OrderProvider({
  children,
}: {
  children: React.ReactNode;
}): React.JSX.Element {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Load user's orders
    if (user) {
      setIsLoading(true);
      // Simulate API call delay
      setTimeout(() => {
        // Filter orders for the current user
        const userOrders = mockOrders.filter(
          (order) => order.userId === user.id,
        );
        setOrders(userOrders);
        setIsLoading(false);
      }, 1000);
    } else {
      setOrders([]);
    }
  }, [user]);

  // Add proper return types to all functions
  const placeOrder = async (
    orderData: Omit<
      Order,
      "id" | "status" | "createdAt" | "estimatedDeliveryTime"
    >,
  ): Promise<Order> => {
    setIsLoading(true);
    setError(null);

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 2000));

    try {
      const newOrder: Order = {
        ...orderData,
        id: `order-${Date.now()}`,
        status: "confirmed",
        createdAt: new Date().toISOString(),
        estimatedDeliveryTime: new Date(
          Date.now() + 30 * 60 * 1000,
        ).toISOString(),
      };

      // Add to orders list
      setOrders((prevOrders) => [newOrder, ...prevOrders]);

      // Set as current order
      setCurrentOrder(newOrder);

      setIsLoading(false);
      return newOrder;
    } catch (err) {
      setError("Failed to place order. Please try again.");
      setIsLoading(false);
      throw new Error("Failed to place order");
    }
  };

  const getOrderById = (id: string): Order | null => {
    return orders.find((order) => order.id === id) || null;
  };

  const cancelOrder = async (id: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    try {
      // Find the order
      const orderIndex = orders.findIndex((order) => order.id === id);

      if (orderIndex === -1) {
        setError("Order not found");
        setIsLoading(false);
        return false;
      }

      // Check if order can be cancelled
      const order = orders[orderIndex];
      if (
        order.status !== "pending" &&
        order.status !== "confirmed" &&
        order.status !== "preparing"
      ) {
        setError("This order cannot be cancelled");
        setIsLoading(false);
        return false;
      }

      // Update order status
      const updatedOrders = [...orders];
      updatedOrders[orderIndex] = {
        ...order,
        status: "cancelled",
      };

      setOrders(updatedOrders);

      // If this is the current order, update it
      if (currentOrder && currentOrder.id === id) {
        setCurrentOrder({
          ...currentOrder,
          status: "cancelled",
        });
      }

      setIsLoading(false);
      return true;
    } catch (err) {
      setError("Failed to cancel order");
      setIsLoading(false);
      return false;
    }
  };

  return (
    <OrderContext.Provider
      value={{
        orders,
        currentOrder,
        isLoading,
        error,
        placeOrder,
        getOrderById,
        cancelOrder,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
}

export function useOrders(): OrderContextType {
  const context = useContext(OrderContext);
  if (context === undefined) {
    throw new Error("useOrders must be used within an OrderProvider");
  }
  return context;
}
