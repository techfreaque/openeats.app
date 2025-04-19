import "server-only";

import type {
  ApiHandlerProps,
  ApiHandlerResult,
} from "next-vibe/server/endpoints/core/api-handler";
import { debugLogger, errorLogger } from "next-vibe/shared/utils/logger";

import { uiRepository } from "../../repository";
import type { DeleteUiRequestType, DeleteUiResponseType } from "./schema";

/**
 * Delete a UI component
 * @param props - API handler props
 * @returns Success status
 */
export async function deleteUi({
  data,
  user,
}: ApiHandlerProps<DeleteUiRequestType, undefined>): Promise<
  ApiHandlerResult<DeleteUiResponseType>
> {
  try {
    debugLogger("Deleting UI component", {
      userId: user.id,
      uiId: data.id,
    });

    // Delete the UI component
    await uiRepository.deleteUi(data.id, user.id);

    return {
      success: true,
      data: { success: true },
    };
  } catch (error) {
    errorLogger("Error deleting UI component", error);

    // Handle specific error cases
    if (error instanceof Error) {
      if (error.message === "UI component not found") {
        return {
          success: false,
          message: "UI component not found",
          errorCode: 404,
        } as unknown as ApiHandlerResult<DeleteUiResponseType>;
      } else if (error.message === "Unauthorized") {
        return {
          success: false,
          message: "You are not authorized to delete this UI component",
          errorCode: 403,
        } as unknown as ApiHandlerResult<DeleteUiResponseType>;
      }
    }

    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error",
      errorCode: 500,
    } as unknown as ApiHandlerResult<DeleteUiResponseType>;
  }
}
