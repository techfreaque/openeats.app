import "server-only";

import type {
  ApiHandlerProps,
  ApiHandlerResult,
} from "next-vibe/server/endpoints/core/api-handler";
import { debugLogger, errorLogger } from "next-vibe/shared/utils/logger";

import { uiRepository } from "../../repository";
import type { ToggleLikeRequestType, ToggleLikeResponseType } from "./schema";

/**
 * Toggle like on a UI component
 * @param props - API handler props
 * @returns Whether the UI component is liked after the toggle
 */
export async function toggleLike({
  data,
  user,
}: ApiHandlerProps<ToggleLikeRequestType>): Promise<
  ApiHandlerResult<ToggleLikeResponseType>
> {
  try {
    debugLogger("Toggling like on UI component", {
      userId: user.id,
      UIId: data.UIId,
    });

    // Toggle the like
    const liked = await uiRepository.toggleLike(user.id, data.UIId);

    return {
      success: true,
      data: { liked },
    };
  } catch (error) {
    errorLogger("Error toggling like on UI component", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error",
      errorCode: 500,
    };
  }
}
