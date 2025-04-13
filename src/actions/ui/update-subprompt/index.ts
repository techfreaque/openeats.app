"use server";

import { errorLogger } from "next-vibe/shared/utils/logger";

import { db } from "next-vibe/server/db";

import {
  type CreateSubPromptReturn,
  subPromptSelect,
} from "../create-subprompt";

export const updateSubPrompt = async (
  UIId: string,
  code: string,
  modelId: string,
  subid?: string,
): Promise<CreateSubPromptReturn | null> => {
  try {
    const existingSubPrompt = await db.subPrompt.findFirst({
      where: {
        UIId: UIId,
        ...(subid ? { SUBId: subid } : {}),
      },
    });

    if (!existingSubPrompt) {
      return null;
    }

    const data = await db.subPrompt.update({
      where: {
        id: existingSubPrompt.id,
      },
      data: {
        code: {
          create: {
            code: code,
          },
        },
        modelId: modelId,
      },
      select: subPromptSelect,
    });

    return data as CreateSubPromptReturn;
  } catch (error) {
    errorLogger("Error updating subprompt:", error);
    return null;
  }
};
