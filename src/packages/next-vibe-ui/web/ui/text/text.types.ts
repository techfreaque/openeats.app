import { type VariantProps } from "class-variance-authority";
import type { CSSProperties, ReactNode } from "react";

import type { textVariants } from "./text.core";

export interface BaseTextProps {
  children?: ReactNode;
  className?: string | undefined;
  style?: CSSProperties | undefined;
}

export interface TextProps
  extends BaseTextProps,
    VariantProps<typeof textVariants> {}
