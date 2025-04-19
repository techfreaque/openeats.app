"use server";

import { errorLogger } from "next-vibe/shared/utils/logger";

import { uiRepository } from "@/app/api/v1/website-editor/repository";
import type { FullUI } from "@/lib/website-editor/types";

export const updateUI = async (
  UIId: string,
  _payload: object, // Unused for now
): Promise<FullUI> => {
  try {
    // This is a placeholder for now
    // In a real implementation, we would add an updateUi method to the repository
    // For now, we'll just get the UI and return it without updating
    // The payload parameter is ignored for now
    const result = await uiRepository.findByIdWithSubprompts(UIId);

    if (!result) {
      throw new Error("UI not found");
    }

    return result as FullUI;
  } catch (error) {
    errorLogger("Error updating UI:", error);
    throw error;
  }
};
