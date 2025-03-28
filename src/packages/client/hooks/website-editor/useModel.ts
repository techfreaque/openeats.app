"use client";
import { create } from "zustand";

import { getLocalStorageItem } from "@/lib/website-editor/localStorage";

interface ModelStore {
  initialModel: string;
  modifierModel: string;
  descriptiveModel: string;
  imageModel: string;
  setInitialModel: (model: string) => void;
  setModifierModel: (model: string) => void;
  setDescriptiveModel: (model: string) => void;
  setImageModel: (model: string) => void;
}

export const useModel = create<ModelStore>((set) => ({
  initialModel: getLocalStorageItem(
    "initialModel",
    "google:gemini-1.5-pro-002",
  ),
  modifierModel: getLocalStorageItem(
    "modifierModel",
    "groq:llama-3.1-70b-versatile",
  ),
  descriptiveModel: getLocalStorageItem(
    "descriptiveModel",
    "google:gemini-1.5-pro-002",
  ),
  imageModel: getLocalStorageItem("imageModel", "mistral:pixtral-12b-2409"),
  setInitialModel: (model): void =>
    set(() => {
      localStorage.setItem("initialModel", model);
      return { initialModel: model };
    }),
  setModifierModel: (model): void =>
    set(() => {
      localStorage.setItem("modifierModel", model);
      return { modifierModel: model };
    }),
  setDescriptiveModel: (model): void =>
    set(() => {
      localStorage.setItem("descriptiveModel", model);
      return { descriptiveModel: model };
    }),
  setImageModel: (model): void =>
    set(() => {
      localStorage.setItem("imageModel", model);
      return { imageModel: model };
    }),
}));
