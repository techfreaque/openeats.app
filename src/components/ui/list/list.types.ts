import { type VariantProps } from "class-variance-authority";
import type { CSSProperties, ReactNode, Ref } from "react";

import type { listItemVariants, listVariants } from "./list.core";

export interface BaseListProps {
  children?: ReactNode;
  className?: string | undefined;
  style?: CSSProperties | undefined;
  ordered?: boolean;
}

export interface BaseListItemProps {
  children?: ReactNode;
  className?: string | undefined;
  style?: CSSProperties | undefined;
}

export interface ListProps
  extends BaseListProps,
    VariantProps<typeof listVariants> {
  ref?: Ref<HTMLOListElement | HTMLUListElement>;
}
export interface ListItemProps
  extends BaseListItemProps,
    VariantProps<typeof listItemVariants> {}
