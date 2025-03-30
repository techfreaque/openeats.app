import { create } from "zustand";

interface AuthModalStore {
  isOpen: boolean;
  toggle: () => void;
}

export const useAuthModal = create<AuthModalStore>((set) => ({
  isOpen: false,
  toggle: (): void => set((state) => ({ isOpen: !state.isOpen })),
}));
