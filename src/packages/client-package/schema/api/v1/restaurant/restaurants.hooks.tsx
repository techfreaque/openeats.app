import type { z } from "zod";
import { create } from "zustand";

import type { EnhancedQueryResult } from "@/next-portal/client/api/types";
import { useApiQuery } from "@/next-portal/client/api/use-api-query";

import { restaurantsEndpoint } from "./restaurants";

const useRestaurantsStore = create<{
  data: EnhancedQueryResult<
    z.input<typeof restaurantsEndpoint.responseSchema>,
    Error
  > | null;
  fetch: (
    requestData: z.input<typeof restaurantsEndpoint.requestSchema>,
    pathParams: z.input<typeof restaurantsEndpoint.requestUrlSchema>,
  ) => void;
}>((set) => ({
  data: null,
  fetch: (requestData, pathParams) => {
    const result = useApiQuery(restaurantsEndpoint, requestData, pathParams, {
      staleTime: 1000 * 60 * 30, // Cache results for 30 minutes
    });
    set({ data: result });
  },
}));

export function useRestaurantsApi({
  requestData,
  pathParams,
}: {
  requestData: z.input<typeof restaurantsEndpoint.requestSchema>;
  pathParams: z.input<typeof restaurantsEndpoint.requestUrlSchema>;
}): EnhancedQueryResult<
  z.input<typeof restaurantsEndpoint.responseSchema>,
  Error
> {
  const store = useRestaurantsStore();

  // Initialize if not already fetched
  if (!store.data) {
    store.fetch(requestData, pathParams);
  }

  return (
    store.data ||
    ({} as EnhancedQueryResult<
      z.input<typeof restaurantsEndpoint.responseSchema>,
      Error
    >)
  );
}
