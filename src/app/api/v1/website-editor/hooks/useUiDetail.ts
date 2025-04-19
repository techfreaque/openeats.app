import { useApiQuery } from "next-vibe/client/hooks/query";
import { errorLogger } from "next-vibe/shared/utils/logger";
import { useCallback } from "react";

import uiDetailEndpoint from "../ui/detail/definition";

/**
 * Hook to get UI details by ID
 * @param id - The UI ID
 * @returns The UI detail query
 */
export function useUiDetail(id: string) {
  const query = useApiQuery(
    uiDetailEndpoint.GET,
    undefined,
    { id },
    {
      enabled: !!id,
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
      refetchOnMount: true,
      refetchOnReconnect: true,
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10_000),
    },
  );

  // Log errors if they occur
  if (query.error) {
    errorLogger("Error fetching UI details:", query.error);
  }

  // Add a retry function for convenience
  const retry = useCallback(() => {
    void query.refetch();
  }, [query]);

  return {
    ...query,
    retry,
    // Add helper properties for common states
    isEmpty: !query.isLoading && !query.isError && !query.data,
  };
}
