import { useApiMutation } from "next-vibe/client/hooks/mutation";
import { errorLogger } from "next-vibe/shared/utils/logger";
import { useCallback } from "react";

import uiEndpoint from "../ui/definition";

/**
 * Hook for updating a UI
 * @returns The updateUI mutation
 */
export function useUpdateUI() {
  const mutation = useApiMutation(
    uiEndpoint.PUT,
    {
      onError: (error) => {
        errorLogger("Error updating UI:", error);
      },
    },
    undefined,
  );

  /**
   * Update a UI
   * @param id - The UI ID
   * @param data - The data to update
   * @returns The updated UI
   */
  const updateUI = useCallback(
    async (id: string, data: { img?: string; prompt?: string }) => {
      try {
        const response = await mutation.mutateAsync({
          id,
          ...data,
        });

        return response.data;
      } catch (error) {
        errorLogger("Error updating UI:", error);
        throw error;
      }
    },
    [mutation],
  );

  return {
    ...mutation,
    updateUI,
  };
}
