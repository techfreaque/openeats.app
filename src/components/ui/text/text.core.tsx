import { cva, type VariantProps } from "class-variance-authority";

// import { Text as NativeText } from "./text.native";
import { Text as WebText } from "./text.web";

export type { TextProps } from "./text.types";

export const textVariants = cva("leading-7 [&:not(:first-child)]:mt-6", {
  variants: {
    variant: {
      default: "",
      lead: "text-xl text-muted-foreground",
      large: "text-lg font-semibold",
      small: "text-sm font-medium leading-none",
      muted: "text-sm text-muted-foreground",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

export type TextVariantProps = VariantProps<typeof textVariants>;

export const Text =
  // envClient.platform.isReactNative ? NativeText :
  WebText;
