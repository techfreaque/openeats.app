"use server";
import { db } from "next-vibe/server/db";
import { errorLogger } from "next-vibe/shared/utils/logger";

import type { FullUI } from "@/lib/website-editor/types";

export async function forkUI(uiId: string, userId: string): Promise<FullUI> {
  try {
    if (!userId) {
      throw new Error("Unauthorized");
    }

    const originalUI = await db.uI.findUnique({
      where: {
        id: uiId,
      },
      select: {
        id: true,
        uiType: true,
        userId: true,
        prompt: true,
        public: true,
        img: true,
        subPrompts: {
          select: {
            SUBId: true,
            subPrompt: true,
            code: {
              select: {
                id: true,
              },
            },
          },
        },
      },
    });

    if (!originalUI) {
      throw new Error("UI not found");
    }

    if (userId === originalUI.userId) {
      throw new Error("Cannot fork your own UI");
    }

    const forkedUI = await db.uI.create({
      data: {
        userId: userId,
        prompt: originalUI.prompt,
        img: originalUI.img,
        forkedFrom: originalUI.id,
        updatedAt: new Date(),
        uiType: originalUI.uiType,
        subPrompts: {
          create: originalUI.subPrompts.map((subPrompt) => ({
            SUBId: subPrompt.SUBId,
            subPrompt: subPrompt.subPrompt,
            codeId: subPrompt.code!.id,
          })),
        },
      },
      select: {
        id: true,
        uiType: true,
        user: {
          select: {
            id: true,
            firstName: true,
            imageUrl: true,
          },
        },
        prompt: true,
        public: true,
        img: true,
        viewCount: true,
        likesCount: true,
        forkedFrom: true,
        createdAt: true,
        updatedAt: true,
        subPrompts: {
          select: {
            id: true,
            UIId: true,
            SUBId: true,
            createdAt: true,
            subPrompt: true,
            modelId: true,
            code: {
              select: {
                id: true,
                code: true,
              },
            },
          },
        },
      },
    });

    if (!forkedUI) {
      throw new Error("Failed to fork UI");
    }

    return forkedUI;
  } catch (error) {
    errorLogger("[FORK_UI]", error);
    throw error;
  }
}
