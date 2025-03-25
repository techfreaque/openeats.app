"use server";

import type { FullUI } from "@/client-package/types/website-editor";
import { prisma } from "@/next-portal/db";

export const updateUI = async (
  UIId: string,
  payload: object,
): Promise<FullUI> => {
  const data = await prisma.uI.update({
    where: {
      id: UIId,
    },
    data: {
      ...payload,
      updatedAt: new Date(),
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
          codeId: true,
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
