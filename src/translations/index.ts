import deTranslations from "./de";
import enTranslations from "./en";
import esTranslations from "./es";
import frTranslations from "./fr";
import itTranslations from "./it";
import zhTranslations from "./zh";

export enum Countries {
  DE = "DE",
  AT = "AT",
  CH = "CH",
}

export enum Currencies {
  EUR = "EUR",
  CHF = "CHF",
}

export const currencyByCountry = {
  [Countries.DE]: Currencies.EUR,
  [Countries.AT]: Currencies.EUR,
  [Countries.CH]: Currencies.CHF,
} as const;

export enum Languages {
  DE = "DE",
  FR = "FR",
  EN = "EN",
  IT = "IT",
  ES = "ES",
  ZH = "ZH",
}

export type TranslationSchema = typeof deTranslations;
export interface TranslationElement {
  [key: string]: string | TranslationElement;
}

export const translations: {
  [Languages.DE]: TranslationElement;
  [Languages.FR]: TranslationElement;
  [Languages.EN]: TranslationElement;
  [Languages.IT]: TranslationElement;
  [Languages.ES]: TranslationElement;
  [Languages.ZH]: TranslationElement;
} = {
  DE: deTranslations,
  FR: frTranslations,
  EN: enTranslations,
  IT: itTranslations,
  ES: esTranslations,
  ZH: zhTranslations,
};
