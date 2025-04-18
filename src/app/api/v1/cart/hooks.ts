"use client";

/**
 * Cart API hooks for client-side usage
 * These hooks provide a convenient way to interact with the cart API
 */

import { useApiMutation } from "next-vibe/client/hooks/mutation";
import { useApiForm } from "next-vibe/client/hooks/mutation-form";
import { useApiQuery } from "next-vibe/client/hooks/query";
import { useApiQueryForm } from "next-vibe/client/hooks/query-form";
import { useTranslation } from "next-vibe/i18n";
import { useCallback } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";

import { useAuth } from "@/app/api/v1/auth/hooks/useAuth";
import type { MenuItemResponseType } from "@/app/api/v1/restaurant/schema/menu.schema";
import { toast } from "@/components/ui/use-toast";

import cartEndpoints from "./definition";

/**
 * Cart item type with menu item details
 */
export interface CartItem {
  id: string;
  menuItemId: string;
  quantity: number;
  specialInstructions?: string | null;
  menuItem: {
    id: string;
    name: string;
    description: string;
    price: string;
    image: string;
    taxPercent: number;
    partnerId: string;
    categoryId: string;
    isAvailable: boolean;
    currency: string;
    category: { id: string; name: string; image: string };
    availableFrom: string | null;
    availableTo: string | null;
  };
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
    (sum, item) => sum + (parseFloat(item.menuItem.price) || 0) * item.quantity,
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
 * Cart store state interface
 */
interface CartState extends CartResponseType {
  // Actions
  setItems: (items: CartItem[], restaurantId: string | null) => void;
  addItem: (
    menuItem: MenuItemResponseType & { partnerId: string; categoryId: string },
    quantity: number,
    specialInstructions?: string | null,
  ) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
}

/**
 * Create cart store with persistence
 */
export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      // Initial state
      items: [],
      restaurantId: null,
      subtotal: 0,
      deliveryFee: 0,
      serviceFee: 0,
      tax: 0,
      total: 0,
      itemCount: 0,

