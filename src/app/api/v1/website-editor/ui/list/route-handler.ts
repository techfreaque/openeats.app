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
  data,
}: ApiHandlerProps<ListUisRequestType, undefined>): Promise<
  ApiHandlerResult<ListUisResponseType>
> {
  try {
    debugLogger("Listing UI components", data);

    // List the UI components
    const results = await uiRepository.listUis(
      data.mode,
      data.start,
      data.limit,
      data.timeRange,
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
    } as ApiHandlerResult<ListUisResponseType>;
  }
}
