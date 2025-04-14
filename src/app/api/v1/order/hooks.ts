"use client";

import { useCallback, useMemo } from "react";
import { toast } from "@/components/ui/use-toast";
import { useApiQuery } from "next-vibe/client/hooks/query";
import { useApiMutation } from "next-vibe/client/hooks/mutation";
import { useAuth } from "../auth/hooks/useAuth";
import { translations } from "@/translations";
import { useApiStore } from "next-vibe/client/hooks/store";

import orderEndpoint from "./definition";
import { 
  OrderCreateType,
  OrderResponseType,
  OrdersResponseType,
  OrderStatus,
  OrderUpdateType
} from "./schema";

/**
 * Create a type-safe translation function
 */
const createTranslator = () => {
  return (key: string, fallback?: string): string => {
    const parts = key.split(".");
    let current: Record<string, unknown> = translations.EN;
    
    for (const part of parts) {
      if (current && typeof current === "object" && part in current) {
        const value = current[part];
        current = value as Record<string, unknown>;
      } else {
        return fallback || key;
      }
    }
    
    return typeof current === "string" ? current : fallback || key;
  };
};

/**
 * Hook for managing orders
 * @returns Object with orders data and methods to place/cancel orders
 */
export const useOrders = () => {
  const { user } = useAuth();
  const t = createTranslator();
  
  const queryKey = ["orders", user?.id || "anonymous"];
  
  const {
    data,
    isLoading: isLoadingOrders,
    error,
  } = useApiQuery<Record<string, never>, OrdersResponseType, Record<string, never>, "default">(
    orderEndpoint,
    {},
    {},
    {
      enabled: !!user,
      queryKey,
    }
  );
  
  const { mutateAsync: placeOrderMutation, isLoading: isPlacingOrder } = useApiMutation<
    OrderResponseType,
    OrderCreateType,
    Record<string, never>,
    "default"
  >(orderEndpoint, {
    onSuccess: (responseData) => {
      toast({
        title: t("order.placed", "Order placed"),
        description: t("order.placedDescription", "Your order has been placed successfully"),
      });
      useApiStore.getState().invalidateQueries(queryKey);
    },
    onError: (data: { 
      error: Error; 
      requestData: OrderCreateType; 
      pathParams: Record<string, never>; 
    }) => {
      toast({
        title: t("error", "Error"),
        description: data.error.message || t("order.errorPlacing", "Failed to place order"),
        variant: "destructive",
      });
    },
  });
  
  const { mutateAsync: updateOrderMutation, isLoading: isUpdatingOrder } = useApiMutation<
    OrderResponseType,
    OrderUpdateType,
    { id: string },
    "default"
  >(orderEndpoint, {
    onSuccess: (responseData) => {
      if (responseData.responseData.status === "CANCELLED") {
        toast({
          title: t("order.cancelled", "Order cancelled"),
          description: t("order.cancelledDescription", "Your order has been cancelled"),
        });
      } else {
        toast({
          title: t("order.updated", "Order updated"),
          description: t("order.updatedDescription", "Your order has been updated"),
        });
      }
      useApiStore.getState().invalidateQueries(queryKey);
    },
    onError: (data: { 
      error: Error; 
      requestData: OrderUpdateType; 
      pathParams: { id: string }; 
    }) => {
      toast({
        title: t("error", "Error"),
        description: data.error.message || t("order.errorUpdating", "Failed to update order"),
        variant: "destructive",
      });
    },
  });
  
  const placeOrder = useCallback(
    async (orderData: OrderCreateType): Promise<OrderResponseType> => {
      if (!user) {
        const error = new Error(t("auth.signInRequired", "Sign in required"));
        toast({
          title: t("auth.signInRequired", "Sign in required"),
          description: t("auth.signInToOrder", "Please sign in to place an order"),
          variant: "destructive",
        });
        throw error;
      }
      
      const response = await placeOrderMutation({
        requestData: orderData,
        urlParams: {},
      });
      
      return response.responseData;
    },
    [placeOrderMutation, user, t]
  );
  
  const cancelOrder = useCallback(
    async (id: string): Promise<boolean> => {
      if (!user) {
        toast({
          title: t("auth.signInRequired", "Sign in required"),
          description: t("auth.signInToCancel", "Please sign in to cancel an order"),
          variant: "destructive",
        });
        return false;
      }
      
      try {
        await updateOrderMutation({
          requestData: { status: OrderStatus.CANCELLED, message: null },
          urlParams: { id },
        });
        return true;
      } catch (error) {
        return false;
      }
    },
    [updateOrderMutation, user, t]
  );
  
  const getOrderById = useCallback(
    (id: string): OrderResponseType | null => {
      if (!data) {
        return null;
      }
      
      return data.find((order) => order.id === id) || null;
    },
    [data]
  );
  
  const currentOrder = useMemo(() => {
    if (!data || data.length === 0) {
      return null;
    }
    
    return [...data].sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    })[0];
  }, [data]);
  
  return {
    orders: data || [],
    currentOrder,
    isLoading: isLoadingOrders || isPlacingOrder || isUpdatingOrder,
    error,
    placeOrder,
    getOrderById,
    cancelOrder,
  };
};