      // Actions
      setItems: (items: CartItem[], restaurantId: string | null) => {
        const { subtotal, deliveryFee, serviceFee, tax, total, itemCount } =
          calculateCartTotals(items);

        set({
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

      addItem: (
        menuItem: MenuItemResponseType & {
          partnerId: string;
          categoryId: string;
        },
        quantity: number,
        specialInstructions?: string | null,
      ) => {
        const { items, restaurantId } = get();

        // Check if adding from a different restaurant
        if (
          restaurantId &&
          menuItem.partnerId !== restaurantId &&
          items.length > 0
        ) {
          if (
            !window.confirm(
              "Adding items from a different restaurant will clear your current cart. Continue?",
            )
          ) {
            return;
          }

          // Clear cart before adding from new restaurant
          set({
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

        // Check if item already exists in cart
        const existingItemIndex = items.findIndex(
          (item) => item.menuItemId === menuItem.id,
        );

        let updatedItems: CartItem[];

        if (existingItemIndex >= 0) {
          // Update existing item
          updatedItems = [...items];
          updatedItems[existingItemIndex] = {
            ...updatedItems[existingItemIndex],
            quantity: updatedItems[existingItemIndex].quantity + quantity,
            specialInstructions: specialInstructions || null,
          };
        } else {
          // Add new item
          const newItem: CartItem = {
            id: `${menuItem.id}-${Date.now()}`, // Unique ID for cart item
            menuItemId: menuItem.id,
            quantity,
            specialInstructions: specialInstructions || null,
            menuItem: {
              id: menuItem.id,
              name: menuItem.name,
              description: menuItem.description || "",
              price: menuItem.price.toString(),
              image: menuItem.image || "",
              taxPercent: menuItem.taxPercent || 0,
              partnerId: menuItem.partnerId,
              categoryId: menuItem.categoryId,
              isAvailable: menuItem.isAvailable || true,
              currency: menuItem.currency || "USD",
              category: {
                id: menuItem.categoryId,
                name: "",
                image: "",
              },
              availableFrom: menuItem.availableFrom
                ? menuItem.availableFrom.toString()
                : null,
              availableTo: menuItem.availableTo
                ? menuItem.availableTo.toString()
                : null,
            },
          };
          updatedItems = [...items, newItem];
        }

        // Update cart with new items
        const { subtotal, deliveryFee, serviceFee, tax, total, itemCount } =
          calculateCartTotals(updatedItems);

        set({
          items: updatedItems,
          restaurantId: menuItem.partnerId,
          subtotal,
          deliveryFee,
          serviceFee,
          tax,
          total,
          itemCount,
        });

        // Show toast notification
        toast({
          title: "Added to cart",
          description: `${quantity} × ${menuItem.name} added to your cart`,
        });
      },

      removeItem: (id: string) => {
        const { items } = get();
        const updatedItems = items.filter((item) => item.id !== id);

        // Update cart with new items
        const { subtotal, deliveryFee, serviceFee, tax, total, itemCount } =
          calculateCartTotals(updatedItems);

        set({
          items: updatedItems,
          restaurantId: updatedItems.length > 0 ? get().restaurantId : null,
          subtotal,
          deliveryFee,
          serviceFee,
          tax,
          total,
          itemCount,
        });
      },

      updateQuantity: (id: string, quantity: number) => {
        const { items } = get();

        if (quantity <= 0) {
          // Remove item if quantity is 0 or negative
          get().removeItem(id);
          return;
        }

        // Update item quantity
        const updatedItems = items.map((item) =>
          item.id === id ? { ...item, quantity } : item,
        );

        // Update cart with new items
        const { subtotal, deliveryFee, serviceFee, tax, total, itemCount } =
          calculateCartTotals(updatedItems);

        set({
          items: updatedItems,
          subtotal,
          deliveryFee,
          serviceFee,
          tax,
          total,
          itemCount,
        });
      },

      clearCart: () => {
        set({
          items: [],
          restaurantId: null,
          subtotal: 0,
          deliveryFee: 0,
          serviceFee: 0,
          tax: 0,
          total: 0,
          itemCount: 0,
        });
      },
    }),
    {
      name: "openeats-cart", // localStorage key
    },
  ),
);

/**
 * Hook for using the cart with API integration
 * @returns Cart functionality
 */
export function useCart(): {
  items: CartItem[];
  restaurantId: string | null;
  addItem: (
    menuItem: MenuItemResponseType & { partnerId: string; categoryId: string },
    quantity: number,
    specialInstructions?: string | null,
  ) => Promise<void>;
  removeItem: (id: string) => Promise<void>;
  updateQuantity: (id: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  subtotal: number;
  total: number;
  deliveryFee: number;
  serviceFee: number;
  tax: number;
  itemCount: number;
  isLoading: boolean;
} {
  const { user } = useAuth();
  const { t } = useTranslation();

  // Get cart state from zustand store
  const cartState = useCartStore();

  // API query for fetching cart items
  const { isLoading, refetch } = useApiQuery(
    cartEndpoints.GET,
    undefined,
    undefined,
    {
      enabled: !!user,
      onSuccess: (data) => {
        if (data && Array.isArray(data)) {
          // Transform API response to CartItem[]
          const items = data.map((item) => ({
            id: item.id,
            menuItemId: item.menuItemId,
            quantity: item.quantity,
            specialInstructions: item.notes,
            menuItem: {
              id: item.menuItemId,
              name: "Loading...", // Will be populated from menu items API
              description: "",
              price: "0",
              image: "",
              taxPercent: 0,
              partnerId: item.partnerId,
              categoryId: "",
              isAvailable: true,
              currency: "USD",
              category: { id: "", name: "", image: "" },
              availableFrom: null,
              availableTo: null,
            },
          }));

          // Update cart state with fetched items
          cartState.setItems(
            items,
            data.length > 0 ? data[0]?.partnerId || null : null,
          );
        }
      },
    },
  );

  // API mutations
  const { mutateAsync: addItemMutation } = useApiMutation(cartEndpoints.POST, {
    onSuccess: () => {
      refetch();
    },
    onError: (data: { error: Error }) => {
      toast({
        title: "Error",
        description: data.error.message || "Failed to add item to cart",
        variant: "destructive",
      });
    },
  });

  const { mutateAsync: updateItemMutation } = useApiMutation(
    cartEndpoints.PUT,
    {
      onSuccess: () => {
        refetch();
      },
      onError: (data: { error: Error }) => {
        toast({
          title: "Error",
          description: data.error.message || "Failed to update cart item",
          variant: "destructive",
        });
      },
    },
  );

  const { mutateAsync: removeItemMutation } = useApiMutation(
    cartEndpoints.DELETE,
    {
      onSuccess: () => {
        refetch();
      },
      onError: (data: { error: Error }) => {
        toast({
          title: "Error",
          description: data.error.message || "Failed to remove cart item",
          variant: "destructive",
        });
      },
    },
  );

  const { mutateAsync: clearCartMutation } = useApiMutation(
    cartEndpoints.DELETE,
    {
      onSuccess: () => {
        refetch();
      },
      onError: (data: { error: Error }) => {
        toast({
          title: "Error",
          description: data.error.message || "Failed to clear cart",
          variant: "destructive",
        });
      },
    },
  );

  // Add item to cart
  const addItem = useCallback(
    async (
      menuItem: MenuItemResponseType & {
        partnerId: string;
        categoryId: string;
      },
      quantity: number,
      specialInstructions?: string | null,
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
          });

          toast({
            title: "Added to cart",
            description: `${quantity} × ${menuItem.name} added to your cart`,
          });
        } catch (error) {
          // Error is handled in the mutation options
        }
      } else {
        // For non-authenticated users, use the zustand store
        cartState.addItem(menuItem, quantity, specialInstructions);
      }
    },
    [addItemMutation, cartState, user],
  );

