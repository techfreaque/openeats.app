import { create } from "zustand";

type Theme =
  | "default"
  | "ruby"
  | "sapphire"
  | "emerald"
  | "windows98"
  | "daylight"
  | "midnight"
  | "pastel"
  | "deepsea";

interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const useTheme = create<ThemeState>((set) => ({
  theme: "default",
  setTheme: (theme: Theme): void => set({ theme }),
}));

export default useTheme;
