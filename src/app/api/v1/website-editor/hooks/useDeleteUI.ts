import { useApiMutation } from "next-vibe/client/hooks/mutation";
import { errorLogger } from "next-vibe/shared/utils/logger";
import { useCallback } from "react";

import uiEndpoint from "../ui/definition";

/**
 * Hook for deleting a UI
 * @returns The deleteUI mutation
 */
export function useDeleteUI() {
  const mutation = useApiMutation(
    uiEndpoint.DELETE,
    {
      onError: (error) => {
        errorLogger("Error deleting UI:", error);
      },
    },
    undefined,
  );

  /**
   * Delete a UI
   * @param id - The UI ID
   * @returns The deleted UI
   */
  const deleteUI = useCallback(
    async (id: string) => {
      try {
        const response = await mutation.mutateAsync({
          id,
        });

        return response.data;
      } catch (error) {
        errorLogger("Error deleting UI:", error);
        throw error;
      }
    },
    [mutation],
  );

  return {
    ...mutation,
    deleteUI,
  };
}
