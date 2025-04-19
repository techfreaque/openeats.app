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
  requestData,
  user,
}: ApiHandlerProps<UpdateUiRequestType>): Promise<
  ApiHandlerResult<UpdateUiResponseType>
> {
  try {
    if (!user) {
      return {
        success: false,
        message: "Not authenticated",
        errorCode: 401,
      };
    }

    debugLogger("Updating UI component", { id: requestData.id });

    // Get the UI component
    const uiComponent = await uiRepository.findById(requestData.id);

    if (!uiComponent) {
      return {
        success: false,
        message: "UI component not found",
        errorCode: 404,
      };
    }

    // Check if the user owns the UI component
    if (uiComponent.userId !== user.id) {
      return {
        success: false,
        message: "Unauthorized",
        errorCode: 401,
      };
    }

    // Update the UI component
    // TODO: Implement the update logic in the repository
    // For now, we'll just return the request data
    const response: UpdateUiResponseType = {
      id: requestData.id,
      img: requestData.img,
      prompt: requestData.prompt,
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
    };
  }
}

/**
 * Delete a UI component
 * @param props - API handler props
 * @returns Success status
 */
export async function deleteUi({
  requestData,
  user,
}: ApiHandlerProps<DeleteUiRequestType>): Promise<
  ApiHandlerResult<DeleteUiResponseType>
> {
  try {
    if (!user) {
      return {
        success: false,
        message: "Not authenticated",
        errorCode: 401,
      };
    }

    debugLogger("Deleting UI component", { id: requestData.id });

    // Delete the UI component
    await uiRepository.deleteUi(requestData.id, user.id);

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
    };
  }
}
