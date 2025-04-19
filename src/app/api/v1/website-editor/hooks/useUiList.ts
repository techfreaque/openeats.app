import { useApiQuery } from "next-vibe/client/hooks/query";
import { errorLogger } from "next-vibe/shared/utils/logger";
import { useCallback } from "react";

import listUisEndpoint from "../ui/list/definition";

/**
 * Hook to list UI components
 * @param mode - The mode to list UIs (latest, most_liked, most_viewed)
 * @param start - The start index for pagination
 * @param limit - The maximum number of UIs to return
 * @param timeRange - The time range to filter UIs (1h, 24h, 7d, 30d, all)
 * @returns The list UIs query
 */
export function useUiList(
  mode: "latest" | "most_liked" | "most_viewed" = "latest",
  start = 0,
  limit = 10,
  timeRange: "1h" | "24h" | "7d" | "30d" | "all" = "all",
) {
  const query = useApiQuery(
    listUisEndpoint.GET,
    undefined,
    { mode, start, limit, timeRange },
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: true,
      refetchOnMount: true,
      refetchOnReconnect: true,
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10_000),
    },
  );

  // Log errors if they occur
  if (query.error) {
    errorLogger("Error listing UI components:", query.error);
  }

  // Add a retry function for convenience
  const retry = useCallback(() => {
    void query.refetch();
  }, [query]);

  return {
    ...query,
    retry,
    // Add helper properties for common states
    isEmpty: !query.isLoading && !query.isError && !query.data?.uis.length,
    uis: query.data?.uis || [],
  };
}
