"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import type React from "react";
import { toast } from "@/components/ui/use-toast";
import { useApiQuery } from "next-vibe/client/hooks/query";
import { useApiMutation } from "next-vibe/client/hooks/mutation";
import { useAuth } from "@/app/api/v1/auth/hooks/useAuth";
import { translations } from "@/translations";

import type { MenuItemResponseType } from "@/app/api/v1/restaurant/schema/menu.schema";
import endpoints from "./definition";

/**
 * Cart item type
 */
export interface CartItem {
  id: string;
  menuItemId: string;
  quantity: number;
  specialInstructions?: string;
  menuItem: MenuItemResponseType;
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
 * Cart context type
 */
interface CartContextType {
  items: CartItem[];
  restaurantId: string | null;
  addItem: (
    menuItem: MenuItemResponseType,
    quantity: number,
    specialInstructions?: string,
  ) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
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
  children: React.ReactNode;
}): React.JSX.Element {
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
  
  const t = (key: string, fallback?: string): string => {
    const parts = key.split(".");
    let result = translations.EN;
    
    for (const part of parts) {
      if (result && typeof result === "object" && part in result) {
        result = result[part] as any;
      } else {
        return fallback || key;
      }
    }
    
    return typeof result === "string" ? result : fallback || key;
  };
  
  const {
    data: serverCart,
    isLoading,
    refetch,
  } = useApiQuery<Record<string, never>, CartResponseType, Record<string, never>, "default">(
    endpoints.GET,
    {},
    {},
    {
      enabled: !!user,
      onSuccess: (data) => {
        if (data) {
          setLocalCart(data);
        }
      },
    }
  );
  
  const { mutateAsync: addItemMutation } = useApiMutation<
    CartResponseType,
    { menuItemId: string; quantity: number; notes?: string },
    Record<string, never>,
    "default"
  >(endpoints.POST, {
    onSuccess: (data) => {
      setLocalCart(data);
      refetch();
    },
    onError: (data: { 
      error: Error; 
      requestData: { menuItemId: string; quantity: number; notes?: string }; 
      pathParams: Record<string, never>; 
    }) => {
      toast({
        title: t("common.error", "Error"),
        description: data.error.message || t("cart.addItemError", "Failed to add item to cart"),
        variant: "destructive",
      });
    },
  });
  
  const { mutateAsync: updateItemMutation } = useApiMutation<
    CartResponseType,
    { id: string; quantity: number; notes?: string },
    Record<string, never>,
    "default"
  >(endpoints.PUT, {
    onSuccess: (data) => {
      setLocalCart(data);
      refetch();
    },
    onError: (data: { 
      error: Error; 
      requestData: { id: string; quantity: number; notes?: string }; 
      pathParams: Record<string, never>; 
    }) => {
      toast({
        title: t("common.error", "Error"),
        description: data.error.message || t("cart.updateItemError", "Failed to update cart item"),
        variant: "destructive",
      });
    },
  });
  
  const { mutateAsync: removeItemMutation } = useApiMutation<
    CartResponseType,
    { id: string },
    Record<string, never>,
    "default"
  >(endpoints.DELETE, {
    onSuccess: (data) => {
      setLocalCart(data);
      refetch();
    },
    onError: (data: { 
      error: Error; 
      requestData: { id: string }; 
      pathParams: Record<string, never>; 
    }) => {
      toast({
        title: t("common.error", "Error"),
        description: data.error.message || t("cart.removeItemError", "Failed to remove cart item"),
        variant: "destructive",
      });
    },
  });
  
  const { mutateAsync: clearCartMutation } = useApiMutation<
    CartResponseType,
    Record<string, never>,
    Record<string, never>,
    "default"
  >(endpoints.DELETE, {
    onSuccess: (data) => {
      setLocalCart(data);
      refetch();
    },
    onError: (data: { 
      error: Error; 
      requestData: Record<string, never>; 
      pathParams: Record<string, never>; 
    }) => {
      toast({
        title: t("common.error", "Error"),
        description: data.error.message || t("cart.clearCartError", "Failed to clear cart"),
        variant: "destructive",
      });
    },
  });
  
  useEffect(() => {
    if (!user) {
      const savedCart = localStorage.getItem("openeats-cart");
      if (savedCart) {
        try {
          const parsedCart = JSON.parse(savedCart);
          setLocalCart(parsedCart);
        } catch (error) {
          console.error("Failed to parse cart from localStorage", error);
        }
      }
    }
  }, [user]);
  
  useEffect(() => {
    if (!user && localCart) {
      localStorage.setItem("openeats-cart", JSON.stringify(localCart));
    }
  }, [localCart, user]);
  
  const addItem = useCallback(
    async (
      menuItem: MenuItemResponseType,
      quantity: number,
      specialInstructions?: string,
    ): Promise<void> => {
      if (user) {
        try {
          await addItemMutation({
            requestData: {
              menuItemId: menuItem.id,
              quantity,
              notes: specialInstructions,
            },
            urlParams: {},
          });
          
          toast({
            title: t("cart.itemAdded", "Added to cart"),
            description: `${quantity} × ${menuItem.name} ${t("cart.addedToCart", "added to your cart")}`,
          });
        } catch (error) {
        }
      } else {
        if (
          localCart.restaurantId &&
          menuItem.partnerId !== localCart.restaurantId &&
          localCart.items.length > 0
        ) {
          const confirmed = window.confirm(
            t("cart.differentRestaurantWarning", "Adding items from a different restaurant will clear your current cart. Continue?"),
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
          (item) => item.menuItemId === menuItem.id,
        );
        
        if (existingItemIndex >= 0) {
          const updatedItems = [...localCart.items];
          updatedItems[existingItemIndex] = {
            ...updatedItems[existingItemIndex],
            quantity: updatedItems[existingItemIndex].quantity + quantity,
            specialInstructions,
          };
          
          const subtotal = updatedItems.reduce(
            (sum, item) => sum + (item.menuItem.price || 0) * item.quantity,
            0,
          );
          const deliveryFee = updatedItems.length > 0 ? 2.99 : 0;
          const serviceFee = subtotal > 0 ? 1.99 : 0;
          const tax = subtotal * 0.0825; // 8.25% tax rate
          
          setLocalCart({
            items: updatedItems,
            restaurantId: menuItem.partnerId,
            subtotal,
            deliveryFee,
            serviceFee,
            tax,
            total: subtotal + deliveryFee + serviceFee + tax,
            itemCount: updatedItems.reduce((count, item) => count + item.quantity, 0),
          });
        } else {
          const newItem: CartItem = {
            id: `${menuItem.id}-${Date.now()}`, // Unique ID for cart item
            menuItemId: menuItem.id,
            quantity,
            specialInstructions,
            menuItem,
          };
          
          const updatedItems = [...localCart.items, newItem];
          
          const subtotal = updatedItems.reduce(
            (sum, item) => sum + (item.menuItem.price || 0) * item.quantity,
            0,
          );
          const deliveryFee = updatedItems.length > 0 ? 2.99 : 0;
          const serviceFee = subtotal > 0 ? 1.99 : 0;
          const tax = subtotal * 0.0825; // 8.25% tax rate
          
          setLocalCart({
            items: updatedItems,
            restaurantId: menuItem.partnerId,
            subtotal,
            deliveryFee,
            serviceFee,
            tax,
            total: subtotal + deliveryFee + serviceFee + tax,
            itemCount: updatedItems.reduce((count, item) => count + item.quantity, 0),
          });
        }
        
        toast({
          title: t("cart.itemAdded", "Added to cart"),
          description: `${quantity} × ${menuItem.name} ${t("cart.addedToCart", "added to your cart")}`,
        });
      }
    },
    [addItemMutation, localCart, t, user]
  );
  
  const removeItem = useCallback(
    async (id: string): Promise<void> => {
      if (user) {
        try {
          await removeItemMutation({
            requestData: { id },
            urlParams: {},
          });
        } catch (error) {
        }
      } else {
        const updatedItems = localCart.items.filter((item) => item.id !== id);
        
        const subtotal = updatedItems.reduce(
          (sum, item) => sum + (item.menuItem.price || 0) * item.quantity,
          0,
        );
        const deliveryFee = updatedItems.length > 0 ? 2.99 : 0;
        const serviceFee = subtotal > 0 ? 1.99 : 0;
        const tax = subtotal * 0.0825; // 8.25% tax rate
        
        setLocalCart({
          items: updatedItems,
          restaurantId: updatedItems.length > 0 ? localCart.restaurantId : null,
          subtotal,
          deliveryFee,
          serviceFee,
          tax,
          total: subtotal + deliveryFee + serviceFee + tax,
          itemCount: updatedItems.reduce((count, item) => count + item.quantity, 0),
        });
      }
    },
    [localCart, removeItemMutation, user]
  );
  
  const updateQuantity = useCallback(
    async (id: string, quantity: number): Promise<void> => {
      if (quantity <= 0) {
        await removeItem(id);
        return;
      }
      
      if (user) {
        try {
          await updateItemMutation({
            requestData: { id, quantity },
            urlParams: {},
          });
        } catch (error) {
        }
      } else {
        const updatedItems = localCart.items.map((item) =>
          item.id === id ? { ...item, quantity } : item
        );
        
        const subtotal = updatedItems.reduce(
          (sum, item) => sum + (item.menuItem.price || 0) * item.quantity,
          0,
        );
        const deliveryFee = updatedItems.length > 0 ? 2.99 : 0;
        const serviceFee = subtotal > 0 ? 1.99 : 0;
        const tax = subtotal * 0.0825; // 8.25% tax rate
        
        setLocalCart({
          items: updatedItems,
          restaurantId: localCart.restaurantId,
          subtotal,
          deliveryFee,
          serviceFee,
          tax,
          total: subtotal + deliveryFee + serviceFee + tax,
          itemCount: updatedItems.reduce((count, item) => count + item.quantity, 0),
        });
      }
    },
    [localCart, removeItem, updateItemMutation, user]
  );
  
  const clearCart = useCallback(
    async (): Promise<void> => {
      if (user) {
        try {
          await clearCartMutation({
            requestData: {},
            urlParams: {},
          });
        } catch (error) {
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
  
  const contextValue = {
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
