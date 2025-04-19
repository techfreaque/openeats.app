import { useApiMutation } from "next-vibe/client/hooks/mutation";
import { useApiForm } from "next-vibe/client/hooks/mutation-form";
import { useApiQuery } from "next-vibe/client/hooks/query";
import { useApiQueryForm } from "next-vibe/client/hooks/query-form";
import type { UndefinedType } from "next-vibe/shared/types/common.schema";
import { useEffect, useMemo } from "react";

import type {
  MenuItemResponseType,
  MenuItemSearchType,
  MenuItemUpdateType,
} from "../restaurant/schema/menu.schema";
import menuItemsEndpoints from "./definition";

/**
 * Hook to fetch menu items with optional filtering
 * @param params - Optional parameters to filter menu items
 * @returns Query result with menu items data
 */
export function useMenuItems(params?: {
  restaurantId?: string;
  categoryId?: string;
}) {
  // Create a stable query key based on the params
  const queryKey = useMemo(() => {
    return [
      'menu-items',
      params?.restaurantId || 'all',
      params?.categoryId || 'all',
    ];
  }, [params?.restaurantId, params?.categoryId]);

  return useApiQuery(menuItemsEndpoints.GET, params || {}, undefined, {
    enabled: true,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    queryKey,
    refreshDelay: 1000, // Add a delay to prevent rapid refetches
  });
}

/**
 * Hook to fetch a single menu item by ID
 * @param id - ID of the menu item to fetch
 * @returns Query result with menu item data
 */
export function useMenuItem(id?: string) {
  // Create a stable query key based on the id
  const queryKey = useMemo(() => {
    return ['menu-item', id || 'none'];
  }, [id]);

  return useApiQuery(menuItemsEndpoints.GET, { id }, undefined, {
    enabled: Boolean(id),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    queryKey,
    refreshDelay: 1000, // Add a delay to prevent rapid refetches
  });
}

/**
 * Hook to search menu items with advanced filtering
 * @returns Form methods and state for searching menu items
 */
export function useMenuItemsSearch() {
  return useApiQueryForm<
    MenuItemSearchType,
    MenuItemResponseType[],
    UndefinedType
  >(menuItemsEndpoints.SEARCH, undefined, {
    defaultValues: {
      categoryId: null,
      published: null,
      minPrice: null,
      maxPrice: null,
      restaurantId: null,
    },
    debounceMs: 500,
  });
}

/**
 * Hook to create a new menu item
 * @returns Form methods and state for creating a menu item
 */
export function useCreateMenuItem() {
  return useApiForm(menuItemsEndpoints.POST, {
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      taxPercent: 19,
      currency: "EUR",
      image: null,
      published: false,
      isAvailable: true,
      availableFrom: null,
      availableTo: null,
      categoryId: "",
      restaurantId: "",
    },
  });
}

/**
 * Hook to update a menu item
 * @param menuItemId - ID of the menu item to update
 * @param initialData - Initial data for the form
 * @returns Form methods and state for updating a menu item
 */
export function useUpdateMenuItem(
  menuItemId?: string,
  initialData?: Partial<MenuItemUpdateType>,
) {
  const menuItem = useMenuItem(menuItemId);

  const formData = useApiForm(menuItemsEndpoints.PUT, {
    defaultValues: initialData || {},
  });

  useEffect(() => {
    if (menuItem.data && menuItem.data.length > 0 && menuItemId) {
      const item = menuItem.data.find((item) => item.id === menuItemId);
      if (item) {
        formData.form.reset({
          ...item,
          id: menuItemId,
        });
      }
    }
  }, [formData.form, menuItem.data, menuItemId]);

  return {
    ...formData,
    menuItem,
  };
}

/**
 * Hook to delete a menu item
 * @returns Mutation for deleting a menu item
 */
export function useDeleteMenuItem() {
  return useApiMutation(menuItemsEndpoints.DELETE);
}
