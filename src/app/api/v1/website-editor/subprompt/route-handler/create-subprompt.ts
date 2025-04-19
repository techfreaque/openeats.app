import "server-only";

import type {
  ApiHandlerProps,
  ApiHandlerResult,
} from "next-vibe/server/endpoints/core/api-handler";
import { debugLogger, errorLogger } from "next-vibe/shared/utils/logger";

import { subPromptRepository } from "../../repository";
import type {
  CreateSubPromptRequestType,
  CreateSubPromptResponseType,
} from "../schema";

/**
 * Create a new subprompt
 * @param props - API handler props
 * @returns The created subprompt
 */
export async function createSubPrompt({
  data,
  user,
}: ApiHandlerProps<CreateSubPromptRequestType, undefined>): Promise<
  ApiHandlerResult<CreateSubPromptResponseType>
> {
  try {
    debugLogger("Creating subprompt", { userId: user.id, data });

    // Generate the next SUB ID
    const subId = await subPromptRepository.generateNextSubId(
      data.UIId,
      data.parentSUBId,
    );

    // Create the subprompt with code
    const result = await subPromptRepository.createWithCode(
      {
        uiId: data.UIId,
        subPrompt: data.subPrompt,
        subId,
        modelId: data.modelId,
      },
      data.code,
    );

    // Transform the result to match the expected response format
    const response: CreateSubPromptResponseType = {
      id: result.id,
      createdAt: result.createdAt.toISOString(),
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
    errorLogger("Error creating subprompt", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error",
      errorCode: 500,
    } as ApiHandlerResult<CreateSubPromptResponseType>;
  }
}
