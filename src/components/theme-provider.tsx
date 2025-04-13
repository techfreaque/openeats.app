"use client";
import type { ThemeProviderProps } from "next-themes";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { JSX } from "react";

export function ThemeProvider({
  children,
  ...props
}: ThemeProviderProps): JSX.Element {
  return <NextThemesProvider 
    attribute="class"
    defaultTheme="light"
    forcedTheme="light"
    enableSystem={false}
    disableTransitionOnChange={false}
    {...props}
  >
    {children}
  </NextThemesProvider>;
}
