"use client";

import type React from "react";
import { createContext, useContext, useEffect, useState } from "react";

import type { MenuItemResponseType } from "@/app/api/v1/restaurant/schema/menu.schema";

import { toast } from "../../../../components/ui/use-toast";
import type { MenuItemType } from "../lib/types";

export interface CartItem {
  id: string;
  menuItem: MenuItemResponseType;
  quantity: number;
  specialInstructions?: string;
}

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
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({
  children,
}: {
  children: React.ReactNode;
}): React.JSX.Element {
  const [items, setItems] = useState<CartItem[]>([]);
  const [restaurantId, setRestaurantId] = useState<string | null>(null);

  // Load cart from localStorage on initial render
  useEffect(() => {
    const savedCart = localStorage.getItem("openeats-cart");
    if (savedCart) {
      const parsedCart = JSON.parse(savedCart);
      setItems(parsedCart.items || []);
      setRestaurantId(parsedCart.restaurantId || null);
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(
      "openeats-cart",
      JSON.stringify({ items, restaurantId }),
    );
  }, [items, restaurantId]);

  // Improve type safety in the cart hook

  // Add proper return types to all functions
  const addItem = (
    menuItem: MenuItemType,
    quantity: number,
    specialInstructions?: string,
  ): void => {
    // Check if adding from a different restaurant
    if (
      restaurantId &&
      menuItem.restaurantId !== restaurantId &&
      items.length > 0
    ) {
      const confirmed = window.confirm(
        "Adding items from a different restaurant will clear your current cart. Continue?",
      );

      if (!confirmed) {
        return;
      }

      setItems([]);
    }

    // Set the restaurant ID if it's not set yet
    if (!restaurantId) {
      setRestaurantId(menuItem.restaurantId);
    }

    // Check if item already exists in cart
    const existingItemIndex = items.findIndex(
      (item) => item.menuItem.id === menuItem.id,
    );

    if (existingItemIndex >= 0) {
      // Update existing item
      const updatedItems = [...items];
      updatedItems[existingItemIndex].quantity += quantity;
      updatedItems[existingItemIndex].specialInstructions = specialInstructions;
      setItems(updatedItems);
    } else {
      // Add new item
      setItems([
        ...items,
        {
          id: `${menuItem.id}-${Date.now()}`, // Unique ID for cart item
          menuItem,
          quantity,
          specialInstructions,
        },
      ]);
    }

    toast({
      title: "Added to cart",
      description: `${quantity} × ${menuItem.name} added to your cart`,
    });
  };

  const removeItem = (id: string): void => {
    setItems(items.filter((item) => item.id !== id));

    // If cart is empty, reset restaurant ID
    if (items.length === 1) {
      setRestaurantId(null);
    }
  };

  const updateQuantity = (id: string, quantity: number): void => {
    if (quantity <= 0) {
      removeItem(id);
      return;
    }

    setItems(
      items.map((item) => (item.id === id ? { ...item, quantity } : item)),
    );
  };

  const clearCart = (): void => {
    setItems([]);
    setRestaurantId(null);
  };

  const getSubtotal = (): number => {
    return items.reduce(
      (sum, item) => sum + item.menuItem.price * item.quantity,
      0,
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

  return (
    <CartContext.Provider
      value={{
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
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextType {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
