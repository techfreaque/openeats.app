"use server";

import type { Prisma } from "@prisma/client";

import type { FullUI } from "@/client-package/types/website-editor";
import { prisma } from "@/next-portal/db";

export const getUIs = async (
  mode: string,
  start: number,
  limit: number,
  timeRange: string,
): Promise<FullUI[]> => {
  let orderBy:
    | Prisma.UIOrderByWithRelationInput
    | Prisma.UIOrderByWithRelationInput[]
    | undefined;
  let where: Prisma.UIWhereInput = {};

  switch (mode) {
    case "latest":
      orderBy = { createdAt: "desc" };
      break;
    case "most_liked":
      orderBy = [{ likesCount: "desc" }, { createdAt: "asc" }];
      break;
    case "most_viewed":
      orderBy = [{ viewCount: "desc" }, { createdAt: "asc" }];
      break;
    default:
      orderBy = { createdAt: "desc" };
  }

  const now = new Date();
  if (mode !== "latest") {
    switch (timeRange) {
      case "1h":
        where.createdAt = { gte: new Date(now.getTime() - 60 * 60 * 1000) };
        break;
      case "24h":
        where.createdAt = {
          gte: new Date(now.getTime() - 24 * 60 * 60 * 1000),
        };
        break;
      case "7d":
        where.createdAt = {
          gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
        };
        break;
      case "30d":
        where.createdAt = {
          gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
        };
        break;
      case "all":
      default:
        break;
    }
  }

  const uis = await prisma.uI.findMany({
    take: limit,
    skip: start,
    where,
    orderBy,
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

  return uis;
};

export const getUI = async (UIId: string): Promise<FullUI | null> => {
  const ui = await prisma.uI.findUnique({
    where: {
      id: UIId,
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
  return ui;
};

export const getUIHome = async (): Promise<FullUI[]> => {
  const uis = await prisma.uI.findMany({
    take: 11,
    orderBy: { updatedAt: "desc" },
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
  return uis;
};

export const getUIProfile = async (
  userId: string,
  start: number,
  limit: number,
  mode: string,
): Promise<FullUI[]> => {
  if (!userId) {
    return [];
  }

  if (mode === "ownUI") {
    const uis = await prisma.uI.findMany({
      take: limit,
      skip: start,
      where: {
        userId,
      },
      orderBy: { createdAt: "desc" },
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
    return uis;
  } else if (mode === "likedUI") {
    const likedUIs = await prisma.like.findMany({
      where: {
        userId,
      },
      skip: start,
      take: limit,
      select: { UIId: true },
    });

    const uiIds = likedUIs.map((like) => like.UIId);

    const uis = await prisma.uI.findMany({
      where: {
        id: {
          in: uiIds,
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
      orderBy: { createdAt: "desc" },
    });

    return uis;
  }

  return [];
};
