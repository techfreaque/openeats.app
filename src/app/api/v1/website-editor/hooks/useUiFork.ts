import { useApiMutation } from "next-vibe/client/hooks/mutation";
import { errorLogger } from "next-vibe/shared/utils/logger";
import { useCallback } from "react";

import forkUiEndpoint from "../ui/fork/definition";
import type { ForkUiRequestType, ForkUiResponseType } from "../ui/fork/schema";

/**
 * Hook to fork a UI component
 * @returns The fork UI mutation
 */
export function useUiFork() {
  const mutation = useApiMutation<ForkUiRequestType, ForkUiResponseType>(
    forkUiEndpoint.POST,
    {
      onError: (error) => {
        errorLogger("Error forking UI component:", error);
      },
    },
  );

  const forkUi = useCallback(
    async (uiId: string) => {
      try {
        return await mutation.mutateAsync({
          requestData: { uiId },
        });
      } catch (error) {
        errorLogger("Error forking UI component:", error);
        throw error;
      }
    },
    [mutation],
  );

  return {
    ...mutation,
    forkUi,
  };
}
