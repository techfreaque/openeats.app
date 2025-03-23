import { type VariantProps } from "class-variance-authority";
import type { ReactNode } from "react";

import type { divVariants } from "./div.core";

export interface BaseDivProps {
  children?: ReactNode;
  className?: string;
  style?: Record<string, string>;
  onClick?: () => void;
}

export interface DivProps
  extends BaseDivProps,
    VariantProps<typeof divVariants> {}
