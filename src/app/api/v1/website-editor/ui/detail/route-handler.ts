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
export async function getUiDetail(
  props: ApiHandlerProps<
    undefined,
    GetUiDetailRequestType,
    Record<string, never>
  >,
): Promise<ApiHandlerResult<GetUiDetailResponseType>> {
  const { urlParams } = props;
  const { id } = urlParams;

  try {
    debugLogger(`Getting UI details for ID: ${id}`);

    // Get the UI with subprompts
    const ui = await uiRepository.findByIdWithSubprompts(id);

    if (!ui) {
      return {
        status: 404,
        error: {
          code: "UI_NOT_FOUND",
          message: `UI with ID ${id} not found`,
        },
      };
    }

    return {
      status: 200,
      data: ui,
    };
  } catch (error) {
    errorLogger("Error getting UI details:", error);
    return {
      status: 500,
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "An error occurred while getting UI details",
      },
    };
  }
}
