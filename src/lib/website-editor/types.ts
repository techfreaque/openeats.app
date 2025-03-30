import type { Prisma } from "@prisma/client";

export enum UiType {
  SHADCN_REACT = "shadcn_react",
  NEXTUI_REACT = "nextui_react",
}

export type FullUI = Prisma.UIGetPayload<{
  select: {
    id: true;
    uiType: true;
    user: {
      select: {
        id: true;
        firstName: true;
        imageUrl: true;
      };
    };
    prompt: true;
    public: true;
    img: true;
    viewCount: true;
    likesCount: true;
    forkedFrom: true;
    createdAt: true;
    updatedAt: true;
    subPrompts: {
      select: {
        id: true;
        UIId: true;
        SUBId: true;
        createdAt: true;
        subPrompt: true;
        modelId: true;
        code: {
          select: {
            id: true;
            code: true;
          };
        };
      };
    };
  };
}>;
