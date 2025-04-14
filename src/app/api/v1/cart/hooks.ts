"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { toast } from "@/components/ui/use-toast";
import { useApiQuery } from "next-vibe/client/hooks/query";
import { useApiMutation } from "next-vibe/client/hooks/mutation";
import { useAuth } from "@/app/api/v1/auth/hooks/useAuth";
import { translations } from "@/translations";

import type { MenuItemResponseType } from "@/app/api/v1/restaurant/schema/menu.schema";
import cartEndpoints from "./definition";
import type { CartItemCreateType, CartItemUpdateType, CartItemResponseType } from "./definition";

/**
 * Cart item type with menu item details
 */
export interface CartItem {
  id: string;
  menuItemId: string;
  quantity: number;
  specialInstructions?: string;
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
    0
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
 * Cart context type
 */
interface CartContextType {
  items: CartItem[];
  restaurantId: string | null;
  addItem: (
    menuItem: MenuItemResponseType & { partnerId: string },
    quantity: number,
    specialInstructions?: string
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
}

/**
 * Cart context
 */
const CartContext = createContext<CartContextType | undefined>(undefined);

/**
 * Cart provider component
 */
export function CartProvider({
  children,
}: {
  children: ReactNode;
}) {
  const { user } = useAuth();
  const [localCart, setLocalCart] = useState<CartResponseType>({
    items: [],
    restaurantId: null,
    subtotal: 0,
    deliveryFee: 0,
    serviceFee: 0,
    tax: 0,
    total: 0,
    itemCount: 0,
  });
  
  // Simple translation function
  const t = (key: string, fallback?: string): string => {
    const parts = key.split(".");
    let result = translations.EN;
    
    for (const part of parts) {
      if (result && typeof result === "object" && part in result) {
        // Use type assertion with more specific type
        result = (result as Record<string, unknown>)[part] as typeof result;
      } else {
        return fallback || key;
      }
    }
    
    return typeof result === "string" ? result : fallback || key;
  };
  
  // Fetch cart data from server for authenticated users
  const { isLoading, refetch } = useApiQuery<
    Record<string, never>,
    CartItemResponseType[],
    Record<string, never>,
    "default"
  >(
    cartEndpoints.GET as any, // Temporary type assertion to fix build
    {},
    {},
    {
      enabled: !!user,
      onSuccess: (data: CartItemResponseType[]) => {
        if (data && Array.isArray(data)) {
          // Transform API response to CartResponseType
          const items = data.map((item) => ({
            id: item.id,
            menuItemId: item.menuItemId,
            quantity: item.quantity,
            menuItem: {} as MenuItemResponseType, // This would be populated from a separate API call
          }));
          
          const { subtotal, deliveryFee, serviceFee, tax, total, itemCount } = 
            calculateCartTotals(items);
          
          setLocalCart({
            items,
            restaurantId: data.length > 0 ? data[0]?.restaurantId || null : null,
            subtotal,
            deliveryFee,
            serviceFee,
            tax,
            total,
            itemCount,
          });
        }
      },
    }
  );
  
  // API mutations
  const { mutateAsync: addItemMutation } = useApiMutation<
    CartItemResponseType,
    CartItemCreateType,
    Record<string, never>,
    "default"
  >(
    cartEndpoints.POST as any, // Temporary type assertion to fix build
    {
      onSuccess: () => {
        refetch();
      },
      onError: (error: { error: Error }) => {
        toast({
          title: t("common.error", "Error"),
          description: error.error.message || t("cart.addItemError", "Failed to add item to cart"),
          variant: "destructive",
        });
      },
    }
  );
  
  const { mutateAsync: updateItemMutation } = useApiMutation<
    CartItemResponseType,
    CartItemUpdateType,
    Record<string, never>,
    "default"
  >(
    cartEndpoints.PUT as any, // Temporary type assertion to fix build
    {
      onSuccess: () => {
        refetch();
      },
      onError: (error: { error: Error }) => {
        toast({
          title: t("common.error", "Error"),
          description: error.error.message || t("cart.updateItemError", "Failed to update cart item"),
          variant: "destructive",
        });
      },
    }
  );
  
  const { mutateAsync: removeItemMutation } = useApiMutation<
    Record<string, never>,
    { id: string },
    Record<string, never>,
    "default"
  >(
    cartEndpoints.DELETE as any, // Temporary type assertion to fix build
    {
      onSuccess: () => {
        refetch();
      },
      onError: (error: { error: Error }) => {
        toast({
          title: t("common.error", "Error"),
          description: error.error.message || t("cart.removeItemError", "Failed to remove cart item"),
          variant: "destructive",
        });
      },
    }
  );
  
  const { mutateAsync: clearCartMutation } = useApiMutation<
    Record<string, never>,
    Record<string, never>,
    Record<string, never>,
    "default"
  >(
    cartEndpoints.DELETE as any, // Temporary type assertion to fix build
    {
      onSuccess: () => {
        refetch();
      },
      onError: (error: { error: Error }) => {
        toast({
          title: t("common.error", "Error"),
          description: error.error.message || t("cart.clearCartError", "Failed to clear cart"),
          variant: "destructive",
        });
      },
    }
  );
  
  // Load cart from localStorage on initial render for non-authenticated users
  useEffect(() => {
    if (!user) {
      const savedCart = localStorage.getItem("openeats-cart");
      if (savedCart) {
        try {
          const parsedCart = JSON.parse(savedCart) as CartResponseType;
          setLocalCart(parsedCart);
        } catch (error) {
          console.error("Failed to parse cart from localStorage", error);
        }
      }
    }
  }, [user]);
  
  // Save cart to localStorage whenever it changes for non-authenticated users
  useEffect(() => {
    if (!user && localCart) {
      localStorage.setItem("openeats-cart", JSON.stringify(localCart));
    }
  }, [localCart, user]);
  
  // Helper function to update local cart
  const updateLocalCart = useCallback((items: CartItem[], restaurantId: string | null) => {
    const { subtotal, deliveryFee, serviceFee, tax, total, itemCount } = calculateCartTotals(items);
    
    setLocalCart({
      items,
      restaurantId,
      subtotal,
      deliveryFee,
      serviceFee,
      tax,
      total,
      itemCount,
    });
  }, []);
  
  // Add item to cart
  const addItem = useCallback(
    async (
      menuItem: MenuItemResponseType & { partnerId: string },
      quantity: number,
      specialInstructions?: string
    ): Promise<void> => {
      if (user) {
        try {
          await addItemMutation({
            requestData: {
              menuItemId: menuItem.id,
              restaurantId: menuItem.partnerId,
              quantity,
            } as CartItemCreateType,
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
          localCart.restaurantId &&
          menuItem.partnerId !== localCart.restaurantId &&
          localCart.items.length > 0
        ) {
          const confirmed = window.confirm(
            t("cart.differentRestaurantWarning", "Adding items from a different restaurant will clear your current cart. Continue?")
          );
          
          if (!confirmed) {
            return;
          }
          
          setLocalCart({
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
        
        const existingItemIndex = localCart.items.findIndex(
          (item) => item.menuItemId === menuItem.id
        );
        
        if (existingItemIndex >= 0) {
          const updatedItems = [...localCart.items];
          updatedItems[existingItemIndex] = {
            ...updatedItems[existingItemIndex],
            quantity: updatedItems[existingItemIndex].quantity + quantity,
            specialInstructions,
          };
          
          updateLocalCart(updatedItems, menuItem.partnerId);
        } else {
          const newItem: CartItem = {
            id: `${menuItem.id}-${Date.now()}`, // Unique ID for cart item
            menuItemId: menuItem.id,
            quantity,
            specialInstructions,
            menuItem,
          };
          
          updateLocalCart([...localCart.items, newItem], menuItem.partnerId);
        }
        
        toast({
          title: t("cart.itemAdded", "Added to cart"),
          description: `${quantity} × ${menuItem.name} ${t("cart.addedToCart", "added to your cart")}`,
        });
      }
    },
    [addItemMutation, localCart, t, updateLocalCart, user]
  );
  
  // Remove item from cart
  const removeItem = useCallback(
    async (id: string): Promise<void> => {
      if (user) {
        try {
          await removeItemMutation({
            requestData: { id },
            urlParams: {},
          });
        } catch (error) {
          // Error is handled in the mutation options
        }
      } else {
        const updatedItems = localCart.items.filter((item) => item.id !== id);
        updateLocalCart(
          updatedItems, 
          updatedItems.length > 0 ? localCart.restaurantId : null
        );
      }
    },
    [localCart, removeItemMutation, updateLocalCart, user]
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
            requestData: { id, quantity } as CartItemUpdateType,
            urlParams: {},
          });
        } catch (error) {
          // Error is handled in the mutation options
        }
      } else {
        const updatedItems = localCart.items.map((item) =>
          item.id === id ? { ...item, quantity } : item
        );
        
        updateLocalCart(updatedItems, localCart.restaurantId);
      }
    },
    [localCart, removeItem, updateItemMutation, updateLocalCart, user]
  );
  
  // Clear cart
  const clearCart = useCallback(
    async (): Promise<void> => {
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
        setLocalCart({
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
    },
    [clearCartMutation, user]
  );
  
  // Getter functions for cart totals
  const getSubtotal = useCallback(
    (): number => {
      return localCart.subtotal;
    },
    [localCart.subtotal]
  );
  
  const getDeliveryFee = useCallback(
    (): number => {
      return localCart.deliveryFee;
    },
    [localCart.deliveryFee]
  );
  
  const getServiceFee = useCallback(
    (): number => {
      return localCart.serviceFee;
    },
    [localCart.serviceFee]
  );
  
  const getTax = useCallback(
    (): number => {
      return localCart.tax;
    },
    [localCart.tax]
  );
  
  const getTotal = useCallback(
    (): number => {
      return localCart.total;
    },
    [localCart.total]
  );
  
  // Create context value
  const contextValue: CartContextType = {
    items: localCart.items,
    restaurantId: localCart.restaurantId,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    getSubtotal,
    getTotal,
    getDeliveryFee,
    getServiceFee,
    getTax,
    itemCount: localCart.itemCount,
    isLoading
  };

  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  );
}

/**
 * Hook for using the cart context
 * @returns Cart context
 */
export function useCart(): CartContextType {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
