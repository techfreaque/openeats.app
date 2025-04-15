"use client";

/**
 * Cart API hooks for client-side usage
 * These hooks provide a convenient way to interact with the cart API
 *
 * This file includes both simplified API hooks using the next-vibe pattern
 * and a more complex useCart hook for comprehensive cart management
 */

import { useApiForm, useApiQueryForm } from "next-vibe/client/hooks/api";
import type { UseApiFormOptions } from "next-vibe/client/hooks/api/use-api-form";
import type { UseApiQueryFormOptions } from "next-vibe/client/hooks/api/use-api-query-form";
import { useApiMutation } from "next-vibe/client/hooks/mutation";
import { useApiQuery } from "next-vibe/client/hooks/query";
import { useApiStore } from "next-vibe/client/hooks/store";
import { useCallback, useMemo } from "react";

import { useAuth } from "@/app/api/v1/auth/hooks/useAuth";
import type { MenuItemResponseType } from "@/app/api/v1/restaurant/schema/menu.schema";
import { toast } from "@/components/ui/use-toast";
import { useTranslation } from "@/translations";

import type {
  CartItemCreateType,
  CartItemResponseType,
  CartItemUpdateType,
} from "./definition";
import cartEndpoints from "./definition";

/**
 * Cart item type with menu item details
 */
export interface CartItem {
  id: string;
  menuItemId: string;
  quantity: number;
  specialInstructions?: string | null;
  menuItem: MenuItemResponseType & { partnerId: string };
}

/**
 * Cart response type
 */
export interface CartResponseType {
  items: CartItem[];
  restaurantId: string | null;
  subtotal: number;
  deliveryFee: number;
  serviceFee: number;
  tax: number;
  total: number;
  itemCount: number;
}

/**
 * Helper function to calculate cart totals
 */
function calculateCartTotals(items: CartItem[]): {
  subtotal: number;
  deliveryFee: number;
  serviceFee: number;
  tax: number;
  total: number;
  itemCount: number;
} {
  const subtotal = items.reduce(
    (sum, item) => sum + (item.menuItem.price || 0) * item.quantity,
    0,
  );
  const deliveryFee = items.length > 0 ? 2.99 : 0;
  const serviceFee = subtotal > 0 ? 1.99 : 0;
  const tax = subtotal * 0.0825; // 8.25% tax rate

  return {
    subtotal,
    deliveryFee,
    serviceFee,
    tax,
    total: subtotal + deliveryFee + serviceFee + tax,
    itemCount: items.reduce((count, item) => count + item.quantity, 0),
  };
}

/**
 * Hook for using the cart
 * @returns Cart functionality
 */
