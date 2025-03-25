"use server";

import type { UiType } from "@prisma/client";

import type {
  FullUI,
  UiType as _UiType,
} from "@/client-package/types/website-editor";
import { prisma } from "@/next-portal/db";

export const createUI = async (
  prompt: string,
  userId: string,
  uiType: _UiType,
): Promise<FullUI> => {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });
  if (!user) {
    throw new Error("User not found");
  }

  const data = await prisma.uI.create({
    data: {
      userId: userId,
      prompt: prompt,
      uiType: uiType as unknown as UiType,
      updatedAt: new Date(),
      img: "",
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
  return data;
};
