import { type VariantProps } from "class-variance-authority";
import type { ReactNode } from "react";

import type { textVariants } from "./text.core";

export interface BaseTextProps {
  children?: ReactNode;
  className?: string;
  style?: Record<string, string>;
}

export interface TextProps
  extends BaseTextProps,
    VariantProps<typeof textVariants> {}
