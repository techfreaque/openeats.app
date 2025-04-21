import type { Ui } from "@/app/api/v1/website-editor/db";

export enum UiType {
  SHADCN_REACT = "shadcn_react",
}

export interface FullUI extends Ui {
  user: {
    id: string;
    firstName: string;
    imageUrl?: string | null;
  };
  subPrompts: Array<{
    id: string;
    uiId: string;
    subId: string;
    createdAt: Date;
    subPrompt: string;
    modelId?: string | null;
    code?: {
      id: string;
      code: string;
    };
  }>;
}
