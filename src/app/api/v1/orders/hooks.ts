import { useApiQuery } from "next-vibe/client/hooks/query";
import type { UndefinedType } from "next-vibe/shared/types/common.schema";
import { useState } from "react";

import ordersEndpoint from "./definition";
import type {
  OrdersGetRequestType,
  OrdersGetResponseOutputType,
} from "./schema";

export type UseOrdersFilters = Partial<OrdersGetRequestType>;

// Hook for fetching orders with filters
export function useOrders(filters: UseOrdersFilters = {}) {
  const defaultFilters: OrdersGetRequestType = {
    page: 1,
    limit: 20,
    ...filters,
  };

  return useApiQuery<
    OrdersGetRequestType,
    OrdersGetResponseOutputType,
    UndefinedType
  >(ordersEndpoint.GET, defaultFilters, undefined, {
    // Enable caching
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Hook for paginated orders
export function usePaginatedOrders(initialFilters: UseOrdersFilters = {}) {
  const [filters, setFilters] = useState<OrdersGetRequestType>({
    page: 1,
    limit: 20,
    ...initialFilters,
  });

  const result = useOrders(filters);

  // Function to change page
  const changePage = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  // Function to change filters
  const updateFilters = (newFilters: UseOrdersFilters) => {
    // Reset to page 1 when filters change
    setFilters({ ...newFilters, page: 1, limit: filters.limit });
  };

  return {
    ...result,
    filters,
    changePage,
    updateFilters,
  };
}

// Types for single order endpoint
interface OrderGetRequestType {
  orderId: string;
}

// Using the same response type since a single order
// should have the same structure as an item in the orders array
type OrderGetResponseType = OrdersGetResponseOutputType[0];

// Hook for getting a single order by ID
export function useOrder(orderId: string | undefined) {
  return useApiQuery<OrderGetRequestType, OrderGetResponseType, UndefinedType>(
    // This assumes there's a GET endpoint for a single order
    {
      ...ordersEndpoint.GET,
      path: ["v1", "order", orderId || ""],
    },
    { orderId: orderId || "" },
    undefined,
    {
      enabled: !!orderId,
    },
  );
}
