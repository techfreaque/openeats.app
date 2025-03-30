import type { TranslationSchema } from "@/app/translations";

// Utility type to create dot-notation paths for nested objects
type DotPrefix<T extends string> = T extends "" ? "" : `.${T}`;

export type DotNotation<T> = (
  T extends object
    ? {
        [K in Exclude<keyof T, symbol>]: `${K}${DotPrefix<DotNotation<T[K]>>}`;
      }[Exclude<keyof T, symbol>]
    : ""
) extends infer D
  ? Extract<D, string>
  : never;

// Type for all possible translation keys
export type TranslationKey = DotNotation<TranslationSchema>;

// Utility type to get the type of a value at a specific path
type PathValue<T, P extends string> = P extends `${infer K}.${infer Rest}`
  ? K extends keyof T
    ? PathValue<T[K], Rest>
    : never
  : P extends keyof T
    ? T[P]
    : never;

// Type for getting the value type of a translation key
export type TranslationValue<K extends TranslationKey> = PathValue<
  TranslationSchema,
  K
>;
