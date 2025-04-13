"use server";

import { db } from "next-vibe/server/db";

export const deleteUI = async (uiid: string, userId: string): Promise<void> => {
  const ui = await db.uI.findUnique({
    where: {
      id: uiid,
    },
    select: {
      userId: true,
    },
  });

  if (!ui) {
    throw new Error("UI not found");
  }

  if (ui.userId !== userId) {
    throw new Error("Unauthorized");
  }

  await db.uI.delete({
    where: {
      id: uiid,
    },
  });
};
