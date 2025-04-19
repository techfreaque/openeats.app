import { useApiMutation } from "next-vibe/client/hooks/mutation";
import { errorLogger } from "next-vibe/shared/utils/logger";
import { useCallback } from "react";

import subPromptEndpoint from "../subprompt/definition";

/**
 * Hook for updating a subprompt
 * @returns The updateSubPrompt mutation
 */
export function useUpdateSubPrompt() {
  const mutation = useApiMutation(
    subPromptEndpoint.PUT,
    {
      onError: (error) => {
        errorLogger("Error updating subprompt:", error);
      },
    },
    undefined,
  );

  /**
   * Update a subprompt
   * @param uiId - The UI ID
   * @param response - The response data
   * @param modelId - The model ID
   * @param subId - The SUB ID
   * @returns The updated subprompt
   */
  const updateSubPrompt = useCallback(
    async (
      uiId: string,
      response: any,
      modelId: string | null,
      subId: string,
    ) => {
      try {
        const responseData = await mutation.mutateAsync({
          uiId,
          response,
          modelId,
          subId,
        });

        return responseData.data;
      } catch (error) {
        errorLogger("Error updating subprompt:", error);
        throw error;
      }
    },
    [mutation],
  );

  return {
    ...mutation,
    updateSubPrompt,
  };
}
