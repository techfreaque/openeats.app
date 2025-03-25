import AsyncStorage from "@react-native-async-storage/async-storage";
import type { JSX, ReactNode } from "react";
import React, { createContext, useContext, useEffect, useState } from "react";

type AppMode = "customer" | "restaurant" | "driver";

type AppModeContextType = {
  appMode: AppMode;
  setAppMode: (mode: AppMode) => void;
};

const AppModeContext = createContext<AppModeContextType | undefined>(undefined);

export function AppModeProvider({ children }: { children: ReactNode }): JSX.Element {
  const [appMode, setAppModeSt] = useState<AppMode>("customer");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load stored user type when component mounts
    const loadAppMode = async () => {
      try {
        const storedMode = await AsyncStorage.getItem("appMode");
        if (storedMode && (storedMode === "customer" || storedMode === "restaurant" || storedMode === "driver")) {
          setAppModeSt(storedMode as AppMode);
        }
      } catch (error) {
        console.error("Failed to load app mode:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadAppMode();
  }, []);

  const setAppMode = async (mode: AppMode) => {
    try {
      await AsyncStorage.setItem("appMode", mode);
      setAppModeSt(mode);
    } catch (error) {
      console.error("Failed to save app mode:", error);
    }
  };

  if (isLoading) {
    // You could return a loading state here if needed
    return null;
  }

  return (
    <AppModeContext.Provider value={{ appMode, setAppMode }}>
      {children}
    </AppModeContext.Provider>
  );
}

export function useAppModeType(): AppModeContextType {
  const context = useContext(AppModeContext);
  if (context === undefined) {
    throw new Error("useAppModeType must be used within an AppModeProvider");
  }
  return context;
}