  // Remove item from cart
  const removeItem = useCallback(
    async (id: string): Promise<void> => {
      if (user) {
        try {
          await removeItemMutation({
            urlParams: { id },
          });
        } catch (error) {
          // Error is handled in the mutation options
        }
      } else {
        // For non-authenticated users, use the zustand store
        cartState.removeItem(id);
      }
    },
    [cartState, removeItemMutation, user],
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
            urlParams: { id },
            requestData: { quantity, specialInstructions: null },
          });
        } catch (error) {
          // Error is handled in the mutation options
        }
      } else {
        // For non-authenticated users, use the zustand store
        cartState.updateQuantity(id, quantity);
      }
    },
    [cartState, removeItem, updateItemMutation, user],
  );

  // Clear cart
  const clearCart = useCallback(async (): Promise<void> => {
    if (user) {
      try {
        await clearCartMutation({
          urlParams: { id: "all" },
        });
      } catch (error) {
        // Error is handled in the mutation options
      }
    } else {
      // For non-authenticated users, use the zustand store
      cartState.clearCart();
    }
  }, [cartState, clearCartMutation, user]);

  return {
    items: cartState.items,
    restaurantId: cartState.restaurantId,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    subtotal: cartState.subtotal,
    total: cartState.total,
    deliveryFee: cartState.deliveryFee,
    serviceFee: cartState.serviceFee,
    tax: cartState.tax,
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
export const useGetCart = (options?: Parameters<typeof useApiQueryForm>[0]) => {
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
export const useAddCartItem = (options?: Parameters<typeof useApiForm>[0]) => {
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
  options?: Parameters<typeof useApiForm>[0],
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
  options?: Parameters<typeof useApiForm>[0],
) => {
  return useApiForm({
    endpoint: cartEndpoints.DELETE,
    ...options,
  });
};
