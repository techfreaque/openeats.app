import "server-only";

import type {
  ApiHandlerProps,
  ApiHandlerResult,
} from "next-vibe/server/endpoints/core/api-handler";
import { debugLogger, errorLogger } from "next-vibe/shared/utils/logger";

import { uiRepository } from "../../website-editor/repository";
import type {
  DeleteUiRequestType,
  DeleteUiResponseType,
  UpdateUiRequestType,
  UpdateUiResponseType,
} from "./schema";

/**
 * Update a UI component
 * @param props - API handler props
 * @returns The updated UI component
 */
export async function updateUi({
  data,
  user,
}: ApiHandlerProps<UpdateUiRequestType, undefined>): Promise<
  ApiHandlerResult<UpdateUiResponseType>
> {
  try {
    if (!user) {
      return {
        success: false,
        message: "Not authenticated",
        errorCode: 401,
      }  as ApiHandlerResult<UpdateUiResponseType>;
    }

    debugLogger("Updating UI component", { id: data.id });

    const uiComponent = await uiRepository.findById(data.id);

    if (!uiComponent) {
      return {
        success: false,
        message: "UI component not found",
        errorCode: 404,
      }  as ApiHandlerResult<UpdateUiResponseType>;
    }

    if (uiComponent.userId !== user.id) {
      return {
        success: false,
        message: "Unauthorized",
        errorCode: 401,
      }  as ApiHandlerResult<UpdateUiResponseType>;
    }

    const response: UpdateUiResponseType = {
      id: data.id,
      img: data.img,
      prompt: data.prompt,
    };

    return {
      success: true,
      data: response,
    };
  } catch (error) {
    errorLogger("Error updating UI component", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error",
      errorCode: 500,
    }  as ApiHandlerResult<UpdateUiResponseType>;
  }
}

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
    if (!user) {
      return {
        success: false,
        message: "Not authenticated",
        errorCode: 401,
      }  as ApiHandlerResult<DeleteUiResponseType>;
    }

    debugLogger("Deleting UI component", { id: data.id });

    await uiRepository.deleteUi(data.id, user.id);

    return {
      success: true,
      data: {
        success: true,
      },
    };
  } catch (error) {
    errorLogger("Error deleting UI component", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error",
      errorCode: 500,
    }  as ApiHandlerResult<DeleteUiResponseType>;
  }
}
