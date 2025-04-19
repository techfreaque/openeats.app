import { useApiMutation } from "next-vibe/client/hooks/mutation";
import { errorLogger } from "next-vibe/shared/utils/logger";
import { useCallback } from "react";

import subPromptEndpoint from "../subprompt/definition";
import type {
  CreateSubPromptRequestType,
  CreateSubPromptResponseType,
} from "../subprompt/schema";

/**
 * Hook for creating a subprompt with a more flexible interface
 * @returns The createSubPrompt mutation
 */
export function useCreateSubPromptV2() {
  const mutation = useApiMutation<
    CreateSubPromptRequestType,
    CreateSubPromptResponseType
  >(
    subPromptEndpoint.POST,
    {
      onError: (error) => {
        errorLogger("Error creating subprompt:", error);
      },
    },
    undefined,
  );

  /**
   * Create a subprompt
   * @param subPrompt - The subprompt text
   * @param uiId - The UI ID
   * @param subId - The SUB ID
   * @param modelId - The model ID
   * @param code - The code
   * @returns The created subprompt
   */
  const createSubPrompt = useCallback(
    async (
      subPrompt: string,
      uiId: string,
      subId: string,
      modelId?: string | null,
      code?: string,
    ) => {
      try {
        const response = await mutation.mutateAsync({
          requestData: {
            subPrompt,
            UIId: uiId,
            parentSUBId: subId,
            code: code || "",
            modelId: modelId || "",
          },
        });

        return response.data;
      } catch (error) {
        errorLogger("Error creating subprompt:", error);
        throw error;
      }
    },
    [mutation],
  );

  return {
    ...mutation,
    createSubPrompt,
  };
}
