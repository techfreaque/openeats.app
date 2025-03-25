"use server";

import { prisma } from "@/next-portal/db";

export const toggleLike = async (
  userId: string,
  UIId: string,
): Promise<{
  liked: boolean;
}> => {
  const existingLike = await prisma.like.findFirst({
    where: { userId, UIId },
  });

  if (existingLike) {
    await prisma.like.delete({
      where: {
        id: existingLike.id,
      },
    });
    await prisma.uI.update({
      where: {
        id: UIId,
      },
      data: {
        likesCount: {
          decrement: 1,
        },
      },
    });
    return { liked: false };
  } else {
    await prisma.like.create({
      data: {
        userId,
        UIId,
      },
    });
    await prisma.uI.update({
      where: {
        id: UIId,
      },
      data: {
        likesCount: {
          increment: 1,
        },
      },
    });
    return { liked: true };
  }
};
