import { cva, type VariantProps } from "class-variance-authority";

// import { Div as NativeDiv } from "./div.native";
import { Div as WebDiv } from "./div.web";

export type { DivProps } from "./div.types";

export const divVariants = cva("", {
  variants: {
    variant: {
      default: "",
      card: "bg-card text-card-foreground rounded-lg border shadow-sm",
      transparent: "bg-transparent",
    },
    padding: {
      none: "",
      sm: "p-2",
      md: "p-4",
      lg: "p-6",
    },
    rounded: {
      none: "",
      sm: "rounded-sm",
      md: "rounded-md",
      lg: "rounded-lg",
      full: "rounded-full",
    },
    border: {
      none: "",
      default: "border border-border",
    },
  },
  defaultVariants: {
    variant: "default",
    padding: "none",
    rounded: "none",
    border: "none",
  },
});

export type DivVariantProps = VariantProps<typeof divVariants>;

export const Div =
  // envClient.platform.isReactNative ?
  // NativeDiv
  // :
  WebDiv;
