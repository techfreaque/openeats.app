import "./global.css";

import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { DatabaseProvider } from "../lib/context/DatabaseContext";
import { AppModeProvider } from "../lib/context/UserTypeContext";

declare global {
  interface Window {
    frameworkReady?: () => void;
  }
}

export default function RootLayout() {
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.frameworkReady?.();
    }
  }, []);

  return (
    <SafeAreaProvider>
      <DatabaseProvider>
        <AppModeProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          </Stack>
          <StatusBar style="auto" />
        </AppModeProvider>
      </DatabaseProvider>
    </SafeAreaProvider>
  );
}
