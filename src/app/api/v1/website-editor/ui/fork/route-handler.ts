import "server-only";

import type {
  ApiHandlerProps,
  ApiHandlerResult,
} from "next-vibe/server/endpoints/core/api-handler";
import { debugLogger, errorLogger } from "next-vibe/shared/utils/logger";

import { uiRepository } from "../../repository";
import type { ForkUiRequestType, ForkUiResponseType } from "./schema";

/**
 * Fork a UI component
 * @param props - API handler props
 * @returns The forked UI component
 */
export async function forkUi({
  data,
  user,
}: ApiHandlerProps<ForkUiRequestType, undefined>): Promise<
  ApiHandlerResult<ForkUiResponseType>
> {
  try {
    debugLogger("Forking UI component", {
      userId: user.id,
      uiId: data.uiId,
    });

    // Fork the UI component
    const result = await uiRepository.forkUi(data.uiId, user.id);

    if (!result) {
      return {
        success: false,
        message: "Failed to fork UI component",
        errorCode: 500,
      } as unknown as ApiHandlerResult<ForkUiResponseType>;
    }

    return {
      success: true,
      data: result,
    } as ApiHandlerResult<ForkUiResponseType>;
  } catch (error) {
    errorLogger("Error forking UI component", error);

    // Handle specific error cases
    if (error instanceof Error) {
      if (error.message === "UI not found") {
        return {
          success: false,
          message: "UI component not found",
          errorCode: 404,
        } as unknown as ApiHandlerResult<ForkUiResponseType>;
      } else if (error.message === "Cannot fork your own UI") {
        return {
          success: false,
          message: "You cannot fork your own UI component",
          errorCode: 403,
        } as unknown as ApiHandlerResult<ForkUiResponseType>;
      }
    }

    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error",
      errorCode: 500,
    } as unknown as ApiHandlerResult<ForkUiResponseType>;
  }
}
