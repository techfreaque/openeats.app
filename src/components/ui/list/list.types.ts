import { type VariantProps } from "class-variance-authority";
import type { ReactNode } from "react";

import type { listItemVariants, listVariants } from "./list.core";

export interface BaseListProps {
  children?: ReactNode;
  className?: string;
  style?: Record<string, string>;
  ordered?: boolean;
}

export interface BaseListItemProps {
  children?: ReactNode;
  className?: string;
  style?: Record<string, string>;
}

export interface ListProps
  extends BaseListProps,
    VariantProps<typeof listVariants> {}
export interface ListItemProps
  extends BaseListItemProps,
    VariantProps<typeof listItemVariants> {}
