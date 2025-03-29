import deTranslations from "./de";
import enTranslations from "./en";
import esTranslations from "./es";
import frTranslations from "./fr";
import zhTranslations from "./zh";
// Translation map

// Define the translation schema type to ensure type safety across all language files using de as default
export type TranslationSchema = typeof deTranslations;

export const translations = {
  de: deTranslations,
  fr: frTranslations,
  en: enTranslations,
  es: esTranslations,
  zh: zhTranslations,
};
