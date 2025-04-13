"use server";

import { db } from "next-vibe/server/db";

import type { FullUI } from "@/lib/website-editor/types";

export const updateUI = async (
  UIId: string,
  payload: object,
): Promise<FullUI> => {
  const data = await db.uI.update({
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