export function useCart(): {
  items: CartItem[];
  restaurantId: string | null;
  addItem: (
    menuItem: MenuItemResponseType & { partnerId: string },
    quantity: number,
    specialInstructions?: string,
  ) => Promise<void>;
  removeItem: (id: string) => Promise<void>;
  updateQuantity: (id: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  getSubtotal: () => number;
  getTotal: () => number;
  getDeliveryFee: () => number;
  getServiceFee: () => number;
  getTax: () => number;
  itemCount: number;
  isLoading: boolean;
} {
  const { user } = useAuth();
  const { t } = useTranslation();

  // Create a store key based on user ID
  const storeKey = `cart-${user?.id || "anonymous"}`;

  // Get or initialize cart state from the store
  const cartState = useApiStore<CartResponseType>((state) => {
    return (
      (state.customState[storeKey] as CartResponseType) || {
        items: [],
        restaurantId: null,
        subtotal: 0,
        deliveryFee: 0,
        serviceFee: 0,
        tax: 0,
        total: 0,
        itemCount: 0,
      }
    );
  });

  // Set cart state in the store
  const setCartState = useCallback(
    (newState: CartResponseType) => {
      useApiStore.setState((state) => ({
        customState: {
          ...state.customState,
          [storeKey]: newState,
        },
      }));
    },
    [storeKey],
  );

  // Fetch cart data from server for authenticated users
  const { isLoading, refetch } = useApiQuery<
    Record<string, never>,
    CartItemResponseType[],
    Record<string, never>,
    "default"
  >(
    cartEndpoints.GET,
    {},
    {},
    {
      enabled: !!user,
      onSuccess: (data) => {
        if (data && Array.isArray(data)) {
          // Transform API response to CartResponseType
          const items: CartItem[] = data.map((item) => ({
            id: item.id,
            menuItemId: item.menuItemId,
            quantity: item.quantity,
            specialInstructions: item.specialInstructions,
            menuItem: {
              id: item.menuItem.id,
              name: item.menuItem.name,
              description: item.menuItem.description,
              price: item.menuItem.price,
              image: item.menuItem.image,
              taxPercent: item.menuItem.taxPercent,
              partnerId: item.restaurantId,
              categoryId: item.menuItem.categoryId,
              isAvailable: item.menuItem.isAvailable,
            } as MenuItemResponseType & { partnerId: string },
          }));

          const { subtotal, deliveryFee, serviceFee, tax, total, itemCount } =
            calculateCartTotals(items);

          setCartState({
            items,
            restaurantId:
              data.length > 0 ? data[0]?.restaurantId || null : null,
            subtotal,
            deliveryFee,
            serviceFee,
            tax,
            total,
            itemCount,
          });
        }
      },
    },
  );

  // API mutations
  const { mutateAsync: addItemMutation } = useApiMutation<
    CartItemResponseType,
    CartItemCreateType,
    Record<string, never>,
    "default"
  >(cartEndpoints.POST, {
    onSuccess: () => {
      refetch();
    },
    onError: (data: { error: Error }) => {
      toast({
        title: t("common.error", "Error"),
        description:
          data.error.message ||
          t("cart.addItemError", "Failed to add item to cart"),
        variant: "destructive",
      });
    },
  });

  const { mutateAsync: updateItemMutation } = useApiMutation<
    CartItemResponseType,
    CartItemUpdateType,
    { id: string },
    "default"
  >(cartEndpoints.PUT, {
    onSuccess: () => {
      refetch();
    },
    onError: (data: { error: Error }) => {
      toast({
        title: t("common.error", "Error"),
        description:
          data.error.message ||
          t("cart.updateItemError", "Failed to update cart item"),
        variant: "destructive",
      });
    },
  });

  const { mutateAsync: removeItemMutation } = useApiMutation<
    Record<string, never>,
    Record<string, never>,
    { id: string },
    "default"
  >(cartEndpoints.DELETE, {
    onSuccess: () => {
      refetch();
    },
    onError: (data: { error: Error }) => {
      toast({
        title: t("common.error", "Error"),
        description:
          data.error.message ||
          t("cart.removeItemError", "Failed to remove cart item"),
        variant: "destructive",
      });
    },
  });

  const { mutateAsync: clearCartMutation } = useApiMutation<
    Record<string, never>,
    Record<string, never>,
    Record<string, never>,
    "default"
  >(cartEndpoints.CLEAR, {
    onSuccess: () => {
      refetch();
    },
    onError: (data: { error: Error }) => {
      toast({
        title: t("common.error", "Error"),
        description:
          data.error.message ||
          t("cart.clearCartError", "Failed to clear cart"),
        variant: "destructive",
      });
    },
  });

  // Helper function to update local cart
  const updateLocalCart = useCallback(
    (items: CartItem[], restaurantId: string | null) => {
      const { subtotal, deliveryFee, serviceFee, tax, total, itemCount } =
        calculateCartTotals(items);

      setCartState({
        items,
        restaurantId,
        subtotal,
        deliveryFee,
        serviceFee,
        tax,
        total,
        itemCount,
      });
    },
    [setCartState],
  );

  // Add item to cart
  const addItem = useCallback(
    async (
      menuItem: MenuItemResponseType & { partnerId: string },
      quantity: number,
      specialInstructions?: string,
    ): Promise<void> => {
      if (user) {
        try {
          await addItemMutation({
            requestData: {
              menuItemId: menuItem.id,
              restaurantId: menuItem.partnerId,
              quantity,
              specialInstructions: specialInstructions || null,
            },
            urlParams: {},
          });

          toast({
            title: t("cart.itemAdded", "Added to cart"),
            description: `${quantity} × ${menuItem.name} ${t("cart.addedToCart", "added to your cart")}`,
          });
        } catch (error) {
          // Error is handled in the mutation options
        }
      } else {
        // For non-authenticated users, handle cart in localStorage
        if (
          cartState.restaurantId &&
          menuItem.partnerId !== cartState.restaurantId &&
          cartState.items.length > 0
        ) {
          const confirmed = window.confirm(
            t(
              "cart.differentRestaurantWarning",
              "Adding items from a different restaurant will clear your current cart. Continue?",
            ),
          );

          if (!confirmed) {
            return;
          }

          setCartState({
            items: [],
            restaurantId: null,
            subtotal: 0,
            deliveryFee: 0,
            serviceFee: 0,
            tax: 0,
            total: 0,
            itemCount: 0,
          });
        }

        const existingItemIndex = cartState.items.findIndex(
          (item) => item.menuItemId === menuItem.id,
        );

        if (existingItemIndex >= 0) {
          const updatedItems = [...cartState.items];
          const existingItem = updatedItems[existingItemIndex];

          if (existingItem) {
            updatedItems[existingItemIndex] = {
              ...existingItem,
              quantity: existingItem.quantity + quantity,
              specialInstructions: specialInstructions || null,
            };

            updateLocalCart(updatedItems, menuItem.partnerId);
          }
        } else {
          const newItem: CartItem = {
            id: `${menuItem.id}-${Date.now()}`, // Unique ID for cart item
            menuItemId: menuItem.id,
            quantity,
            specialInstructions: specialInstructions || null,
            menuItem,
          };

          updateLocalCart([...cartState.items, newItem], menuItem.partnerId);
        }

        toast({
          title: t("cart.itemAdded", "Added to cart"),
          description: `${quantity} × ${menuItem.name} ${t("cart.addedToCart", "added to your cart")}`,
        });

        // Save to localStorage for persistence
        localStorage.setItem(
          `openeats-cart-${user?.id || "anonymous"}`,
          JSON.stringify(cartState),
        );
      }
    },
    [addItemMutation, cartState, setCartState, t, updateLocalCart, user],
  );

  // Remove item from cart
  const removeItem = useCallback(
    async (id: string): Promise<void> => {
      if (user) {
        try {
          await removeItemMutation({
            requestData: {},
            urlParams: { id },
          });
        } catch (error) {
          // Error is handled in the mutation options
        }
      } else {
        const updatedItems = cartState.items.filter((item) => item.id !== id);
        updateLocalCart(
          updatedItems,
          updatedItems.length > 0 ? cartState.restaurantId : null,
        );

        // Save to localStorage for persistence
        localStorage.setItem(
          `openeats-cart-${user?.id || "anonymous"}`,
          JSON.stringify({
            ...cartState,
            items: updatedItems,
          }),
        );
      }
    },
    [cartState, removeItemMutation, updateLocalCart, user],
  );

  // Update item quantity
  const updateQuantity = useCallback(
    async (id: string, quantity: number): Promise<void> => {
      if (quantity <= 0) {
        await removeItem(id);
        return;
      }

      if (user) {
        try {
          await updateItemMutation({
            requestData: { quantity },
            urlParams: { id },
          });
        } catch (error) {
          // Error is handled in the mutation options
        }
      } else {
        const updatedItems = cartState.items.map((item) =>
          item.id === id ? { ...item, quantity } : item,
        );

        updateLocalCart(updatedItems, cartState.restaurantId);

        // Save to localStorage for persistence
        localStorage.setItem(
          `openeats-cart-${user?.id || "anonymous"}`,
          JSON.stringify({
            ...cartState,
            items: updatedItems,
          }),
        );
      }
    },
    [cartState, removeItem, updateItemMutation, updateLocalCart, user],
  );

  // Clear cart
  const clearCart = useCallback(async (): Promise<void> => {
    if (user) {
      try {
        await clearCartMutation({
          requestData: {},
          urlParams: {},
        });
      } catch (error) {
        // Error is handled in the mutation options
      }
    } else {
      setCartState({
        items: [],
        restaurantId: null,
        subtotal: 0,
        deliveryFee: 0,
        serviceFee: 0,
        tax: 0,
        total: 0,
        itemCount: 0,
      });

      // Clear localStorage
      localStorage.removeItem(`openeats-cart-${user?.id || "anonymous"}`);
    }
  }, [clearCartMutation, setCartState, user]);

  // Getter functions for cart totals
  const getSubtotal = useCallback((): number => {
    return cartState.subtotal;
  }, [cartState.subtotal]);

  const getDeliveryFee = useCallback((): number => {
    return cartState.deliveryFee;
  }, [cartState.deliveryFee]);

  const getServiceFee = useCallback((): number => {
    return cartState.serviceFee;
  }, [cartState.serviceFee]);

  const getTax = useCallback((): number => {
    return cartState.tax;
  }, [cartState.tax]);

  const getTotal = useCallback((): number => {
    return cartState.total;
  }, [cartState.total]);

  // Initialize from localStorage for non-authenticated users
  useMemo(() => {
    if (!user && typeof window !== "undefined") {
      const savedCart = localStorage.getItem(
        `openeats-cart-${user?.id || "anonymous"}`,
      );
      if (savedCart) {
        try {
          const parsedCart = JSON.parse(savedCart) as CartResponseType;
          setCartState(parsedCart);
        } catch (error) {
          console.error("Failed to parse cart from localStorage", error);
        }
      }
    }
  }, [setCartState, user]);

  return {
    items: cartState.items,
    restaurantId: cartState.restaurantId,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    getSubtotal,
    getTotal,
    getDeliveryFee,
    getServiceFee,
    getTax,
    itemCount: cartState.itemCount,
    isLoading,
  };
}

/**
 * Simplified API hooks using the next-vibe pattern
 * These hooks provide a more standardized way to interact with the cart API
 */

/**
 * Hook for retrieving cart items
 * @param options - API query options
 * @returns API query result with cart items
 */
export const useGetCart = (
  options?: UseApiQueryFormOptions<
    undefined,
    CartItemResponseType[],
    undefined,
    undefined
  >,
) => {
  return useApiQueryForm({
    endpoint: cartEndpoints.GET,
    ...options,
  });
};

/**
 * Hook for adding an item to the cart
 * @param options - API form options
 * @returns API form result for adding cart items
 */
export const useAddCartItem = (
  options?: UseApiFormOptions<
    CartItemCreateType,
    CartItemResponseType,
    undefined,
    undefined
  >,
) => {
  return useApiForm({
    endpoint: cartEndpoints.POST,
    ...options,
  });
};

/**
 * Hook for updating a cart item
 * @param options - API form options
 * @returns API form result for updating cart items
 */
export const useUpdateCartItem = (
  options?: UseApiFormOptions<
    CartItemUpdateType,
    CartItemResponseType,
    { id: string },
    undefined
  >,
) => {
  return useApiForm({
    endpoint: cartEndpoints.PUT,
    ...options,
  });
};

/**
 * Hook for removing a cart item
 * @param options - API form options
 * @returns API form result for removing cart items
 */
export const useRemoveCartItem = (
  options?: UseApiFormOptions<undefined, undefined, { id: string }, undefined>,
) => {
  return useApiForm({
    endpoint: cartEndpoints.DELETE,
    ...options,
  });
};
