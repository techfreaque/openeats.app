"use client";

import { useApiMutation } from "next-vibe/client/hooks/mutation";
import { useApiQuery } from "next-vibe/client/hooks/query";
import { useApiStore } from "next-vibe/client/hooks/store";
import { useTranslation } from "next-vibe/i18n";
import { toast } from "next-vibe-ui/ui";
import { useCallback, useMemo } from "react";

import { useAuth } from "../auth/hooks/useAuth";
import orderEndpoint from "./definition";
import type {
  OrderCreateType,
  OrderResponseType,
  OrdersResponseType,
  OrderUpdateType,
} from "./schema";
import { OrderStatus } from "./schema";

/**
 * Type for empty parameters
 */
type EmptyParams = object;

/**
 * Hook for managing orders
 * @returns Object with orders data and methods to place/cancel orders
 */
export const useOrders = () => {
  const { user } = useAuth();
  const { t } = useTranslation();

  const queryKey = ["orders", user?.id || "anonymous"];

  const {
    data,
    isLoading: isLoadingOrders,
    error,
  } = useApiQuery<EmptyParams, OrdersResponseType, EmptyParams, "default">(
    orderEndpoint,
    {},
    {},
    {
      enabled: !!user,
      queryKey,
    },
  );

  const { mutateAsync: placeOrderMutation, isLoading: isPlacingOrder } =
    useApiMutation<OrderResponseType, OrderCreateType, EmptyParams, "default">(
      orderEndpoint,
      {
        onSuccess: (responseData) => {
          toast({
            title: t("order.placed", "Order placed"),
            description: t(
              "order.placedDescription",
              "Your order has been placed successfully",
            ),
          });
          useApiStore.getState().invalidateQueries(queryKey);
        },
        onError: (data: {
          error: Error;
          requestData: OrderCreateType;
          pathParams: EmptyParams;
        }) => {
          toast({
            title: t("error", "Error"),
            description:
              data.error.message ||
              t("order.errorPlacing", "Failed to place order"),
            variant: "destructive",
          });
        },
      },
    );

  const { mutateAsync: updateOrderMutation, isLoading: isUpdatingOrder } =
    useApiMutation<
      OrderResponseType,
      OrderUpdateType,
      { id: string },
      "default"
    >(orderEndpoint, {
      onSuccess: (responseData) => {
        if (responseData.responseData.status === "CANCELLED") {
          toast({
            title: t("order.cancelled", "Order cancelled"),
            description: t(
              "order.cancelledDescription",
              "Your order has been cancelled",
            ),
          });
        } else {
          toast({
            title: t("order.updated", "Order updated"),
            description: t(
              "order.updatedDescription",
              "Your order has been updated",
            ),
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
          description:
            data.error.message ||
            t("order.errorUpdating", "Failed to update order"),
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
          description: t(
            "auth.signInToOrder",
            "Please sign in to place an order",
          ),
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
    [placeOrderMutation, user, t],
  );

  const cancelOrder = useCallback(
    async (id: string): Promise<boolean> => {
      if (!user) {
        toast({
          title: t("auth.signInRequired", "Sign in required"),
          description: t(
            "auth.signInToCancel",
            "Please sign in to cancel an order",
          ),
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
    [updateOrderMutation, user, t],
  );

  const getOrderById = useCallback(
    (id: string): OrderResponseType | null => {
      if (!data) {
        return null;
      }

      return data.find((order) => order.id === id) || null;
    },
    [data],
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
