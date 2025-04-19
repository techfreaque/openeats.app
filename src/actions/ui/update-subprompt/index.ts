"use server";

import { errorLogger } from "next-vibe/shared/utils/logger";

import { subPromptRepository } from "@/app/api/v1/website-editor/repository";

import type { CreateSubPromptReturn } from "../create-subprompt";

export const updateSubPrompt = async (
  UIId: string,
  code: string,
  modelId: string,
  subid?: string,
): Promise<CreateSubPromptReturn | null> => {
  try {
    // Find the subprompt by UI ID and SUB ID
    let subPromptId;
    if (subid) {
      // Find by UI ID and SUB ID
      const subPrompts = await subPromptRepository.findByUiId(UIId);
      const existingSubPrompt = subPrompts.find((sp) => sp.subId === subid);
      if (!existingSubPrompt) {
        return null;
      }
      subPromptId = existingSubPrompt.id;
    } else {
      // Find the first subprompt for the UI
      const subPrompts = await subPromptRepository.findByUiId(UIId);
      if (!subPrompts || subPrompts.length === 0) {
        return null;
      }
      subPromptId = subPrompts[0]?.id;
      if (!subPromptId) {
        return null;
      }
    }

    // Get the existing subprompt
    const existingSubPrompt = await subPromptRepository.findById(subPromptId);
    if (!existingSubPrompt) {
      return null;
    }

    // Create a new subprompt with the updated code
    const result = await subPromptRepository.createWithCode(
      {
        uiId: UIId,
        subPrompt: existingSubPrompt.subPrompt,
        subId: existingSubPrompt.subId,
        modelId,
      },
      code,
    );

    // Transform the result to match the expected response format
    const data = {
      id: result.id,
      createdAt: result.createdAt,
      subPrompt: result.subPrompt,
      UIId: result.uiId,
      SUBId: result.subId,
      modelId: result.modelId,
      code: {
        id: result.code.id,
        code: result.code.code,
      },
    };

    return data as CreateSubPromptReturn;
  } catch (error) {
    errorLogger("Error updating subprompt:", error);
    return null;
  }
};
