"use client";

import type { JSX, ReactNode } from "react";
import React, { createContext, useContext, useState } from "react";

import type { TranslationElement } from "@/translations";
import { Languages, translations } from "@/translations";

import { errorLogger } from "../shared/utils/logger";
import type { TranslationKey, TranslationValue } from "./types";

// Translation context type
interface TranslationContextType {
  language: Languages;
  setLanguage: (lang: Languages) => void;
  t: <K extends TranslationKey>(
    key: K,
    params?: TranslationValue<K> extends string
      ? Record<string, string | number>
      : never,
  ) => string;
}

// Create context with default values
export const TranslationContext = createContext<TranslationContextType>({
  language: Languages.DE,
  setLanguage: () => {},
  t: (<K extends TranslationKey>(key: K) =>
    key as string) as TranslationContextType["t"],
});

// Translation provider props
interface TranslationProviderProps {
  children: ReactNode;
  defaultLanguage?: Languages;
}

// Translation provider component
export function TranslationProvider({
  children,
  defaultLanguage = Languages.DE,
}: TranslationProviderProps): JSX.Element {
  // Get initial language from localStorage or use default
  const [language, setLanguageState] = useState<Languages>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("language") as Languages;
      return saved && saved in translations ? saved : defaultLanguage;
    }
    return defaultLanguage;
  });

  // Update language and save to localStorage
  const setLanguage = (lang: Languages): void => {
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
    const currentTranslations = translations[language] || translations.DE;

    // Navigate through the translations object
    let value: TranslationElement | undefined = currentTranslations;
    for (const k of keys) {
      if (value && typeof value === "object" && k in value) {
        value = value[k] as TranslationElement;
      } else {
        value = undefined;
        break;
      }
    }

    // If translation not found, try fallback language
    if (value === undefined && language !== Languages.DE) {
      value = translations.DE;
      for (const k of keys) {
        if (value && typeof value === "object" && k in value) {
          value = value[k] as TranslationElement;
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
    if (typeof value === "string") {
      let translationValue = value as string;
      if (params) {
        Object.entries(params).forEach(([paramKey, paramValue]) => {
          translationValue = translationValue.replace(
            new RegExp(`{{${paramKey}}}`, "g"),
            String(paramValue),
          );
        });
      }
      return translationValue;
    } else {
      errorLogger(
        `Translation key "${key}" is not a string or params are not provided`,
      );
      return JSON.stringify(value);
    }
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
