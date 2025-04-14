"use client";

import { useEffect } from "react";
import { toast } from "@/components/ui/use-toast";
import { translations } from "@/translations";
import { useCart as useApiCart } from "@/app/api/v1/cart/hooks";

/**
 * Re-export the cart hook from the API implementation
 * This maintains backward compatibility with existing code
 * while using the new zustand-based implementation
 */
export type { CartItem } from "@/app/api/v1/cart/hooks";

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
 * Hook for using the cart
 * This is a wrapper around the API cart hook to maintain backward compatibility
 */
export function useCart() {
  const t = createTranslator();
  const {
    items,
    restaurantId,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    isLoading,
  } = useApiCart();

  useEffect(() => {
    if (items.length === 0 && restaurantId === null) {
      const savedCart = localStorage.getItem("openeats-cart");
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);
        if (parsedCart.items && parsedCart.items.length > 0) {
          toast({
            title: t("cart.cleared", "Cart cleared"),
            description: t("cart.clearedDescription", "Your cart has been cleared"),
          });
        }
      }
    }
  }, [items.length, restaurantId, t]);

  const getSubtotal = (): number => {
    return items.reduce(
      (sum, item) => sum + (item.menuItem.price || 0) * item.quantity,
      0
    );
  };

  const getDeliveryFee = (): number => {
    // Mock delivery fee calculation
    return items.length > 0 ? 2.99 : 0;
  };

  const getServiceFee = (): number => {
    // Mock service fee calculation
    const subtotal = getSubtotal();
    return subtotal > 0 ? 1.99 : 0;
  };

  const getTax = (): number => {
    // Mock tax calculation (8.25%)
    return getSubtotal() * 0.0825;
  };

  const getTotal = (): number => {
    return getSubtotal() + getDeliveryFee() + getServiceFee() + getTax();
  };

  const itemCount = items.reduce((count, item) => count + item.quantity, 0);

  return {
    items,
    restaurantId,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    getSubtotal,
    getTotal,
    getDeliveryFee,
    getServiceFee,
    getTax,
    itemCount,
    isLoading,
  };
}
