import "server-only";

import type {
  ApiHandlerProps,
  ApiHandlerResult,
} from "next-vibe/server/endpoints/core/api-handler";
import { debugLogger, errorLogger } from "next-vibe/shared/utils/logger";

import { uiRepository } from "../../repository";
import type { ListUisRequestType, ListUisResponseType } from "./schema";

/**
 * List UI components
 * @param props - API handler props
 * @returns The list of UI components
 */
export async function listUis({
  urlParams,
}: ApiHandlerProps<unknown, ListUisRequestType>): Promise<
  ApiHandlerResult<ListUisResponseType>
> {
  try {
    debugLogger("Listing UI components", urlParams);

    // List the UI components
    const results = await uiRepository.listUis(
      urlParams.mode,
      urlParams.start,
      urlParams.limit,
      urlParams.timeRange,
    );

    return {
      success: true,
      data: { uis: results },
    };
  } catch (error) {
    errorLogger("Error listing UI components", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error",
      errorCode: 500,
    };
  }
}
