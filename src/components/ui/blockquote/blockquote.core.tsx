import { cva, type VariantProps } from "class-variance-authority";

// import { Blockquote as NativeBlockquote } from "./blockquote.native";
import { Blockquote as WebBlockquote } from "./blockquote.web";

export type { BlockquoteProps } from "./blockquote.types";

export const blockquoteVariants = cva(
  "mt-6 border-l-2 pl-6 italic text-muted-foreground",
  {
    variants: {
      variant: {
        default: "border-l-border",
        primary: "border-l-primary",
        secondary: "border-l-secondary",
        accent: "border-l-accent",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export type BlockquoteVariantProps = VariantProps<typeof blockquoteVariants>;

export const Blockquote =
  //     envClient.platform.isReactNative
  //   ? NativeBlockquote
  //     :
  WebBlockquote;
