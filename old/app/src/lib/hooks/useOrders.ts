import { useEffect, useState } from "react";

import { useUserType } from "../../app/context/UserTypeContext";
import type { Order } from "../../types";
import { isApiAvailable, ordersApi } from "../api-client";
import { useCart } from "./useCart";

export function useOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { userType } = useUserType();
  const { clearCart } = useCart();

  const fetchOrders = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const apiAvailable = await isApiAvailable();

      if (apiAvailable) {
        // The API will filter orders based on the user's role
        const response = await ordersApi.getOrders();
        setOrders(response.orders || response);
      } else {
        setError("API is unavailable.");
        setOrders([]);
      }
    } catch (err) {
      console.error("Error fetching orders:", err);
      setError("Failed to load orders");
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  };

  const getOrderById = async (id: string) => {
    try {
      const apiAvailable = await isApiAvailable();

      if (apiAvailable) {
        const response = await ordersApi.getOrder(id);
        return response.order || response;
      } else {
        setError("API is unavailable.");
        return null;
      }
    } catch (err) {
      console.error(`Error fetching order ${id}:`, err);
      setError(`Failed to fetch order ${id}`);
      return null;
    }
  };

  const placeOrder = async (orderData: any) => {
    try {
      const apiAvailable = await isApiAvailable();

      if (apiAvailable) {
        const response = await ordersApi.createOrder({
          restaurantId: orderData.restaurant_id,
          customerName: orderData.customer_name || "Guest User",
          customerPhone: orderData.customer_phone || "555-555-5555",
          customerAddress: orderData.delivery_address,
          items: orderData.items,
          total: orderData.total,
          paymentMethod: orderData.payment_method,
        });

        // Clear cart after successful order
        await clearCart();

        // Refresh orders list
        await fetchOrders();

        return response.id || response.order?.id;
      } else {
        setError("API is unavailable.");
        return null;
      }
    } catch (err) {
      console.error("Error placing order:", err);
      setError("Failed to place order");
      return null;
    }
  };

  const updateOrderStatus = async (id: string, status: string) => {
    try {
      const apiAvailable = await isApiAvailable();

      if (apiAvailable) {
        await ordersApi.updateOrderStatus(id, status);

        // Update local state
        setOrders((prev) =>
          prev.map((order) =>
            order.id === id ? { ...order, status: status as any } : order,
          ),
        );

        return true;
      } else {
        setError("API is unavailable.");
        return false;
      }
    } catch (err) {
      console.error(`Error updating order ${id} status:`, err);
      setError("Failed to update order status");
      return false;
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [userType]);

  return {
    orders,
    isLoading,
    error,
    fetchOrders,
    getOrderById,
    placeOrder,
    updateOrderStatus,
  };
}
