"use client";

import { errorLogger } from "next-query-portal/shared/utils/logger";
import type { JSX, ReactNode } from "react";
import { createContext, useContext, useState } from "react";

import { translations } from "@/app/translations";

import type { TranslationKey, TranslationValue } from "./types";

// Define supported languages
export type Language = "en" | "es" | "fr" | "de" | "zh";

// Translation context type
interface TranslationContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: <K extends TranslationKey>(
    key: K,
    params?: TranslationValue<K> extends string
      ? Record<string, string | number>
      : never,
  ) => string;
}

// Create context with default values
export const TranslationContext = createContext<TranslationContextType>({
  language: "en",
  setLanguage: () => {},
  t: (<K extends TranslationKey>(key: K) =>
    key as unknown as string) as TranslationContextType["t"],
});

// Translation provider props
interface TranslationProviderProps {
  children: ReactNode;
  defaultLanguage?: Language;
}

// Translation provider component
export function TranslationProvider({
  children,
  defaultLanguage = "de",
}: TranslationProviderProps): JSX.Element {
  // Get initial language from localStorage or use default
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("language") as Language;
      return saved && saved in translations ? saved : defaultLanguage;
    }
    return defaultLanguage;
  });

  // Update language and save to localStorage
  const setLanguage = (lang: Language): void => {
    setLanguageState(lang);
    if (typeof window !== "undefined") {
      localStorage.setItem("language", lang);
    }
  };

  // Type-safe translation function with parameter support
  const t = <K extends TranslationKey>(
    key: K,
    params?: TranslationValue<K> extends string
      ? Record<string, string | number>
      : never,
  ): string => {
    // Split the key by dots to access nested properties
    const keys = key.split(".");
    const currentTranslations = translations[language] || translations.en;

    // Navigate through the translations object
    let value: unknown = currentTranslations;
    for (const k of keys) {
      if (value && typeof value === "object" && k in value) {
        value = (value as Record<string, unknown>)[k];
      } else {
        value = undefined;
        break;
      }
    }

    // If translation not found, try fallback language
    if (value === undefined && language !== "en") {
      value = translations.en;
      for (const k of keys) {
        if (value && typeof value === "object" && k in value) {
          value = (value as Record<string, unknown>)[k];
        } else {
          value = undefined;
          break;
        }
      }
    }

    // If still not found, return the key
    if (value === undefined) {
      errorLogger(`Translation key not found: ${key}`);
      return key;
    }

    // Replace parameters in the translation string
    if (params && typeof value === "string") {
      Object.entries(params).forEach(([paramKey, paramValue]) => {
        value = (value as string).replace(
          new RegExp(`{{${paramKey}}}`, "g"),
          String(paramValue),
        );
      });
    }

    return value as string;
  };

  return (
    <TranslationContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </TranslationContext.Provider>
  );
}

// Custom hook to use translations
export function useTranslation(): TranslationContextType {
  const context = useContext(TranslationContext);

  if (!context) {
    throw new Error("useTranslation must be used within a TranslationProvider");
  }

  return context;
}

// Type-safe Trans component for JSX translations
interface TransProps<K extends TranslationKey> {
  i18nKey: K;
  values?: TranslationValue<K> extends string
    ? Record<string, string | number>
    : never;
}

export function Trans<K extends TranslationKey>({
  i18nKey,
  values,
}: TransProps<K>): JSX.Element {
  const { t } = useTranslation();
  return <>{t(i18nKey, values)}</>;
}
