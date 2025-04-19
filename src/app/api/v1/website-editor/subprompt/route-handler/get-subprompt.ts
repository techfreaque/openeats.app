import "server-only";

import type {
  ApiHandlerProps,
  ApiHandlerResult,
} from "next-vibe/server/endpoints/core/api-handler";
import { debugLogger, errorLogger } from "next-vibe/shared/utils/logger";

import { subPromptRepository } from "../../repository";
import type {
  GetSubPromptRequestType,
  GetSubPromptResponseType,
} from "../schema";

/**
 * Get a subprompt by ID
 * @param props - API handler props
 * @returns The subprompt
 */
export async function getSubPrompt({
  urlParams,
}: ApiHandlerProps<unknown, GetSubPromptRequestType>): Promise<
  ApiHandlerResult<GetSubPromptResponseType>
> {
  try {
    debugLogger("Getting subprompt", { id: urlParams.id });

    // Get the subprompt
    const result = await subPromptRepository.findById(urlParams.id);

    if (!result) {
      return {
        success: false,
        message: "Subprompt not found",
        errorCode: 404,
      };
    }

    // Transform the result to match the expected response format
    const response: GetSubPromptResponseType = {
      id: result.id,
      createdAt: result.createdAt,
      subPrompt: result.subPrompt,
      UIId: result.uiId,
      SUBId: result.subId,
      modelId: result.modelId,
      code: {
        id: result.code.id,
        code: result.code.code,
      },
    };

    return {
      success: true,
      data: response,
    };
  } catch (error) {
    errorLogger("Error getting subprompt", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error",
      errorCode: 500,
    };
  }
}
