import { type VariantProps } from "class-variance-authority";
import type { ReactNode } from "react";

import type { scrollViewVariants } from "./scroll-view.core";

export interface BaseScrollViewProps {
  children?: ReactNode;
  className?: string;
  style?: Record<string, string | number>;
  horizontal?: boolean;
  showsHorizontalScrollIndicator?: boolean;
  showsVerticalScrollIndicator?: boolean;
}

export interface ScrollViewProps
  extends BaseScrollViewProps,
    VariantProps<typeof scrollViewVariants> {}
