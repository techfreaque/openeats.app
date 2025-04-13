"use server";

import { db } from "next-vibe/server/db";

export const toggleLike = async (
  userId: string,
  UIId: string,
): Promise<{
  liked: boolean;
}> => {
  const existingLike = await db.like.findFirst({
    where: { userId, UIId },
  });

  if (existingLike) {
    await db.like.delete({
      where: {
        id: existingLike.id,
      },
    });
    await db.uI.update({
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
    await db.like.create({
      data: {
        userId,
        UIId,
      },
    });
    await db.uI.update({
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
