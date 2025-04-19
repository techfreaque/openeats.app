"use server";

import { errorLogger } from "next-vibe/shared/utils/logger";

import { codeRepository } from "@/app/api/v1/website-editor/repository";

/**
 * Server action to get code by ID
 * This is now a wrapper around the API endpoint
 */
export const getCodeFromId = async (
  codeId: string,
): Promise<string | undefined> => {
  try {
    // Get the code using the repository
    const code = await codeRepository.findById(codeId);
    return code?.code;
  } catch (error) {
    errorLogger("Error getting code:", error);
    return undefined;
  }
};
