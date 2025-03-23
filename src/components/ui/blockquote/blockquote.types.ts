import { type VariantProps } from "class-variance-authority";
import type { ReactNode } from "react";

import type { blockquoteVariants } from "./blockquote.core";

export interface BaseBlockquoteProps {
  children?: ReactNode;
  className?: string;
  style?: Record<string, string>;
}

export interface BlockquoteProps
  extends BaseBlockquoteProps,
    VariantProps<typeof blockquoteVariants> {}
