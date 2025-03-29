import { type VariantProps } from "class-variance-authority";
import type { CSSProperties, ReactNode } from "react";

import type { divVariants } from "./div.core";

export interface BaseDivProps {
  children?: ReactNode;
  className?: string | undefined;
  style?: CSSProperties | undefined;
  onClick?: () => void;
}

export interface DivProps
  extends BaseDivProps,
    VariantProps<typeof divVariants> {}
