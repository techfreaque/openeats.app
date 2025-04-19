"use server";

import { errorLogger } from "next-vibe/shared/utils/logger";

import { uiRepository } from "@/app/api/v1/website-editor/repository";

/**
 * Server action to delete a UI component
 * This is now a wrapper around the API endpoint
 */
export const deleteUI = async (uiid: string, userId: string): Promise<void> => {
  try {
    // Delete the UI component using the repository
    await uiRepository.deleteUi(uiid, userId);
  } catch (error) {
    errorLogger("Error deleting UI component:", error);
    throw error;
  }
};
