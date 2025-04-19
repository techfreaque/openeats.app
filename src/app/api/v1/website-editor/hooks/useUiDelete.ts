import { useApiMutation } from "next-vibe/client/hooks/mutation";
import { errorLogger } from "next-vibe/shared/utils/logger";
import { useCallback } from "react";

import deleteUiEndpoint from "../ui/delete/definition";
import type { DeleteUiResponseType } from "../ui/delete/schema";

/**
 * Hook to delete a UI component
 * @returns The delete UI mutation
 */
export function useUiDelete() {
  const mutation = useApiMutation<
    unknown,
    DeleteUiResponseType,
    { id: string }
  >(deleteUiEndpoint.DELETE, {
    onError: (error) => {
      errorLogger("Error deleting UI component:", error);
    },
  });

  const deleteUi = useCallback(
    async (id: string) => {
      try {
        return await mutation.mutateAsync({
          urlParams: { id },
        });
      } catch (error) {
        errorLogger("Error deleting UI component:", error);
        throw error;
      }
    },
    [mutation],
  );

  return {
    ...mutation,
    deleteUi,
  };
}
