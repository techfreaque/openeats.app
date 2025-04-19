import { useApiMutation } from "next-vibe/client/hooks/mutation";
import { useApiQuery } from "next-vibe/client/hooks/query";
import { errorLogger } from "next-vibe/shared/utils/logger";
import { useCallback } from "react";

import subPromptEndpoint from "../subprompt/definition";
import type {
  CreateSubPromptRequestType,
  CreateSubPromptResponseType,
} from "../subprompt/schema";

/**
 * Hook to get a subprompt by ID
 * @param id - The subprompt ID
 * @returns The subprompt query
 */
export function useSubPrompt(id: string) {
  const query = useApiQuery(
    subPromptEndpoint.GET,
    undefined,
    { id },
    {
      enabled: !!id,
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
    errorLogger("Error fetching subprompt:", query.error);
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

/**
 * Hook to create a new subprompt
 * @returns The create subprompt mutation
 */
export function useCreateSubPrompt() {
  const mutation = useApiMutation<
    CreateSubPromptRequestType,
    CreateSubPromptResponseType
  >(subPromptEndpoint.POST, {
    onError: (error) => {
      errorLogger("Error creating subprompt:", error);
    },
  });

  const createSubPrompt = useCallback(
    async (
      subPrompt: string,
      UIId: string,
      parentSUBId: string,
      code: string,
      modelId: string,
    ) => {
      return await mutation.mutateAsync({
        requestData: {
          subPrompt,
          UIId,
          parentSUBId,
          code,
          modelId,
        },
      });
    },
    [mutation],
  );

  return {
    ...mutation,
    createSubPrompt,
  };
}
