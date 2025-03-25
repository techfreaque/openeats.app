"use server";

import { prisma } from "@/next-portal/db";

export const deleteUI = async (uiid: string, userId: string): Promise<void> => {
  const ui = await prisma.uI.findUnique({
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

  await prisma.uI.delete({
    where: {
      id: uiid,
    },
  });
};
