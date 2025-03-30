import { UiType } from "openeats-client/types/website-editor";
import { create } from "zustand";

interface UIInput {
  input: string;
  imageBase64: string;
  loading: boolean;
  uiType: UiType;
  setInput: (val: string) => void;
  setLoading: (val: boolean) => void;
  setImageBase64: (val: string) => void;
  setUIType: (val: UiType) => void;
}

export const useUIState = create<UIInput>((set) => ({
  input: "",
  imageBase64: "",
  loading: false,
  uiType: UiType.SHADCN_REACT,
  setInput: (val): void => set(() => ({ input: val })),
  setLoading: (val): void => set(() => ({ loading: val })),
  setImageBase64: (val): void => set(() => ({ imageBase64: val })),
  setUIType: (val): void => set(() => ({ uiType: val })),
}));
