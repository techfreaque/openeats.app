import "server-only";

import type {
  ApiHandlerProps,
  ApiHandlerResult,
} from "next-vibe/server/endpoints/core/api-handler";
import { debugLogger, errorLogger } from "next-vibe/shared/utils/logger";

import { codeRepository } from "../../website-editor/repository";
import type { GetCodeRequestType, GetCodeResponseType } from "./schema";

/**
 * Get code by ID
 * @param props - API handler props
 * @returns The code
 */
export async function getCode({
  urlParams,
}: ApiHandlerProps<unknown, GetCodeRequestType>): Promise<
  ApiHandlerResult<GetCodeResponseType>
> {
  try {
    debugLogger("Getting code", { id: urlParams.id });

    // Get the code
    const result = await codeRepository.findById(urlParams.id);

    if (!result) {
      return {
        success: false,
        message: "Code not found",
        errorCode: 404,
      };
    }

    // Transform the result to match the expected response format
    const response: GetCodeResponseType = {
      id: result.id,
      code: result.code,
    };

    return {
      success: true,
      data: response,
    };
  } catch (error) {
    errorLogger("Error getting code", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error",
      errorCode: 500,
    };
  }
}
