import { useApiQuery } from "next-vibe/client/hooks/query";
import { errorLogger } from "next-vibe/shared/utils/logger";
import { useCallback } from "react";

import codeEndpoint from "../code/definition";

/**
 * Hook to get code by ID
 * @param id - The code ID
 * @returns The code query
 */
export function useCode(id: string) {
  const query = useApiQuery(
    codeEndpoint.GET,
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
    errorLogger("Error fetching code:", query.error);
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
    code: query.data?.code || "",
  };
}
