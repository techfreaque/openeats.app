import "server-only";

import type {
  ApiHandlerProps,
  ApiHandlerResult,
} from "next-vibe/server/endpoints/core/api-handler";
import { debugLogger, errorLogger } from "next-vibe/shared/utils/logger";

import { uiRepository } from "../../repository";
import type { GetUiDetailRequestType, GetUiDetailResponseType } from "./schema";

/**
 * Get UI details by ID
 * @param props - The API handler props
 * @returns The UI details
 */
export async function getUiDetail({
  user,
  data,
}: ApiHandlerProps<GetUiDetailRequestType, undefined>): Promise<
  ApiHandlerResult<GetUiDetailResponseType>
> {
  const id = data?.id;

  if (!id || typeof id !== "string") {
    return {
      success: false,
      message: "UI ID is required",
      errorCode: 400,
    } as ApiHandlerResult<GetUiDetailResponseType>;
  }

  try {
    debugLogger(`Getting UI details for ID: ${id}`, { userId: user.id });

    // Get the UI with subprompts
    const ui = await uiRepository.findByIdWithSubprompts(id);

    if (!ui) {
      return {
        success: false,
        message: `UI with ID ${id} not found`,
        errorCode: 404,
      } as ApiHandlerResult<GetUiDetailResponseType>;
    }

    return {
      success: true,
      data: ui,
    } as ApiHandlerResult<GetUiDetailResponseType>;
  } catch (error) {
    errorLogger("Error getting UI details:", error);
    return {
      success: false,
      message: "An error occurred while getting UI details",
      errorCode: 500,
    } as ApiHandlerResult<GetUiDetailResponseType>;
  }
}
